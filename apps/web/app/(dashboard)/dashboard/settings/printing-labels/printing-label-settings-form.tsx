"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type {
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import { useRouter } from "next/navigation";

import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { Copy, Hash, ImagePlus, QrCode, Trash2, Type } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import {
  DEFAULT_STORE_PRINTING_LABEL_TEMPLATE,
  type StorePrintingLabelTemplate,
  type StorePrintingLabelTemplateElement,
} from "@louez/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toastManager,
} from "@louez/ui";
import { cn } from "@louez/utils";

import { FloatingSaveBar } from "@/components/dashboard/floating-save-bar";
import { RootError } from "@/components/form/root-error";
import {
  ImageUploadValidationError,
  useImageUpload,
} from "@/hooks/use-image-upload";

import { updatePrintingLabelTemplate } from "../actions";

const PREVIEW_REFERENCE = "REF-2026-001";
const MAX_TEMPLATE_ELEMENTS = 24;

type CanvasInteraction = {
  elementId: string;
  mode: "move" | "resize";
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

interface PrintingLabelSettingsFormProps {
  template: StorePrintingLabelTemplate | null;
}

export const PrintingLabelSettingsForm = ({
  template,
}: PrintingLabelSettingsFormProps) => {
  const router = useRouter();
  const t = useTranslations("dashboard.settings.printingLabels");
  const tErrors = useTranslations("errors");
  const [isPending, startTransition] = useTransition();
  const initialElements = template?.elements ?? DEFAULT_STORE_PRINTING_LABEL_TEMPLATE.elements;
  const [elements, setElements] = useState(initialElements);
  const [savedElements, setSavedElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(initialElements[0]?.id ?? null);
  const [rootError, setRootError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const { uploadImage, isUploading } = useImageUpload("label");

  const selectedElement = elements.find((element) => element.id === selectedId) ?? null;
  const isDirty = JSON.stringify(elements) !== JSON.stringify(savedElements);

  const updateElement = (
    id: string,
    update: (element: StorePrintingLabelTemplateElement) => StorePrintingLabelTemplateElement,
  ) => {
    setElements((current) =>
      current.map((element) => (element.id === id ? update(element) : element)),
    );
  };

  const addElement = (type: "reference" | "qr" | "text") => {
    if (elements.length >= MAX_TEMPLATE_ELEMENTS) return;

    const element: StorePrintingLabelTemplateElement =
      type === "reference"
        ? { id: nanoid(), type, x: 8, y: 30, width: 84, height: 40 }
        : type === "qr"
          ? { id: nanoid(), type, x: 8, y: 12, width: 28, height: 76 }
          : { id: nanoid(), type, text: t("defaultText"), x: 42, y: 35, width: 50, height: 30 };

    setElements((current) => [...current, element]);
    setSelectedId(element.id);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (elements.length >= MAX_TEMPLATE_ELEMENTS) return;
      const uploaded = await uploadImage(file);
      const element: StorePrintingLabelTemplateElement = {
        id: nanoid(),
        type: "image",
        key: uploaded.key,
        url: uploaded.url,
        x: 8,
        y: 18,
        width: 32,
        height: 64,
      };
      setElements((current) => [...current, element]);
      setSelectedId(element.id);
    } catch (error) {
      const message =
        error instanceof ImageUploadValidationError
          ? error.issue === "invalidType"
            ? t("uploadInvalidType")
            : t("uploadTooLarge")
          : t("uploadFailed");
      toastManager.add({ title: message, type: "error" });
    } finally {
      event.target.value = "";
    }
  };

  const beginInteraction = (
    event: ReactPointerEvent<HTMLElement>,
    element: StorePrintingLabelTemplateElement,
    mode: CanvasInteraction["mode"],
  ) => {
    if (event.button !== 0 || !canvasRef.current) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current = {
      elementId: element.id,
      mode,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: element.x,
      startY: element.y,
      startWidth: element.width,
      startHeight: element.height,
    };
    setSelectedId(element.id);
  };

  const moveInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    const canvas = canvasRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId || !canvas) return;

    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const dx = ((event.clientX - interaction.startPointerX) / bounds.width) * 100;
    const dy = ((event.clientY - interaction.startPointerY) / bounds.height) * 100;
    const round = (value: number) => Math.round(value * 10) / 10;

    updateElement(interaction.elementId, (element) => {
      if (interaction.mode === "move") {
        return {
          ...element,
          x: round(Math.min(100 - element.width, Math.max(0, interaction.startX + dx))),
          y: round(Math.min(100 - element.height, Math.max(0, interaction.startY + dy))),
        };
      }

      const minimumSize = element.type === "qr" ? 14 : 5;
      return {
        ...element,
        width: round(
          Math.min(
            100 - interaction.startX,
            Math.max(minimumSize, interaction.startWidth + dx),
          ),
        ),
        height: round(
          Math.min(
            100 - interaction.startY,
            Math.max(minimumSize, interaction.startHeight + dy),
          ),
        ),
      };
    });
  };

  const endInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (interactionRef.current?.pointerId === event.pointerId) {
      interactionRef.current = null;
    }
  };

  const duplicateSelected = () => {
    if (!selectedElement || elements.length >= MAX_TEMPLATE_ELEMENTS) return;
    const duplicate = {
      ...selectedElement,
      id: nanoid(),
      x: Math.min(100 - selectedElement.width, selectedElement.x + 3),
      y: Math.min(100 - selectedElement.height, selectedElement.y + 3),
    };
    setElements((current) => [...current, duplicate]);
    setSelectedId(duplicate.id);
  };

  const removeSelected = () => {
    if (!selectedElement) return;
    setElements((current) => current.filter((element) => element.id !== selectedElement.id));
    setSelectedId(null);
  };

  const saveTemplate = () => {
    setRootError(null);
    startTransition(async () => {
      const result = await updatePrintingLabelTemplate({ version: 1, elements });
      if (result.error) {
        const errorKey = result.error.startsWith("errors.")
          ? result.error.slice("errors.".length)
          : result.error;
        setRootError(tErrors(errorKey));
        return;
      }

      setSavedElements(elements);
      toastManager.add({ title: t("saved"), type: "success" });
      router.refresh();
    });
  };

  const resetTemplate = () => {
    setElements(savedElements);
    setSelectedId(savedElements[0]?.id ?? null);
    setRootError(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <RootError error={rootError} />

      <Card>
        <CardHeader>
          <CardTitle>{t("editorTitle")}</CardTitle>
          <CardDescription>{t("editorDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || elements.length >= MAX_TEMPLATE_ELEMENTS}
              onClick={() => addElement("reference")}
            >
              <Hash className="size-4" />
              {t("addReference")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || elements.length >= MAX_TEMPLATE_ELEMENTS}
              onClick={() => addElement("qr")}
            >
              <QrCode className="size-4" />
              {t("addQr")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || elements.length >= MAX_TEMPLATE_ELEMENTS}
              onClick={() => addElement("text")}
            >
              <Type className="size-4" />
              {t("addText")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || isUploading || elements.length >= MAX_TEMPLATE_ELEMENTS}
              onClick={() => imageInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              {isUploading ? t("uploading") : t("addImage")}
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={handleImageUpload}
              aria-label={t("addImage")}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t("paperSize")}</span>
                <span className="text-muted-foreground">1976411 · 54 × 25 mm</span>
              </div>
              <div
                ref={canvasRef}
                className="relative aspect-[54/25] w-full touch-none overflow-hidden rounded-lg border bg-white shadow-sm"
                onPointerMove={moveInteraction}
                onPointerUp={endInteraction}
                onPointerCancel={endInteraction}
                onClick={(event) => {
                  if (event.target === event.currentTarget) setSelectedId(null);
                }}
              >
                {elements.map((element) => {
                  const isSelected = element.id === selectedId;
                  return (
                    <div
                      key={element.id}
                      role="group"
                      tabIndex={0}
                      aria-label={t(`elementTypes.${element.type}`)}
                      className={cn(
                        "absolute flex select-none items-center justify-center overflow-hidden border border-transparent p-1 text-center text-black",
                        isSelected && "z-10 border-primary ring-2 ring-primary/40",
                        element.type === "reference" && "font-bold",
                        (element.type === "reference" || element.type === "text") &&
                          "[container-type:size]",
                        element.type === "text" && "whitespace-pre-wrap",
                        element.type === "image" && "p-0",
                        "cursor-move",
                      )}
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.width}%`,
                        height: `${element.height}%`,
                      }}
                      onPointerDown={(event) => beginInteraction(event, element, "move")}
                      onKeyDown={(event) => {
                        const step = event.shiftKey ? 5 : 1;
                        const offsets: Record<string, [number, number]> = {
                          ArrowUp: [0, -step],
                          ArrowDown: [0, step],
                          ArrowLeft: [-step, 0],
                          ArrowRight: [step, 0],
                        };
                        const offset = offsets[event.key];
                        if (!offset) return;
                        event.preventDefault();
                        setSelectedId(element.id);
                        updateElement(element.id, (current) => ({
                          ...current,
                          x: Math.min(
                            100 - current.width,
                            Math.max(0, current.x + offset[0]),
                          ),
                          y: Math.min(
                            100 - current.height,
                            Math.max(0, current.y + offset[1]),
                          ),
                        }));
                      }}
                    >
                      {element.type === "reference" ? (
                        <span className="break-all text-[min(18cqw,65cqh)]">
                          {PREVIEW_REFERENCE}
                        </span>
                      ) : element.type === "qr" ? (
                        <QRCodeSVG value={PREVIEW_REFERENCE} className="size-full bg-white p-1" />
                      ) : element.type === "text" ? (
                        <span className="w-full break-words text-[min(16cqw,65cqh)]">
                          {element.text || t("defaultText")}
                        </span>
                      ) : (
                        <Image
                          src={element.url}
                          alt=""
                          fill
                          unoptimized
                          className="object-contain"
                          draggable={false}
                        />
                      )}
                      {isSelected && (
                        <button
                          type="button"
                          aria-label={t("resizeElement")}
                          className="absolute right-0 bottom-0 size-4 cursor-se-resize rounded-tl-sm bg-primary"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            beginInteraction(event, element, "resize");
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{t("dragHint")}</p>
            </div>

            <aside className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("selectedElement")}</h3>
                {selectedElement ? (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("duplicate")}
                      disabled={isPending || elements.length >= MAX_TEMPLATE_ELEMENTS}
                      onClick={duplicateSelected}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("remove")}
                      disabled={isPending}
                      onClick={removeSelected}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </div>

              {selectedElement?.type === "text" ? (
                <label className="block space-y-2 text-sm">
                  <span>{t("textContent")}</span>
                  <textarea
                    value={selectedElement.text}
                    maxLength={280}
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    onChange={(event) =>
                      updateElement(selectedElement.id, (element) =>
                        element.type === "text"
                          ? { ...element, text: event.target.value }
                          : element,
                      )
                    }
                  />
                </label>
              ) : selectedElement ? (
                <p className="text-sm text-muted-foreground">
                  {t(`elementTypes.${selectedElement.type}`)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t("selectHint")}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("elementLimit", { count: MAX_TEMPLATE_ELEMENTS })}
              </p>
            </aside>
          </div>
        </CardContent>
      </Card>

      <FloatingSaveBar
        isDirty={isDirty}
        isLoading={isPending || isUploading}
        onReset={resetTemplate}
        onSubmit={saveTemplate}
      />
    </div>
  );
};
