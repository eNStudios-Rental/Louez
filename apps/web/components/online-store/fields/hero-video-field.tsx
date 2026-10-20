"use client";

import { useRef, useState } from "react";

import { useControlsDisabled } from "@louez/ui";
import { Button, Label, Spinner, toastManager } from "@louez/ui";
import { useTranslations } from "next-intl";
import { Video, X } from "lucide-react";

import { HeroVideoUploadValidationError } from "@/hooks/use-hero-video-upload";

import type { PendingImageUploads } from "../use-pending-image-uploads";

interface HeroVideoFieldProps {
  value: string | null;
  savedValue: string | null;
  uploads: PendingImageUploads;
  onChange: (next: string | null) => void;
}

export const HeroVideoField = ({ value, savedValue, uploads, onChange }: HeroVideoFieldProps) => {
  const controlsDisabled = useControlsDisabled();
  const t = useTranslations("dashboard.onlineStore.home");
  const tErrors = useTranslations("errors");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploads.upload("hero-video", file);
      if (value && value !== savedValue) uploads.discard(value);
      onChange(url);
    } catch (error) {
      toastManager.add({
        title:
          error instanceof HeroVideoUploadValidationError
            ? error.issue === "tooLarge"
              ? t("videoTooLarge")
              : t("videoNotMp4")
            : tErrors("generic"),
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const remove = () => {
    if (value !== savedValue) uploads.discard(value);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="hero-video-upload">{t("video")}</Label>
      <input
        ref={fileInputRef}
        id="hero-video-upload"
        type="file"
        accept="video/mp4,.mp4"
        className="sr-only"
        disabled={controlsDisabled || isUploading}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {value ? (
        <div className="group relative overflow-hidden rounded-lg border">
          <video
            src={value}
            muted
            playsInline
            controls
            preload="metadata"
            className="aspect-video w-full bg-muted object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            aria-label={t("removeVideo")}
            className="absolute top-2 right-2"
            disabled={controlsDisabled || isUploading}
            onClick={remove}
          >
            <X aria-hidden />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="hero-video-upload"
          className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          {isUploading ? (
            <Spinner className="size-5 text-primary" />
          ) : (
            <Video aria-hidden className="size-5 text-muted-foreground" />
          )}
          <span className="font-medium text-sm">{t("addVideo")}</span>
        </label>
      )}
      <p className="text-muted-foreground text-xs">{t("videoDescription")}</p>
      {value ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          disabled={controlsDisabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {t("replaceVideo")}
        </Button>
      ) : null}
    </div>
  );
};
