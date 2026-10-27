"use client";

import { useId, useState } from "react";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@louez/ui";
import { cn } from "@louez/utils";

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/;
const DEFAULT_COLOR = "#3B82F6";
const COLOR_SUGGESTIONS = [
  "#171717",
  "#FAFAFA",
  "#6B7280",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#92400E",
  "#D6C7A1",
] as const;

interface HsvColor {
  hue: number;
  saturation: number;
  brightness: number;
}

const normalizeHexColor = (value: string) => {
  const normalized = value.startsWith("#") ? value : `#${value}`;
  return normalized.toUpperCase();
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const hexToHsv = (hex: string): HsvColor => {
  const normalized = HEX_COLOR_PATTERN.test(normalizeHexColor(hex))
    ? normalizeHexColor(hex)
    : DEFAULT_COLOR;
  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta > 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }

  return {
    hue: hue < 0 ? hue + 360 : hue,
    saturation: max === 0 ? 0 : (delta / max) * 100,
    brightness: max * 100,
  };
};

const hsvToHex = ({ hue, saturation, brightness }: HsvColor) => {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const normalizedSaturation = clamp(saturation, 0, 100) / 100;
  const normalizedBrightness = clamp(brightness, 0, 100) / 100;
  const chroma = normalizedBrightness * normalizedSaturation;
  const segment = normalizedHue / 60;
  const intermediate = chroma * (1 - Math.abs((segment % 2) - 1));
  const offset = normalizedBrightness - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;
  if (segment < 1) [red, green] = [chroma, intermediate];
  else if (segment < 2) [red, green] = [intermediate, chroma];
  else if (segment < 3) [green, blue] = [chroma, intermediate];
  else if (segment < 4) [green, blue] = [intermediate, chroma];
  else if (segment < 5) [red, blue] = [intermediate, chroma];
  else [red, blue] = [chroma, intermediate];

  return `#${[red, green, blue]
    .map((channel) =>
      Math.round((channel + offset) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
};

export const VariantColorPicker = ({
  value,
  onChange,
  disabled = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) => {
  const t = useTranslations("dashboard.products.form.unitTracking");
  const inputId = useId();
  const normalizedValue = normalizeHexColor(value);
  const [draft, setDraft] = useState<{
    sourceValue: string;
    value: string;
  } | null>(null);
  const draftValue = draft?.sourceValue === normalizedValue ? draft.value : normalizedValue;
  const draftIsValid = HEX_COLOR_PATTERN.test(normalizeHexColor(draftValue));
  const displayedColor = draftIsValid ? normalizeHexColor(draftValue) : normalizedValue;
  const hsvColor = hexToHsv(displayedColor);
  const hueColor = hsvToHex({
    hue: hsvColor.hue,
    saturation: 100,
    brightness: 100,
  });

  const selectColor = (nextColor: string) => {
    const normalized = normalizeHexColor(nextColor);
    setDraft(null);
    onChange(normalized);
  };

  const updateHsvColor = (nextColor: Partial<HsvColor>) => {
    selectColor(hsvToHex({ ...hsvColor, ...nextColor }));
  };

  const updateColorArea = (element: HTMLButtonElement, clientX: number, clientY: number) => {
    const bounds = element.getBoundingClientRect();
    updateHsvColor({
      saturation: clamp((clientX - bounds.left) / bounds.width, 0, 1) * 100,
      brightness: (1 - clamp((clientY - bounds.top) / bounds.height, 0, 1)) * 100,
    });
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("shrink-0", className)}
            disabled={disabled}
            aria-label={t("chooseColor")}
          />
        }
      >
        <span
          className="size-7 rounded-md border border-black/10 shadow-xs dark:border-white/15"
          style={{ backgroundColor: normalizedValue }}
        />
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={10}
        className="w-72 overflow-visible px-4"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <PopoverTitle className="text-sm">{t("presets.color.label")}</PopoverTitle>
              <PopoverDescription className="text-xs">
                {t("colorPickerDescription")}
              </PopoverDescription>
            </div>
            <span
              className="size-9 shrink-0 rounded-lg border border-black/10 shadow-xs dark:border-white/15"
              style={{ backgroundColor: displayedColor }}
            />
          </div>

          <button
            type="button"
            className="ring-ring relative h-40 w-full touch-none cursor-crosshair overflow-hidden rounded-lg border border-black/10 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-white/15"
            style={{ backgroundColor: hueColor }}
            aria-label={t("chooseColor")}
            disabled={disabled}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              updateColorArea(event.currentTarget, event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              updateColorArea(event.currentTarget, event.clientX, event.clientY);
            }}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 10 : 2;
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                updateHsvColor({
                  saturation: hsvColor.saturation - step,
                });
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                updateHsvColor({
                  saturation: hsvColor.saturation + step,
                });
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                updateHsvColor({
                  brightness: hsvColor.brightness + step,
                });
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                updateHsvColor({
                  brightness: hsvColor.brightness - step,
                });
              }
            }}
          >
            <span className="absolute inset-0 bg-[linear-gradient(to_right,#fff,transparent)]" />
            <span className="absolute inset-0 bg-[linear-gradient(to_top,#000,transparent)]" />
            <span
              className="ring-ring pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-offset-1"
              style={{
                left: `${hsvColor.saturation}%`,
                top: `${100 - hsvColor.brightness}%`,
              }}
            />
          </button>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${inputId}-hue`} className="text-xs font-medium">
                {t("colorHue")}
              </label>
              <span className="text-muted-foreground font-mono text-xs">
                {Math.round(hsvColor.hue)}°
              </span>
            </div>
            <input
              id={`${inputId}-hue`}
              type="range"
              min="0"
              max="360"
              value={Math.round(hsvColor.hue)}
              onChange={(event) => updateHsvColor({ hue: Number(event.target.value) })}
              disabled={disabled}
              className="ring-ring h-3 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">{t("presetSuggestions")}</p>
            <div className="grid grid-cols-6 gap-1.5">
              {COLOR_SUGGESTIONS.map((color) => {
                const selected = color === displayedColor;
                return (
                  <button
                    key={color}
                    type="button"
                    className="ring-ring relative aspect-square rounded-md border border-black/10 shadow-xs outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-white/15"
                    style={{ backgroundColor: color }}
                    onClick={() => selectColor(color)}
                    aria-label={color}
                    aria-pressed={selected}
                    disabled={disabled}
                  >
                    {selected && (
                      <Check
                        className={cn(
                          "absolute inset-0 m-auto size-3.5",
                          color === "#FAFAFA" || color === "#D6C7A1" ? "text-black" : "text-white",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={inputId} className="text-xs font-medium">
              {t("hexColor")}
            </label>
            <Input
              id={inputId}
              value={draftValue}
              onChange={(event) => {
                const nextDraft = event.target.value.toUpperCase();
                setDraft({ sourceValue: normalizedValue, value: nextDraft });
                const normalized = normalizeHexColor(nextDraft);
                if (HEX_COLOR_PATTERN.test(normalized)) onChange(normalized);
              }}
              onBlur={() => {
                if (!draftIsValid) setDraft(null);
              }}
              className="h-9 font-mono uppercase"
              aria-invalid={!draftIsValid}
              spellCheck={false}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
