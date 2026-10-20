import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getHeroVideoUploadIssue,
  hasMp4ContainerSignature,
  MAX_HERO_VIDEO_SIZE,
} from "./hero-video-upload";

test("accepts MP4 video uploads up to 30 MB", () => {
  assert.equal(
    getHeroVideoUploadIssue({ name: "hero.mp4", size: MAX_HERO_VIDEO_SIZE, type: "video/mp4" }),
    null,
  );
});

test("rejects oversized and non-MP4 uploads", () => {
  assert.equal(
    getHeroVideoUploadIssue({
      name: "hero.mp4",
      size: MAX_HERO_VIDEO_SIZE + 1,
      type: "video/mp4",
    }),
    "tooLarge",
  );
  assert.equal(
    getHeroVideoUploadIssue({ name: "hero.mov", size: 100, type: "video/mp4" }),
    "invalidType",
  );
  assert.equal(
    getHeroVideoUploadIssue({ name: "hero.mp4", size: 100, type: "video/quicktime" }),
    "invalidType",
  );
});

test("recognizes the MP4 ftyp container signature", () => {
  assert.equal(
    hasMp4ContainerSignature(new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70])),
    true,
  );
  assert.equal(
    hasMp4ContainerSignature(new Uint8Array([0, 0, 0, 24, 0x52, 0x49, 0x46, 0x46])),
    false,
  );
  assert.equal(hasMp4ContainerSignature(new Uint8Array([0, 0, 0, 24])), false);
});
