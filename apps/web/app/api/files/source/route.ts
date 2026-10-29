import { NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db, products } from "@louez/db";
import { toAbsoluteUrl } from "@louez/utils";
import { MAX_IMAGE_SIZE, getStorageRelativePath, isValidImageUrl } from "@louez/validations";

import { parseTrustedDemoProductImageUrl } from "@/app/api/ai/product-image/enhance/util.product-image-source";
import { env } from "@/env";
import { useLogger, withEvlog } from "@/lib/evlog";
import { getImageFiles } from "@/lib/storage/files";
import { getCurrentStore } from "@/lib/store-context";
import { IMAGE_UPLOAD_MIME_TYPES } from "@/lib/uploads/image-upload";

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const requestSchema = z.object({
  // Absolute bucket URL, or a site-relative "/files/…" path on standalone
  // deployments (same shapes isOwnedImageUrl accepts).
  url: z
    .string()
    .min(1)
    .refine((value) => (value.startsWith("/") && !value.startsWith("//")) || URL.canParse(value)),
  productId: z.string().length(21).optional().nullable(),
});

const handlePost = async (request: Request) => {
  const logger = useLogger();

  try {
    const store = await getCurrentStore();
    if (!store) {
      return NextResponse.json({ error: "errors.unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "errors.invalidData" }, { status: 400 });
    }

    const storagePath = getStorageRelativePath(parsed.data.url);

    let buffer: Buffer;
    let mimeType: string;

    if (storagePath !== null) {
      // 1. Image stored in our bucket (standalone / proxied / S3).
      // Enforce that it belongs to THIS store's product images folder.
      const storePrefix = `${store.id}/products/`;
      if (!storagePath.startsWith(storePrefix)) {
        return NextResponse.json({ error: "errors.forbidden" }, { status: 403 });
      }

      try {
        const files = getImageFiles();
        const stored = await files.download(storagePath);
        buffer = Buffer.from(await stored.arrayBuffer());
        const extension = storagePath.split(".").pop()?.toLowerCase() ?? "";
        mimeType =
          stored.type && IMAGE_UPLOAD_MIME_TYPES.some((allowed) => allowed === stored.type)
            ? stored.type
            : MIME_BY_EXTENSION[extension] ?? "image/jpeg";
      } catch (storageError) {
        logger.error(
          storageError instanceof Error ? storageError : new Error("Storage image download failed"),
        );
        return NextResponse.json({ error: "errors.notFound" }, { status: 404 });
      }
    } else {
      // 2. Image lives outside our storage bucket.
      // Could be a trusted demo product image (Scaleway bucket) or, in development, an external placeholder (e.g. picsum).
      let sourceUrl = toAbsoluteUrl(parsed.data.url, env.NEXT_PUBLIC_APP_URL);
      const trustedDemoUrl = parseTrustedDemoProductImageUrl(sourceUrl);

      if (trustedDemoUrl) {
        if (!parsed.data.productId) {
          return NextResponse.json({ error: "errors.forbidden" }, { status: 403 });
        }

        const product = await db.query.products.findFirst({
          where: and(eq(products.id, parsed.data.productId), eq(products.storeId, store.id)),
          columns: { images: true },
        });
        if (!product?.images?.includes(parsed.data.url)) {
          return NextResponse.json({ error: "errors.forbidden" }, { status: 403 });
        }

        sourceUrl = trustedDemoUrl.toString();
      } else if (env.NODE_ENV === "development" && isValidImageUrl(parsed.data.url)) {
        // Development mode: allow external placeholder images (e.g. seeded picsum.photos)
        if (parsed.data.productId) {
          const product = await db.query.products.findFirst({
            where: and(eq(products.id, parsed.data.productId), eq(products.storeId, store.id)),
            columns: { images: true },
          });
          if (!product?.images?.includes(parsed.data.url)) {
            return NextResponse.json({ error: "errors.forbidden" }, { status: 403 });
          }
        }
      } else {
        return NextResponse.json({ error: "errors.forbidden" }, { status: 403 });
      }

      const sourceResponse = await fetch(sourceUrl, {
        headers: { Accept: IMAGE_UPLOAD_MIME_TYPES.join(",") },
        cache: "no-store",
        redirect: "follow",
        signal: request.signal,
      });

      if (!sourceResponse.ok) {
        return NextResponse.json({ error: "errors.notFound" }, { status: 404 });
      }

      const detectedMimeType = sourceResponse.headers
        .get("content-type")
        ?.split(";")[0]
        ?.toLowerCase();
      if (
        !detectedMimeType ||
        !IMAGE_UPLOAD_MIME_TYPES.some((allowedType) => allowedType === detectedMimeType)
      ) {
        return NextResponse.json({ error: "errors.invalidData" }, { status: 400 });
      }

      mimeType = detectedMimeType;
      buffer = Buffer.from(await sourceResponse.arrayBuffer());
    }

    if (buffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "errors.invalidData" }, { status: 400 });
    }

    return NextResponse.json({
      dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
      mimeType,
      size: buffer.byteLength,
    });
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error("Image source fetch failed"));
    return NextResponse.json({ error: "errors.serverError" }, { status: 500 });
  }
};

export const POST = withEvlog(handlePost);
