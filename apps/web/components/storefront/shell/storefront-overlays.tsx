"use client";

import dynamic from "next/dynamic";

const AdvisorWidget = dynamic(
  () => import("@/components/storefront/advisor/advisor-widget").then((mod) => mod.AdvisorWidget),
  { ssr: false },
);

const CartDrawer = dynamic(
  () => import("@/components/storefront/cart/cart-drawer").then((mod) => mod.CartDrawer),
  { ssr: false },
);

interface StorefrontOverlaysProps {
  advisorEnabled: boolean;
}

/**
 * Client-only overlays (cart drawer, AI advisor). Deferred from SSR to keep
 * heavy interactive bundles off the critical server render and mobile LCP path.
 */
export const StorefrontOverlays = ({ advisorEnabled }: StorefrontOverlaysProps) => (
  <>
    <CartDrawer />
    {advisorEnabled ? <AdvisorWidget /> : null}
  </>
);
