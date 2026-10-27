import "server-only";

import { getPostHogServer, shutdownPostHogServer } from "@/lib/posthog";
import {
  type ProductAnalyticsEvent,
  productAnalyticsBaseProperties,
  productAnalyticsEvents,
  type ReservationAnalyticsAction,
} from "@/lib/product-analytics/analytics-events";

export async function captureProductServerEvent({
  distinctId,
  event,
  properties,
}: {
  distinctId: string | null | undefined;
  event: ProductAnalyticsEvent;
  properties?: Record<string, unknown>;
}) {
  if (!distinctId) return;

  try {
    const posthog = getPostHogServer();
    posthog.capture({
      distinctId,
      event,
      properties: {
        ...productAnalyticsBaseProperties,
        ...properties,
      },
    });
    await shutdownPostHogServer();
  } catch {
    // Product analytics must never block core product flows.
  }
}

export async function captureReservationActionSucceeded({
  distinctId,
  storeId,
  reservationId,
  action,
  properties,
}: {
  distinctId: string | null | undefined;
  storeId: string;
  reservationId: string;
  action: ReservationAnalyticsAction;
  properties?: Record<string, unknown>;
}) {
  await captureProductServerEvent({
    distinctId,
    event: productAnalyticsEvents.reservationActionSucceeded,
    properties: {
      feature: "reservation_management",
      surface: "dashboard",
      source: "server_mutation",
      store_id: storeId,
      reservation_id: reservationId,
      action,
      ...properties,
    },
  });
}

export function toAnalyticsAmountCents(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;

  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) return null;

  return Math.round(amount * 100);
}
