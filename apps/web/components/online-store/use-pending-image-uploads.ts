"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useImageUpload } from "@/hooks/use-image-upload";
import { useHeroVideoUpload } from "@/hooks/use-hero-video-upload";

export type OnlineStoreImageKind = "logo" | "hero";
export type OnlineStoreUploadKind = OnlineStoreImageKind | "hero-video";

/**
 * Uploads of the online store editor that are not saved yet. Every upload is
 * tracked until the form is saved (`settle`) so an abandoned page, a reset
 * or a replaced asset deletes the orphan file from storage.
 */
export const usePendingImageUploads = () => {
  const logoFiles = useImageUpload("logo");
  const heroFiles = useImageUpload("hero");
  const videoFiles = useHeroVideoUpload();
  const pendingRef = useRef(new Map<string, OnlineStoreUploadKind>());
  const [inFlight, setInFlight] = useState(0);
  const deleteRef = useRef({
    logo: logoFiles.deleteImage,
    hero: heroFiles.deleteImage,
    "hero-video": videoFiles.deleteVideo,
  });

  useEffect(() => {
    deleteRef.current = {
      logo: logoFiles.deleteImage,
      hero: heroFiles.deleteImage,
      "hero-video": videoFiles.deleteVideo,
    };
  }, [heroFiles.deleteImage, logoFiles.deleteImage, videoFiles.deleteVideo]);

  useEffect(
    () => () => {
      void Promise.allSettled(
        [...pendingRef.current].map(([url, kind]) => deleteRef.current[kind](url)),
      );
    },
    [],
  );

  const upload = useCallback(
    async (kind: OnlineStoreUploadKind, file: File): Promise<string> => {
      setInFlight((count) => count + 1);
      try {
        const uploaded =
          kind === "hero-video"
            ? await videoFiles.uploadVideo(file)
            : await (kind === "logo" ? logoFiles : heroFiles).uploadImage(file);
        pendingRef.current.set(uploaded.url, kind);
        return uploaded.url;
      } finally {
        setInFlight((count) => count - 1);
      }
    },
    [heroFiles, logoFiles, videoFiles],
  );

  /** Deletes the file behind `url` if it is a pending upload; saved assets are left alone. */
  const discard = useCallback((url: string | null | undefined) => {
    if (!url) return;
    const kind = pendingRef.current.get(url);
    if (!kind) return;

    pendingRef.current.delete(url);
    void deleteRef.current[kind](url).catch(() => undefined);
  }, []);

  /** After a save: pending uploads are now owned by the store; delete the assets it dropped. */
  const settle = useCallback(
    (replaced: { logos: string[]; heroes: string[]; heroVideos: string[] }) => {
      pendingRef.current.clear();
      void Promise.allSettled([
        ...replaced.logos.map((url) => deleteRef.current.logo(url)),
        ...replaced.heroes.map((url) => deleteRef.current.hero(url)),
        ...replaced.heroVideos.map((url) => deleteRef.current["hero-video"](url)),
      ]);
    },
    [],
  );

  return { upload, discard, settle, isUploading: inFlight > 0 };
};

export type PendingImageUploads = ReturnType<typeof usePendingImageUploads>;
