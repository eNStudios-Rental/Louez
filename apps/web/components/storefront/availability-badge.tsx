"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@louez/ui";
import type { StockQuantityLimit } from "@louez/utils";
import { cn } from "@louez/utils";

export type AvailabilityStatus =
  | "available"
  | "limited"
  | "unavailable"
  | "out_of_stock"
  | "required_accessory_out_of_stock"
  | "in_cart";

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  /** Units free for the period; shown for `available` and `limited`. */
  availableQuantity?: StockQuantityLimit;
  className?: string;
}

const ACCENT_BY_STATUS = {
  available: {
    border: "border-badge-success-foreground/60",
    dot: "bg-badge-success-foreground",
  },
  limited: {
    border: "border-badge-warning-foreground/60",
    dot: "bg-badge-warning-foreground",
  },
  unavailable: {
    border: "border-badge-failed-foreground/60",
    dot: "bg-badge-failed-foreground",
  },
  out_of_stock: {
    border: "border-badge-failed-foreground/60",
    dot: "bg-badge-failed-foreground",
  },
  required_accessory_out_of_stock: {
    border: "border-badge-failed-foreground/60",
    dot: "bg-badge-failed-foreground",
  },
  in_cart: {
    border: "border-badge-gray-foreground/60",
    dot: "bg-badge-gray-foreground",
  },
} as const satisfies Record<AvailabilityStatus, { border: string; dot: string }>;

/**
 * How many units a product has left, as a pill: the shared badge over a card
 * image or next to a product title. Its opaque surface keeps the label legible
 * over imagery; the status-colored edge and marker preserve the status cue.
 */
export const AvailabilityBadge = ({
  status,
  availableQuantity = null,
  className,
}: AvailabilityBadgeProps) => {
  const t = useTranslations("storefront.availability.badge");

  const label =
    status === "available"
      ? availableQuantity === null
        ? t("available")
        : availableQuantity === 1
          ? t("lastOne")
          : t("availableCount", { count: availableQuantity })
      : status === "limited"
        ? t("limited", { count: availableQuantity ?? 0 })
        : status === "out_of_stock"
          ? t("outOfStock")
          : status === "required_accessory_out_of_stock"
            ? t("requiredAccessoryOutOfStock")
            : status === "in_cart"
              ? t("inCart")
              : t("unavailable");

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border bg-background px-2 font-semibold text-foreground shadow-sm ring-1 ring-background dark:bg-background",
        ACCENT_BY_STATUS[status].border,
        className,
      )}
      data-slot="availability-badge"
      data-status={status}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", ACCENT_BY_STATUS[status].dot)}
      />
      {label}
    </Badge>
  );
};
