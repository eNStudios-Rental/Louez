"use server";

import { db, stores } from "@louez/db";
import type { StorePrintingLabelTemplate } from "@louez/types";
import { and, eq, ne } from "drizzle-orm";
import sharp from "sharp";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { notifyStoreSettingsUpdated } from "@/lib/discord/platform-notifications";
import { log } from "@/lib/evlog";
import { getCurrentStore, hasPermission } from "@/lib/store-context";

import {
  buildCompanySettingsUpdate,
  buildPrintingLabelTemplateUpdate,
  buildReservationRulesUpdate,
  type CompanySettingsInput,
  type ReservationRulesInput,
} from "./util.store-settings";
import { printingLabelTemplateSchema } from "./printing-labels/util.printing-label-template";

// Slug validation schema
const slugSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug_format_invalid",
  });

const extensionRulesSchema = z.object({
  automaticExtensions: z.boolean(),
  maxExtensionDays: z.number().int().min(1).max(365).nullable(),
});

/** Country, currency and billing address (the "Entreprise" settings page). */
export async function updateCompanySettings(data: CompanySettingsInput) {
  try {
    const store = await getCurrentStore();

    if (!store) {
      return { error: "errors.storeNotFound" };
    }

    if (!hasPermission(store.role, "manage_settings")) {
      return { error: "errors.permissionDenied" };
    }

    await db
      .update(stores)
      .set({
        settings: buildCompanySettingsUpdate(store.settings, data),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, store.id));

    notifyStoreSettingsUpdated({ id: store.id, name: store.name, slug: store.slug }).catch(
      () => {},
    );

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error("settings", `Company settings update failed: ${message}`);
    return { error: "errors.updateSettingsError" };
  }
}

/** Booking mode, durations, buffers and extensions (the "Règles de réservation" page). */
export async function updateReservationRules(data: ReservationRulesInput) {
  try {
    const extensionRules = extensionRulesSchema.safeParse(data);
    if (!extensionRules.success) return { error: "errors.invalidData" };

    const store = await getCurrentStore();

    if (!store) {
      return { error: "errors.storeNotFound" };
    }

    if (!hasPermission(store.role, "manage_settings")) {
      return { error: "errors.permissionDenied" };
    }

    await db
      .update(stores)
      .set({
        settings: buildReservationRulesUpdate(store.settings, data),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, store.id));

    notifyStoreSettingsUpdated({ id: store.id, name: store.name, slug: store.slug }).catch(
      () => {},
    );

    revalidatePath("/dashboard/settings/reservations");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error("settings", `Reservation rules update failed: ${message}`);
    return { error: "errors.updateSettingsError" };
  }
}

export async function getPrintingLabelTemplate(): Promise<StorePrintingLabelTemplate | null> {
  const store = await getCurrentStore();
  if (!store) {
    throw new Error("Store not found");
  }

  const template = store.settings?.printingLabelTemplate;
  if (!template) return null;

  const parsed = printingLabelTemplateSchema.safeParse(template);
  if (!parsed.success) {
    log.error("settings", `Stored printing label template is invalid for store ${store.id}`);
    throw new Error("Stored printing label template is invalid");
  }

  if (
    parsed.data.elements.some(
      (element) => element.type === "image" && !element.key.startsWith(`${store.id}/labels/`),
    )
  ) {
    log.error("settings", `Stored printing label template contains a foreign asset for ${store.id}`);
    throw new Error("Stored printing label template contains an invalid image");
  }

  return parsed.data;
}

export async function generatePrintingLabelQr(referenceNumber: string): Promise<string> {
  const parsedReference = z.string().min(1).max(280).safeParse(referenceNumber);
  if (!parsedReference.success) {
    throw new Error("Invalid label reference number");
  }
  if (!(await getCurrentStore())) {
    throw new Error("Store not found");
  }

  const svg = renderToStaticMarkup(
    createElement(QRCodeSVG, {
      value: parsedReference.data,
      size: 512,
      level: "M",
      marginSize: 2,
      bgColor: "#ffffff",
      fgColor: "#000000",
    }),
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return png.toString("base64");
}

export async function updatePrintingLabelTemplate(data: unknown) {
  try {
    const parsed = printingLabelTemplateSchema.safeParse(data);
    if (!parsed.success) return { error: "errors.invalidData" };

    const store = await getCurrentStore();
    if (!store) {
      return { error: "errors.storeNotFound" };
    }

    if (!hasPermission(store.role, "manage_settings")) {
      return { error: "errors.permissionDenied" };
    }

    const assetPrefix = `${store.id}/labels/`;
    const hasForeignAsset = parsed.data.elements.some(
      (element) => element.type === "image" && !element.key.startsWith(assetPrefix),
    );
    if (hasForeignAsset) {
      return { error: "errors.invalidData" };
    }

    await db
      .update(stores)
      .set({
        settings: buildPrintingLabelTemplateUpdate(store.settings, parsed.data),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, store.id));

    notifyStoreSettingsUpdated({ id: store.id, name: store.name, slug: store.slug }).catch(
      () => {},
    );

    revalidatePath("/dashboard/settings/printing-labels");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error("settings", `Printing label template update failed: ${message}`);
    return { error: "errors.updateSettingsError" };
  }
}

/**
 * Check if a slug is available for the current store
 */
export async function checkSlugAvailability(slug: string): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const store = await getCurrentStore();
    if (!store) {
      return { available: false, error: "errors.storeNotFound" };
    }

    // Validate slug format
    const result = slugSchema.safeParse(slug);
    if (!result.success) {
      return { available: false, error: "errors.slugInvalidFormat" };
    }

    // Check if slug is already taken by another store
    const existingStore = await db.query.stores.findFirst({
      where: and(eq(stores.slug, slug), ne(stores.id, store.id)),
    });

    return { available: !existingStore };
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return { available: false, error: "errors.checkSlugError" };
  }
}

/**
 * Update the store slug (URL)
 */
export async function updateStoreSlug(newSlug: string): Promise<{
  success?: boolean;
  error?: string;
  newSlug?: string;
}> {
  try {
    const store = await getCurrentStore();
    if (!store) {
      return { error: "errors.storeNotFound" };
    }

    if (!hasPermission(store.role, "manage_settings")) {
      return { error: "errors.permissionDenied" };
    }

    // Validate slug format
    const result = slugSchema.safeParse(newSlug);
    if (!result.success) {
      return { error: "errors.slugInvalidFormat" };
    }

    // Check if slug is the same
    if (store.slug === newSlug) {
      return { error: "errors.slugUnchanged" };
    }

    // Check if slug is available
    const existingStore = await db.query.stores.findFirst({
      where: and(eq(stores.slug, newSlug), ne(stores.id, store.id)),
    });

    if (existingStore) {
      return { error: "errors.slugTaken" };
    }

    // Update the slug
    const oldSlug = store.slug;
    await db
      .update(stores)
      .set({
        slug: newSlug,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, store.id));

    // Revalidate all relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/online-store");
    revalidatePath(`/${oldSlug}`);
    revalidatePath(`/${newSlug}`);

    return { success: true, newSlug };
  } catch (error) {
    console.error("Error updating store slug:", error);
    return { error: "errors.updateSlugError" };
  }
}
