import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  like,
  ne,
  notExists,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

const escapeLikePattern = (term: string): string => term.replace(/[\\%_]/g, (char) => `\\${char}`);

import {
  categories,
  db,
  effectiveProductQuantitySql,
  productCategories,
  products,
} from "@louez/db";
import {
  getCategoryDisplayPath,
  getCategoryIdsWithDescendants,
  removeRedundantAssignedCategoryIds,
} from "./category-hierarchy";

export const DASHBOARD_PRODUCT_STATUSES = ["active", "draft", "archived"] as const;

export type DashboardProductStatus = (typeof DASHBOARD_PRODUCT_STATUSES)[number];

export interface DashboardProductsListParams {
  storeId: string;
  status?: "all" | DashboardProductStatus;
  /**
   * Empty (or omitted) means "all categories". Several ids are OR'd together:
   * a product is kept when it belongs to *any* of the selected categories.
   */
  categoryIds?: string[];
  /** Matched against the product name, anywhere in it. */
  search?: string;
  limit?: number;
}

export async function getDashboardProductsList({
  storeId,
  status,
  categoryIds,
  search,
  limit = 100,
}: DashboardProductsListParams) {
  // Scope = store + categories + search. Status is applied on top of it for
  // the table, but not for the counts, so the tabs keep showing how many
  // products each status holds within the current selection.
  const scopeConditions: SQL[] = [eq(products.storeId, storeId)];
  const categoryRows = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      name: categories.name,
    })
    .from(categories)
    .where(eq(categories.storeId, storeId));

  const selectedCategoryIds = categoryIds?.filter(Boolean) ?? [];
  if (selectedCategoryIds.length > 0) {
    const matchingCategoryIds = getCategoryIdsWithDescendants(selectedCategoryIds, categoryRows);
    if (matchingCategoryIds.length === 0) {
      scopeConditions.push(sql`false`);
    } else {
      const directCategoryMatches = db
        .select({ id: productCategories.productId })
        .from(productCategories)
        .where(inArray(productCategories.categoryId, matchingCategoryIds));
      const legacyCategoryMatches = db
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            inArray(products.categoryId, matchingCategoryIds),
            notExists(
              db
                .select({ one: sql`1` })
                .from(productCategories)
                .where(eq(productCategories.productId, products.id)),
            ),
          ),
        );
      const categoryMatch = or(
        inArray(products.id, directCategoryMatches),
        inArray(products.id, legacyCategoryMatches),
      );
      if (categoryMatch) scopeConditions.push(categoryMatch);
    }
  }

  // The column collation already ignores case and accents.
  // Split query into keywords so multi-word searches (e.g. "kask mtb") match across name & description.
  const searchTerm = search?.trim();
  if (searchTerm) {
    const tokens = searchTerm.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      const pattern = `%${escapeLikePattern(token)}%`;
      const matchCondition = or(
        like(products.name, pattern),
        like(sql`COALESCE(${products.description}, '')`, pattern),
      );
      if (matchCondition) {
        scopeConditions.push(matchCondition);
      }
    }
  }

  const conditions = [...scopeConditions];
  if (status && status !== "all") {
    conditions.push(eq(products.status, status));
  }

  const [productIds, statusCounts] = await Promise.all([
    // Step 1: ids only (excludes images to avoid a sort buffer overflow).
    // Order by displayOrder first (manual sorting), then createdAt for new ones.
    db
      .select({ id: products.id })
      .from(products)
      .where(and(...conditions))
      .orderBy(asc(products.displayOrder), desc(products.createdAt))
      .limit(limit),
    db
      .select({ status: products.status, count: count() })
      .from(products)
      .where(and(...scopeConditions))
      .groupBy(products.status),
  ]);

  const counts = { all: 0, active: 0, draft: 0, archived: 0 };
  for (const row of statusCounts) {
    counts.all += row.count;
    if (row.status) {
      counts[row.status] = row.count;
    }
  }

  if (productIds.length === 0) {
    return { products: [], counts };
  }

  // Step 2: full rows for those products only (no ORDER BY, small result set)
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      images: products.images,
      price: products.price,
      priceNegotiable: products.priceNegotiable,
      deposit: products.deposit,
      quantity: effectiveProductQuantitySql(),
      stockKind: products.stockKind,
      status: products.status,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(
      inArray(
        products.id,
        productIds.map((product) => product.id),
      ),
    );

  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const productCategoryRows = await db
    .select({
      productId: productCategories.productId,
      categoryId: productCategories.categoryId,
    })
    .from(productCategories)
    .where(
      inArray(
        productCategories.productId,
        productIds.map((product) => product.id),
      ),
    )
    .orderBy(asc(productCategories.position), asc(productCategories.categoryId));
  const categoriesById = new Map(categoryRows.map((category) => [category.id, category]));
  const categoryIdsByProductId = new Map<string, string[]>();

  for (const link of productCategoryRows) {
    const categoryIdsForProduct = categoryIdsByProductId.get(link.productId) ?? [];
    categoryIdsForProduct.push(link.categoryId);
    categoryIdsByProductId.set(link.productId, categoryIdsForProduct);
  }

  return {
    // Preserve the order from the first query
    products: productIds
      .map(({ id }) => rowsById.get(id))
      .filter((row): row is NonNullable<typeof row> => row !== undefined)
      .map((row) => {
        const assignedCategoryIds = categoryIdsByProductId
          .get(row.id)
          ?.filter((categoryId) => categoriesById.has(categoryId));
        const categoryIds =
          assignedCategoryIds && assignedCategoryIds.length > 0
            ? assignedCategoryIds
            : row.categoryId && categoriesById.has(row.categoryId)
              ? [row.categoryId]
              : [];
        const visibleCategoryIds = removeRedundantAssignedCategoryIds(categoryIds, categoryRows);

        return {
          id: row.id,
          name: row.name,
          images: row.images,
          price: row.price,
          priceNegotiable: row.priceNegotiable,
          deposit: row.deposit,
          quantity: row.quantity,
          stockKind: row.stockKind,
          status: row.status,
          categories: visibleCategoryIds
            .flatMap((categoryId) => {
              const name = getCategoryDisplayPath(categoryId, categoriesById);
              return name ? [{ id: categoryId, name }] : [];
            }),
        };
      }),
    counts,
  };
}

export interface AccessoryCandidatesParams {
  storeId: string;
  /** The product being edited never shows up in its own accessory list. */
  excludeProductId?: string;
}

/**
 * Products a merchant can attach as accessories. Ordered like the dashboard
 * list and the storefront catalog, so the picker shows the shop in the order
 * the merchant arranged it.
 */
export async function getAccessoryCandidates({
  storeId,
  excludeProductId,
}: AccessoryCandidatesParams) {
  const conditions = [eq(products.storeId, storeId), eq(products.status, "active")];
  if (excludeProductId) {
    conditions.push(ne(products.id, excludeProductId));
  }

  return db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      images: products.images,
    })
    .from(products)
    .where(and(...conditions))
    .orderBy(asc(products.displayOrder), desc(products.createdAt));
}

export type AccessoryCandidate = Awaited<ReturnType<typeof getAccessoryCandidates>>[number];

export type DashboardProductsList = Awaited<ReturnType<typeof getDashboardProductsList>>;
