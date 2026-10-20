"use client";

import { useCallback } from "react";

import { useFiles } from "files-sdk/react";

import {
  getHeroVideoUploadIssue,
  type HeroVideoUploadIssue,
} from "@/lib/uploads/hero-video-upload";
import { getImageKeyFromUrl } from "@/lib/uploads/image-upload";

export class HeroVideoUploadValidationError extends Error {
  constructor(readonly issue: HeroVideoUploadIssue) {
    super(issue);
    this.name = "HeroVideoUploadValidationError";
  }
}

export const useHeroVideoUpload = () => {
  const files = useFiles({ endpoint: "/api/files/hero-video" });

  const uploadVideo = useCallback(
    async (file: File) => {
      const issue = getHeroVideoUploadIssue(file);
      if (issue) throw new HeroVideoUploadValidationError(issue);

      const uploaded = await files.upload(file, { contentType: file.type });
      const url = await files.url(uploaded.key);

      return { key: uploaded.key, url, size: uploaded.size, contentType: uploaded.type };
    },
    [files],
  );

  const deleteVideo = useCallback(
    async (keyOrUrl: string | null | undefined) => {
      if (!keyOrUrl) return;

      const key =
        keyOrUrl.includes("://") || keyOrUrl.startsWith("/")
          ? getImageKeyFromUrl(keyOrUrl)
          : keyOrUrl;
      if (!key) return;

      await files.delete(key);
    },
    [files],
  );

  return { uploadVideo, deleteVideo };
};
