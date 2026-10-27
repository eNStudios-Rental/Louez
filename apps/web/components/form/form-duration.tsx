"use client";

import { useTranslations } from "next-intl";

import { InputDuration, Label } from "@louez/ui";

import { getFieldError, useFieldContext } from "@/hooks/form/form-context";

import { type DurationUnit, useDurationUnitOptions } from "@/components/ui/price-duration-input";

export interface DurationValue {
  duration: number;
  unit: DurationUnit;
}

export function FormDuration({
  label,
  description,
  className,
}: {
  label?: string;
  description?: string;
  className?: string;
}) {
  const t = useTranslations("common");
  const field = useFieldContext<DurationValue>();
  const errors = field.state.meta.errors;
  const error = errors[0];
  const value = field.state.value;
  const units = useDurationUnitOptions(value.duration);

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={field.name} data-error={errors.length > 0}>
          {label}
        </Label>
      )}
      <InputDuration
        value={value.duration}
        onValueCommitted={(duration) => field.handleChange({ ...value, duration })}
        unit={value.unit}
        onUnitChange={(unit) => field.handleChange({ ...value, unit })}
        units={units}
        ariaLabel={label ?? t("duration")}
        aria-invalid={errors.length > 0 || undefined}
        className={className}
      />
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      {error && <p className="text-destructive text-sm">{getFieldError(error)}</p>}
    </div>
  );
}
