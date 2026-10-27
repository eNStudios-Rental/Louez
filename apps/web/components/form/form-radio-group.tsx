"use client";

import { getFieldError } from "@/hooks/form/form-context";
import { Label, RadioGroup } from "@louez/ui";

export type FormRadioGroupProps = React.ComponentProps<typeof RadioGroup> & {
  label?: string;
  helpText?: string;
  errors?: unknown[];
};

export const FormRadioGroup = ({
  label,
  helpText,
  errors = [],
  children,
  ...radioGroupProps
}: FormRadioGroupProps) => {
  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      <RadioGroup {...radioGroupProps}>{children}</RadioGroup>
      {helpText && <p className="text-muted-foreground text-sm">{helpText}</p>}
      {errors.length > 0 && <p className="text-destructive text-sm">{getFieldError(errors[0])}</p>}
    </div>
  );
};
