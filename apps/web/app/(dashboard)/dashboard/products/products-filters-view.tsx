"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge, Tabs, TabsList, TabsTab } from "@louez/ui";
import { formatCurrency } from "@louez/utils";

import { SearchInput } from "@/components/ui/search-input";
import { useStore } from "@/contexts/store-context";
import { useDebounce } from "@/hooks/use-debounce";
import { searchQueries } from "@/lib/queries/search.queries";

import { CategoryFilterCombobox, type CategoryFilterOption } from "./category-filter-combobox";
import { PRODUCT_STATUS_FILTERS, type ProductCounts, type ProductStatusFilter } from "./types";

export interface ProductsFiltersViewProps {
  categories: CategoryFilterOption[];
  counts: ProductCounts;
  isLoadingCategories?: boolean;
  autoFocus?: boolean;
  searchDisabled?: boolean;
  status: ProductStatusFilter;
  categoryIds: string[];
  search: string;
  setStatus: (status: ProductStatusFilter) => void;
  setCategoryIds: (ids: string[]) => void;
  setSearch: (search: string) => void;
}

export const ProductsFiltersView = ({
  categories,
  counts,
  isLoadingCategories = false,
  autoFocus = true,
  searchDisabled = false,
  status,
  categoryIds,
  search,
  setStatus,
  setCategoryIds,
  setSearch,
}: ProductsFiltersViewProps) => {
  const t = useTranslations("dashboard.products");
  const router = useRouter();
  const { currency } = useStore();

  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const trimmedSearch = search.trim();
  const debouncedSearch = useDebounce(trimmedSearch, 180);

  const { data: searchData, isFetching } = useQuery({
    ...searchQueries.global(debouncedSearch),
    enabled: isFocused && debouncedSearch.length >= 1,
    staleTime: 10_000,
  });

  const productSuggestions = searchData?.products ?? [];
  const showSuggestions = isFocused && trimmedSearch.length >= 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const statusOptions = [
    { value: "all", label: t("filters.all") },
    { value: "active", label: t("filters.active") },
    { value: "draft", label: t("filters.draft") },
    { value: "archived", label: t("filters.archived") },
  ] satisfies { value: ProductStatusFilter; label: string }[];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {/* Status filter — same underlined tabs as the reservations page,
          horizontally scrollable when overflowing */}
      <div className="-mx-1 min-w-0 max-w-full overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Tabs
          value={status}
          onValueChange={(value) => {
            const status = PRODUCT_STATUS_FILTERS.find((status) => status === value);
            if (status) setStatus(status);
          }}
        >
          <TabsList variant="underline">
            {statusOptions.map((option) => {
              const isActive = status === option.value;

              return (
                <TabsTab key={option.value} value={option.value}>
                  {option.label}
                  <Badge variant={isActive ? "progress" : "expired"} size="sm">
                    {counts[option.value]}
                  </Badge>
                </TabsTab>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="relative w-full sm:w-64" ref={searchContainerRef}>
        <SearchInput
          disabled={searchDisabled}
          enableShortcut={!searchDisabled}
          groupClassName="w-full"
          value={search}
          maxLength={100}
          onFocus={() => {
            if (trimmedSearch.length >= 1) setIsFocused(true);
          }}
          onChange={(event) => {
            setSearch(event.target.value);
            if (event.target.value.trim().length >= 1) {
              setIsFocused(true);
            } else {
              setIsFocused(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsFocused(false);
            }
          }}
          onClear={() => {
            setSearch("");
            setIsFocused(false);
          }}
          placeholder={t("searchProducts")}
          clearLabel={t("clearSearch")}
        />

        {/* Product Suggestions Dropdown */}
        {showSuggestions && (
          <div
            role="listbox"
            aria-label={t("suggestionsTitle")}
            className="absolute start-0 top-full z-50 mt-1.5 w-full sm:w-80 rounded-xl border border-border/80 bg-popover/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
          >
            {isFetching && productSuggestions.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span>{t("searchingProducts")}</span>
              </div>
            ) : productSuggestions.length > 0 ? (
              <div className="space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {t("suggestionsTitle")}
                </div>
                {productSuggestions.map((item) => {
                  const statusLabel =
                    statusOptions.find((o) => o.value === item.status)?.label ?? item.status;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsFocused(false);
                        router.push(`/dashboard/products/${item.id}`);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg p-2 text-start transition-colors duration-150 hover:bg-muted/80 text-foreground cursor-pointer"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="size-8 rounded-md object-cover shrink-0 border border-border/50 bg-muted"
                        />
                      ) : (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted text-muted-foreground">
                          <Package className="size-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{item.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {item.priceNegotiable
                            ? t("priceNegotiableValue")
                            : formatCurrency(Number(item.price), currency)}
                        </span>
                      </div>
                      {item.status && (
                        <Badge
                          variant={item.status === "active" ? "progress" : "expired"}
                          size="sm"
                          className="shrink-0 text-[10px]"
                        >
                          {statusLabel}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-muted-foreground">
                {t("noProductsFound")}
              </div>
            )}
          </div>
        )}
      </div>

      {(categories.length > 0 || categoryIds.length > 0) && (
        <CategoryFilterCombobox
          autoFocus={autoFocus}
          categories={categories}
          isLoading={isLoadingCategories}
          selectedCategoryIds={categoryIds}
          onChange={setCategoryIds}
        />
      )}
    </div>
  );
};
