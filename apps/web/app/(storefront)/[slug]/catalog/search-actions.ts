"use server";

import { and, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db, products } from "@louez/db";

import { getStoreBySlug } from "@/lib/storefront/get-store-by-slug";

const SUGGESTION_LIMIT = 6;

const searchInputSchema = z.object({
  slug: z.string().trim().min(1).max(64),
  query: z.string().trim().min(1).max(120),
});

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  price: string;
  priceNegotiable: boolean;
}

/** Escape LIKE wildcards so user input is treated literally. */
const escapeLikePattern = (term: string): string => term.replace(/[\\%_]/g, (char) => `\\${char}`);

/**
 * Lightweight product search for the storefront typeahead. Returns at most
 * SUGGESTION_LIMIT active products whose name or description matches every
 * whitespace-delimited token. Runs on the server so the full-text scan stays
 * off the client; the debounced call from the header keeps traffic modest.
 */
export const searchStorefrontProducts = async (
  rawInput: z.infer<typeof searchInputSchema>,
): Promise<ProductSuggestion[]> => {
  const input = searchInputSchema.parse(rawInput);
  const store = await getStoreBySlug(input.slug);
  if (!store) return [];

  const tokens = input.query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const conditions = [eq(products.storeId, store.id), eq(products.status, "active")];
  for (const token of tokens) {
    const pattern = `%${escapeLikePattern(token)}%`;
    conditions.push(
      or(like(products.name, pattern), like(sql`COALESCE(${products.description}, '')`, pattern))!,
    );
  }

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      images: products.images,
      price: products.price,
      priceNegotiable: products.priceNegotiable,
    })
    .from(products)
    .where(and(...conditions))
    .orderBy(products.name)
    .limit(SUGGESTION_LIMIT);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.images?.[0] ?? null,
    price: row.price,
    priceNegotiable: row.priceNegotiable,
  }));
};
