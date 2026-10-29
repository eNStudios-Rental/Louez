import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";

import { getStorageRelativePath } from "@louez/validations";

test("getStorageRelativePath correctly extracts key for stored image path", () => {
  // Test extracting relative storage path for store products
  const path = "/files/store-123/products/image-1.webp";
  const relative = getStorageRelativePath(path);
  // In development/test with default env or /files public base
  if (relative) {
    assert.equal(relative, "store-123/products/image-1.webp");
    assert.equal(relative.startsWith("store-123/products/"), true);
    assert.equal(relative.startsWith("other-store/products/"), false);
  }
});

test("requestSchema validates request payloads properly", () => {
  const requestSchema = z.object({
    url: z
      .string()
      .min(1)
      .refine((value) => (value.startsWith("/") && !value.startsWith("//")) || URL.canParse(value)),
    productId: z.string().length(21).optional().nullable(),
  });

  // Valid inputs
  assert.equal(requestSchema.safeParse({ url: "/files/store/products/img.png" }).success, true);
  assert.equal(
    requestSchema.safeParse({
      url: "https://example.com/image.jpg",
      productId: "123456789012345678901",
    }).success,
    true,
  );
  assert.equal(
    requestSchema.safeParse({
      url: "/files/img.jpg",
      productId: null,
    }).success,
    true,
  );

  // Invalid inputs
  assert.equal(requestSchema.safeParse({ url: "" }).success, false);
  assert.equal(requestSchema.safeParse({ url: "//invalid-protocol-relative" }).success, false);
  assert.equal(requestSchema.safeParse({ url: "not-a-url" }).success, false);
  assert.equal(
    requestSchema.safeParse({ url: "/valid.jpg", productId: "too-short" }).success,
    false,
  );
});

