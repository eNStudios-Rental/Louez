import assert from "node:assert/strict";
import { test } from "node:test";

import { getYouTubeEmbedUrl, getYouTubeVideoId, isValidYouTubeVideoUrl } from "./video";

const videoId = "AbCdEfGhI_1";

test("extracts ids from supported YouTube link formats", () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtube.com/watch?feature=share&v=${videoId}`,
    `https://youtu.be/${videoId}?t=10`,
    `https://www.youtube.com/shorts/${videoId}`,
    `https://youtube.com/embed/${videoId}`,
    `https://m.youtube.com/live/${videoId}`,
  ]) {
    assert.equal(getYouTubeVideoId(url), videoId);
    assert.equal(isValidYouTubeVideoUrl(url), true);
  }
});

test("rejects non-YouTube URLs and malformed video ids", () => {
  for (const url of [
    "https://youtube.com.evil.example/watch?v=AbCdEfGhI_1",
    `https://example.com/${videoId}`,
    `https://youtube.com/watch?v=${videoId.slice(1)}`,
    `https://youtube.com:8443/watch?v=${videoId}`,
    `javascript://youtube.com/watch?v=${videoId}`,
    `https://user@youtube.com/watch?v=${videoId}`,
    "not a URL",
  ]) {
    assert.equal(getYouTubeVideoId(url), null);
    assert.equal(isValidYouTubeVideoUrl(url), false);
  }
});

test("builds privacy-enhanced muted looping embed URLs", () => {
  const autoplay = new URL(getYouTubeEmbedUrl(`https://youtu.be/${videoId}`, true) ?? "");
  assert.equal(autoplay.origin, "https://www.youtube-nocookie.com");
  assert.equal(autoplay.pathname, `/embed/${videoId}`);
  assert.equal(autoplay.searchParams.get("autoplay"), "1");
  assert.equal(autoplay.searchParams.get("cc_load_policy"), "0");
  assert.equal(autoplay.searchParams.get("mute"), "1");
  assert.equal(autoplay.searchParams.get("loop"), "1");
  assert.equal(autoplay.searchParams.get("controls"), "0");
  assert.equal(autoplay.searchParams.get("disablekb"), "1");
  assert.equal(autoplay.searchParams.get("enablejsapi"), "1");
  assert.equal(autoplay.searchParams.get("fs"), "0");
  assert.equal(autoplay.searchParams.get("iv_load_policy"), "3");
  assert.equal(autoplay.searchParams.get("playsinline"), "1");
  assert.equal(autoplay.searchParams.get("playlist"), videoId);

  const reducedMotion = new URL(
    getYouTubeEmbedUrl(`https://youtube.com/watch?v=${videoId}`, false) ?? "",
  );
  assert.equal(reducedMotion.searchParams.get("autoplay"), "0");
  assert.equal(reducedMotion.searchParams.get("controls"), "0");
});

test("does not create an embed URL from an invalid link", () => {
  assert.equal(getYouTubeEmbedUrl("https://example.com/video", true), null);
});
