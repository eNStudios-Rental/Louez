"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@louez/utils";

import {
  ALL_CATEGORIES_VALUE,
  UNCATEGORIZED_CATEGORY_VALUE,
} from "@/lib/storefront/catalog.constants";
import type { BrowsableCategory, CategoryAvailableCounts } from "@/lib/utils/util.rental-browse";

interface CatalogCategoryListProps {
  categories: readonly BrowsableCategory[];
  /** Active products with no category; adds the "Autres" row above zero. */
  uncategorizedCount: number;
  /** Every active product of the store, for the "all" row. */
  totalCount: number;
  /** What the browsed period can still book, per row; null shows plain totals. */
  availableCounts: CategoryAvailableCounts | null;
  /** The `?category=` value, or null for the whole catalog. */
  selected: string | null;
  onSelect: (category: string | null) => void;
  className?: string;
}

/**
 * The category column of the sidebar: the whole catalog first, then each
 * populated category, then "Autres". Every row carries its product count,
 * the way a shop's left rail does; once dates are known it reads
 * "available / total", and a row nothing can be booked from fades.
 */
export const CatalogCategoryList = ({
  categories,
  uncategorizedCount,
  totalCount,
  availableCounts,
  selected,
  onSelect,
  className,
}: CatalogCategoryListProps) => {
  const t = useTranslations("storefront");
  const isAllSelected = selected === null || selected === ALL_CATEGORIES_VALUE;

  const categoryRows = useMemo(() => {
    // Separate root categories and map children
    const roots = categories.filter((c) => !c.parentId);
    const childrenByParent = new Map<string, BrowsableCategory[]>();
    for (const c of categories) {
      if (c.parentId) {
        const list = childrenByParent.get(c.parentId) ?? [];
        list.push(c);
        childrenByParent.set(c.parentId, list);
      }
    }

    const result: Array<{
      id: string;
      label: string;
      count: number;
      available: number | null;
      isSelected: boolean;
      level: number;
    }> = [];

    const addCategory = (category: BrowsableCategory, level: number) => {
      if (category.productCount > 0) {
        result.push({
          id: category.id,
          label: category.name,
          count: category.productCount,
          available: availableCounts?.byCategoryId.get(category.id) ?? null,
          isSelected: selected === category.id,
          level,
        });
      }
      const children = childrenByParent.get(category.id) ?? [];
      for (const child of children) {
        addCategory(child, level + 1);
      }
    };

    for (const root of roots) {
      addCategory(root, 0);
    }

    // Include any categories whose parent wasn't found in roots
    for (const c of categories) {
      if (c.parentId && !categories.some((p) => p.id === c.parentId) && c.productCount > 0) {
        if (!result.some((r) => r.id === c.id)) {
          result.push({
            id: c.id,
            label: c.name,
            count: c.productCount,
            available: availableCounts?.byCategoryId.get(c.id) ?? null,
            isSelected: selected === c.id,
            level: 0,
          });
        }
      }
    }

    return result;
  }, [categories, availableCounts, selected]);

  const rows = [
    {
      id: null,
      label: t("catalog.allCategories"),
      count: totalCount,
      available: availableCounts?.total ?? null,
      isSelected: isAllSelected,
      level: 0,
    },
    ...categoryRows,
    ...(uncategorizedCount > 0
      ? [
          {
            id: UNCATEGORIZED_CATEGORY_VALUE,
            label: t("availability.categoryBrowse.others"),
            count: uncategorizedCount,
            available: availableCounts?.uncategorized ?? null,
            isSelected: selected === UNCATEGORIZED_CATEGORY_VALUE,
            level: 0,
          },
        ]
      : []),
  ];

  return (
    <ul
      aria-label={t("catalog.categories")}
      className={cn("flex flex-col gap-0.5", className)}
      data-slot="catalog-category-list"
    >
      {rows.map((row) => {
        const isExhausted = row.available === 0;
        return (
          <li key={row.id ?? ALL_CATEGORIES_VALUE}>
            <button
              type="button"
              aria-current={row.isSelected ? "true" : undefined}
              onClick={() => onSelect(row.id)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors lg:py-2",
                row.level > 0 && "pl-6 text-xs text-muted-foreground",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                row.isSelected ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
                isExhausted && !row.isSelected && "opacity-60",
              )}
            >
              <span className="min-w-0 truncate">
                {row.level > 0 && <span className="mr-1.5 opacity-60">↳</span>}
                {row.label}
              </span>
              <span
                className="shrink-0 text-xs tabular-nums text-muted-foreground"
                aria-label={
                  row.available === null
                    ? undefined
                    : t("catalog.availableOfTotal", { available: row.available, total: row.count })
                }
              >
                {row.available === null ? row.count : `${row.available} / ${row.count}`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
