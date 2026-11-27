import assert from "node:assert/strict";
import { test } from "node:test";

import { scopePrintingLabelImageKey } from "./util.printing-label-template";

test("scopes Files SDK relative image keys to the current store's label folder", () => {
  assert.equal(scopePrintingLabelImageKey("photo.png", "store-123"), "store-123/labels/photo.png");
});

test("keeps image keys already scoped to the current store", () => {
  assert.equal(
    scopePrintingLabelImageKey("store-123/labels/photo.png", "store-123"),
    "store-123/labels/photo.png",
  );
});

test("rejects a fully qualified image key from another store", () => {
  assert.equal(scopePrintingLabelImageKey("other-store/labels/photo.png", "store-123"), null);
});

test("rejects image keys that do not match the upload key format", () => {
  assert.equal(scopePrintingLabelImageKey("../other-store/photo.png", "store-123"), null);
});
