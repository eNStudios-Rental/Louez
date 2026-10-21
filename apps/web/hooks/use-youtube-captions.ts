"use client";

import { useEffect, useRef } from "react";

import { log } from "evlog/next/client";

import { disableYouTubeCaptions } from "./util.youtube-captions";

interface YouTubePlayer {
  destroy: () => void;
  getOptions: () => string[];
  unloadModule: (moduleName: string) => void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
}

interface YouTubeIframeApi {
  Player: new (
    iframe: HTMLIFrameElement,
    options: {
      events: {
        onApiChange: (event: YouTubePlayerEvent) => void;
        onReady: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeIframeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeIframeApi> | null = null;

const loadYouTubeIframeApi = (): Promise<YouTubeIframeApi> => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeIframeApi>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        previousCallback?.();
      } finally {
        if (window.YT?.Player) {
          resolve(window.YT);
        } else {
          reject(new Error("YouTube IFrame API loaded without a player constructor"));
        }
      }
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.onYouTubeIframeAPIReady = previousCallback;
      reject(new Error("Failed to load YouTube IFrame API"));
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
};

export const useYouTubeCaptionsDisabled = (active: boolean) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!active || !iframe) return;

    let player: YouTubePlayer | null = null;
    let disposed = false;

    void loadYouTubeIframeApi()
      .then((api) => {
        if (disposed) return;

        player = new api.Player(iframe, {
          events: {
            onApiChange: ({ target }) => disableYouTubeCaptions(target),
            onReady: ({ target }) => disableYouTubeCaptions(target),
          },
        });
      })
      .catch((error: unknown) => {
        if (!disposed) {
          log.error({ action: "youtube_captions_disable_failed", error: String(error) });
        }
      });

    return () => {
      disposed = true;
      player?.destroy();
    };
  }, [active]);

  return iframeRef;
};
