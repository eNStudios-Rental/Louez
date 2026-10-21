"use client";

import { useEffect, useRef } from "react";

import { log } from "evlog/next/client";

import { disableYouTubeCaptions } from "./util.youtube-captions";

interface YouTubePlayer {
  destroy: () => void;
  getOptions: () => string[];
  unloadModule: (moduleName: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
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
  const playerRef = useRef<YouTubePlayer | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let disposed = false;

    if (playerRef.current) {
      if (active) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } else if (active) {
      void loadYouTubeIframeApi()
        .then((api) => {
          if (disposed) return;

          playerRef.current = new api.Player(iframe, {
            events: {
              onApiChange: ({ target }) => disableYouTubeCaptions(target),
              onReady: ({ target }) => {
                disableYouTubeCaptions(target);
                if (activeRef.current) {
                  target.playVideo();
                } else {
                  target.pauseVideo();
                }
              },
            },
          });
        })
        .catch((error: unknown) => {
          if (!disposed) {
            log.error({ action: "youtube_captions_disable_failed", error: String(error) });
          }
        });
    }

    return () => {
      disposed = true;
      const player = playerRef.current;
      player?.pauseVideo();

      // The IFrame API's destroy() removes the iframe from the DOM. React owns
      // this node, so only destroy after React has detached it (not whenever
      // the carousel switches slides).
      window.setTimeout(() => {
        if (player && !iframe.isConnected && playerRef.current === player) {
          playerRef.current = null;
          player.destroy();
        }
      }, 0);
    };
  }, [active]);

  return iframeRef;
};
