"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@louez/ui";

import { Price } from "@/components/storefront/ui/price";
import { StickyActionBar } from "@/components/storefront/ui/sticky-action-bar";

interface StickyBookingBarProps {
  amount: number;
  /** Copy shown instead of an amount when the final price is unknown. */
  priceText?: string | null;
  /** Period suffix for a base rate ("jour"); omitted for a computed total. */
  per?: string | null;
  /** Plain suffix ("Forfait"). */
  label?: string | null;
  ctaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  /** Why the button is blocked; shown instead of dimming it. */
  blockedReason?: string | null;
  className?: string;
}

/**
 * Phone-only bar pinned to the bottom of the page: the price on the left,
 * the one action on the right. Hidden at `lg`, where the panel's own
 * button is on screen.
 */
export const StickyBookingBar = ({
  amount,
  priceText,
  per,
  label,
  ctaLabel,
  onClick,
  disabled = false,
  blockedReason,
  className,
}: StickyBookingBarProps) => {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => setPortalTarget(document.body), []);

  if (!portalTarget) return null;

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="h-[calc(--spacing(24)+env(safe-area-inset-bottom,0px))] shrink-0 lg:hidden"
      />
      <StickyActionBar desktop="hidden" placement="fixed" className={className}>
        <div className="flex min-w-0 flex-1 flex-col">
          {priceText ? (
            <span className="text-lg font-semibold text-primary">{priceText}</span>
          ) : (
            <Price amount={amount} per={per} label={label} size="lg" tone="primary" />
          )}
          {blockedReason ? (
            <span className="truncate text-xs text-muted-foreground">{blockedReason}</span>
          ) : null}
        </div>
        <Button size="xl" className="flex-1" onClick={onClick} disabled={disabled}>
          {ctaLabel}
        </Button>
      </StickyActionBar>
    </>,
    portalTarget,
  );
};
