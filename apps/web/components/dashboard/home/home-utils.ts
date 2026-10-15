import type { HomeReservation } from "./home-types";

/** Revenue growth in percent, or `null` when there is nothing to compare to. */
export const calculateGrowth = (current: number, previous: number): number | null => {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }

  return Math.round(((current - previous) / previous) * 100);
};

/** Two-letter avatar initials for a reservation's customer. */
export const getCustomerInitials = ({ customer }: HomeReservation): string => {
  const initials = `${customer.firstName?.charAt(0) ?? ""}${customer.lastName?.charAt(0) ?? ""}`;
  const fallback = customer.companyName?.slice(0, 2) ?? "";

  return (initials || fallback || "?").toUpperCase();
};

const MAX_LISTED_PRODUCTS = 2;

/** First product names of a reservation plus how many are left out. */
export const summarizeProducts = ({ items }: HomeReservation) => {
  const names = items
    .map((item) => item.product?.name)
    .filter((name): name is string => Boolean(name));

  return {
    names: names.slice(0, MAX_LISTED_PRODUCTS),
    remainingCount: Math.max(0, items.length - MAX_LISTED_PRODUCTS),
  };
};
