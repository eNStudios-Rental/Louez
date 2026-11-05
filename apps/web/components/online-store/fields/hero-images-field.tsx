"use client";

import { useControlsDisabled } from "@louez/ui";

import { useState } from "react";

import { useTranslations } from "next-intl";

import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  Input,
  Label,
  Spinner,
  toastManager,
} from "@louez/ui";
import { ImageIcon, PlusIcon } from "@louez/ui/icons";
import { Tag, X } from "lucide-react";

import { ImageUploadValidationError } from "@/hooks/use-image-upload";
import { IMAGE_UPLOAD_MIME_TYPES } from "@/lib/uploads/image-upload";

import type { PendingImageUploads } from "../use-pending-image-uploads";
import { MAX_HERO_IMAGES } from "../util.online-store-form";

interface HeroImagesFieldProps {
  value: string[];
  /** The saved images: never deleted from storage before the form is saved. */
  savedValue: string[];
  uploads: PendingImageUploads;
  onChange: (next: string[]) => void;
  alts?: Record<string, string>;
  onAltsChange?: (next: Record<string, string>) => void;
}

/** Up to five photos as a grid of tiles; the first one is the one the page loads first. */
export const HeroImagesField = ({
  value,
  savedValue,
  uploads,
  onChange,
  alts = {},
  onAltsChange,
}: HeroImagesFieldProps) => {
  const controlsDisabled = useControlsDisabled();
  const t = useTranslations("dashboard.settings.appearanceSettings");
  const tHome = useTranslations("dashboard.onlineStore.home");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [isUploading, setIsUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState("");
  const canAdd = value.length < MAX_HERO_IMAGES && !isUploading;

  const handleFiles = async (fileList: FileList | null) => {
    const files = [...(fileList ?? [])].slice(0, MAX_HERO_IMAGES - value.length);
    if (files.length === 0) return;

    setIsUploading(true);
    const results = await Promise.all(
      files.map((file) =>
        uploads.upload("hero", file).catch((error: unknown) => {
          toastManager.add({
            title:
              error instanceof ImageUploadValidationError
                ? error.issue === "tooLarge"
                  ? t("fileTooLarge")
                  : t("fileNotImage")
                : tErrors("generic"),
            type: "error",
          });
          return null;
        }),
      ),
    );
    setIsUploading(false);

    const urls = results.filter((url): url is string => url !== null);
    if (urls.length > 0) onChange([...value, ...urls]);
  };

  const remove = (image: string) => {
    if (!savedValue.includes(image)) uploads.discard(image);
    onChange(value.filter((current) => current !== image));
  };

  const input = (
    <input
      id="hero-images-upload"
      type="file"
      accept={IMAGE_UPLOAD_MIME_TYPES.join(",")}
      multiple
      className="sr-only"
      disabled={controlsDisabled || !canAdd}
      onChange={(event) => {
        void handleFiles(event.target.files);
        event.target.value = "";
      }}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="hero-images-upload">{tHome("photos")}</Label>
        <span className="text-muted-foreground text-xs tabular-nums">
          {value.length}/{MAX_HERO_IMAGES}
        </span>
      </div>

      {value.length === 0 && !isUploading ? (
        <label
          htmlFor="hero-images-upload"
          className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <ImageIcon aria-hidden className="size-5 text-muted-foreground" />
          <span className="font-medium text-sm">{t("addHeroImages")}</span>
          {input}
        </label>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {value.map((image, index) => (
            <div
              key={image}
              className="group relative aspect-4/3 overflow-hidden rounded-lg border"
            >
              <img src={image} alt={alts[image] || ""} className="h-full w-full object-cover" />
              {index === 0 ? (
                <span className="absolute bottom-1 left-1 rounded bg-background/90 px-1.5 py-0.5 font-medium text-[10px]">
                  {t("heroImagesFirst")}
                </span>
              ) : null}
              {alts[image] ? (
                <span
                  className="absolute bottom-1 right-1 rounded bg-background/90 px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground"
                  title={`ALT: ${alts[image]}`}
                >
                  ALT
                </span>
              ) : null}
              <div className="absolute top-1 right-1 z-10 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  aria-label="Edytuj tekst alternatywny (ALT)"
                  className="bg-background/90 shadow-xs backdrop-blur-sm"
                  onClick={() => {
                    setEditingImage(image);
                    setEditingAlt(alts[image] ?? "");
                  }}
                >
                  <Tag aria-hidden className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  aria-label={t("removeImage")}
                  onClick={() => remove(image)}
                >
                  <X aria-hidden />
                </Button>
              </div>
            </div>
          ))}
          {isUploading ? (
            <div className="flex aspect-4/3 items-center justify-center rounded-lg border border-dashed border-primary/50 bg-primary/5">
              <Spinner className="size-5 text-primary" />
            </div>
          ) : null}
          {canAdd ? (
            <label
              htmlFor="hero-images-upload"
              className="flex aspect-4/3 cursor-pointer items-center justify-center rounded-lg border border-dashed transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <PlusIcon aria-hidden className="size-4 text-muted-foreground" />
              <span className="sr-only">{t("addHeroImages")}</span>
              {input}
            </label>
          ) : null}
        </div>
      )}

      <Dialog open={editingImage !== null} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogPanel>
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>Tekst alternatywny (ALT / SEO)</DialogTitle>
              <DialogDescription>
                Opis zdjęcia wyświetlany robotom wyszukiwarek (SEO) i czytnikom ekranu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="hero-image-alt-input">Tekst ALT</Label>
              <Input
                id="hero-image-alt-input"
                value={editingAlt}
                onChange={(e) => setEditingAlt(e.target.value)}
                placeholder="np. Wypożyczalnia sprzętu budowlanego i ogrodniczego w Krakowie"
                maxLength={255}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (editingImage) {
                      onAltsChange?.({ ...alts, [editingImage]: editingAlt.trim() });
                      setEditingImage(null);
                    }
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingImage(null)}>
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (editingImage) {
                    onAltsChange?.({ ...alts, [editingImage]: editingAlt.trim() });
                    setEditingImage(null);
                  }
                }}
              >
                {tCommon("save")}
              </Button>
            </DialogFooter>
          </DialogPopup>
        </DialogPanel>
      </Dialog>
    </div>
  );
};
