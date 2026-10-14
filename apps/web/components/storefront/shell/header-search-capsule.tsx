"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { HeaderSearchCapsuleView } from "@/components/storefront/shell/header-search-capsule-view";
import { useCartActions, useCartState } from "@/contexts/cart-context";
import { useStore } from "@/contexts/store-context";
import { useStorefrontSearch } from "@/contexts/storefront-search-context";
import { resolveStorefrontHref } from "@/lib/util.storefront-href";
import { parseRentalPeriod, type RentalPeriodRules } from "@/lib/utils/util.rental-period";
import {
  searchStorefrontProducts,
  type ProductSuggestion,
} from "@/app/(storefront)/[slug]/catalog/search-actions";

interface HeaderSearchCapsuleProps {
  rules: RentalPeriodRules;
  className?: string;
}

/** Connect the shared header controls to the storefront search, cart, and product suggestions. */
export const HeaderSearchCapsule = ({ rules, className }: HeaderSearchCapsuleProps) => {
  const router = useRouter();
  const { storeSlug, currency, basePath } = useStore();
  const { draft, setDraft, clear, submit } = useStorefrontSearch();
  const { period } = useCartState();
  const { setPeriod, setPricingMode } = useCartActions();

  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useDebouncedCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || !storeSlug) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    try {
      const results = await searchStorefrontProducts({ slug: storeSlug, query: trimmed });
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 180);

  useEffect(() => () => fetchSuggestions.cancel(), [fetchSuggestions]);

  const handleQueryChange = (value: string) => {
    setDraft(value);
    if (value.trim()) {
      setIsLoading(true);
      fetchSuggestions(value);
    } else {
      fetchSuggestions.cancel();
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    fetchSuggestions.cancel();
    setSuggestions([]);
    setIsLoading(false);
    clear();
  };

  const handleSelectSuggestion = (suggestion: ProductSuggestion) => {
    setSuggestions([]);
    setIsLoading(false);
    const path = `/product/${suggestion.slug ?? suggestion.id}`;
    router.push(resolveStorefrontHref(basePath ?? "", path));
  };

  return (
    <HeaderSearchCapsuleView
      rules={rules}
      className={className}
      query={draft}
      currency={currency}
      suggestions={suggestions}
      isLoadingSuggestions={isLoading}
      period={period ? parseRentalPeriod(period.startDate, period.endDate) : null}
      onQueryChange={handleQueryChange}
      onClear={handleClear}
      onSubmit={submit}
      onSelectSuggestion={handleSelectSuggestion}
      onPeriodChange={(next) => {
        setPricingMode(rules.pricingMode);
        setPeriod(next.start.toISOString(), next.end.toISOString());
      }}
    />
  );
};
