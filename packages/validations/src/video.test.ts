import assert from "node:assert/strict";
import { test } from "node:test";

import { isOwnedVideoUrl, isValidVideoUrl, MAX_HERO_VIDEO_SIZE } from "./video";
import { env } from "./env";

test("limits hero video uploads to 30 MB", () => {
  assert.equal(MAX_HERO_VIDEO_SIZE, 30 * 1024 * 1024);
});

test("accepts only stored MP4 files owned by the store", () => {
  const base = env.S3_PUBLIC_URL.replace(/\/+$/, "");
  const videoUrl = `${base}/store-id/hero-video/clip.mp4`;

  assert.equal(isValidVideoUrl(videoUrl), true);
  assert.equal(isOwnedVideoUrl(videoUrl, "store-id/hero-video"), true);
  assert.equal(isOwnedVideoUrl(videoUrl, "another-store/hero-video"), false);
  assert.equal(isValidVideoUrl(`${base}/store-id/hero-video/clip.mov`), false);
  assert.equal(isValidVideoUrl("data:video/mp4;base64,AAAA"), false);
});
