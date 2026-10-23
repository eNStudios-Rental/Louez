"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";

import { Loader2, Plus } from "lucide-react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
  Label,
} from "@louez/ui";

import { useFieldContext, getFieldError } from "@/hooks/form/form-context";

const CREATE_OPTION_VALUE = "__create__";

export interface FormComboboxOption {
  value: string;
  label: string;
}

interface ComboboxItemData extends FormComboboxOption {
  kind?: "create";
}

export interface FormComboboxProps {
  label?: string;
  labelHelper?: ReactNode;
  description?: string;
  placeholder?: string;
  emptyText?: string;
  options: FormComboboxOption[];
  /** Multi-select: the field value is a string[] instead of string | null. */
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  /**
   * When provided, typing a value that matches no option offers a create
   * action. Must return the created option's value, or null on failure.
   */
  onCreateOption?: (name: string) => Promise<string | null>;
  isCreatingOption?: boolean;
  /** Label for the create action, e.g. (name) => `Create "${name}"`. */
  getCreateOptionLabel?: (name: string) => string;
  /** Persistent action area rendered below the filtered options. */
  popupFooter?: ReactNode;
}

export const FormCombobox = ({
  label,
  labelHelper,
  description,
  placeholder,
  emptyText,
  options,
  multiple = false,
  disabled = false,
  className,
  onCreateOption,
  isCreatingOption = false,
  getCreateOptionLabel,
  popupFooter,
}: FormComboboxProps) => {
  const field = useFieldContext<string[] | string | null>();
  const errors = field.state.meta.errors;
  const [query, setQuery] = useState("");
  // Names being created, shown as optimistic chips with a loader (multiple mode)
  const [pendingCreations, setPendingCreations] = useState<string[]>([]);

  const items = useMemo<ComboboxItemData[]>(() => {
    const base: ComboboxItemData[] = options.map((option) => ({
      value: option.value,
      label: option.label,
    }));
    const trimmed = query.trim();
    if (
      onCreateOption &&
      trimmed &&
      !base.some((item) => item.label.toLowerCase() === trimmed.toLowerCase())
    ) {
      base.push({ value: CREATE_OPTION_VALUE, label: trimmed, kind: "create" });
    }
    return base;
  }, [options, query, onCreateOption]);

  const itemsByValue = useMemo(
    () => new Map(items.filter((item) => item.kind !== "create").map((item) => [item.value, item])),
    [items],
  );

  const selectedValues: string[] = multiple
    ? Array.isArray(field.state.value)
      ? field.state.value
      : []
    : [];
  const selectedItems = selectedValues.flatMap((value) => {
    const item = itemsByValue.get(value);
    return item ? [item] : [];
  });
  const singleSelectedItem =
    !multiple && typeof field.state.value === "string"
      ? (itemsByValue.get(field.state.value) ?? null)
      : null;

  const createOption = async (name: string): Promise<string | null> => {
    if (!onCreateOption) return null;
    const createdId = await onCreateOption(name);
    if (createdId) setQuery("");
    return createdId;
  };

  const handleMultipleChange = async (next: ComboboxItemData[] | null) => {
    const nextItems = next ?? [];
    const createItem = nextItems.find((item) => item.kind === "create");
    const values = nextItems.filter((item) => item.kind !== "create").map((item) => item.value);

    field.handleChange(values);
    if (!createItem) return;

    // Optimistic: show a pending chip right away, keep the input usable,
    // then commit the created option's value once the creation resolves.
    const name = createItem.label;
    setPendingCreations((prev) => [...prev, name]);
    setQuery("");
    try {
      const createdId = await createOption(name);
      if (createdId) {
        // Functional update: concurrent creations resolve out of order, so
        // append to the value at commit time rather than a stale snapshot.
        field.handleChange((prev) => {
          const current = Array.isArray(prev) ? prev : [];
          return current.includes(createdId) ? current : [...current, createdId];
        });
      }
    } finally {
      setPendingCreations((prev) => {
        const index = prev.indexOf(name);
        return index === -1 ? prev : prev.toSpliced(index, 1);
      });
    }
  };

  const handleSingleChange = async (item: ComboboxItemData | null) => {
    if (!item) {
      field.handleChange(null);
      return;
    }

    if (item.kind === "create") {
      const createdId = await createOption(item.label);
      if (createdId) field.handleChange(createdId);
      return;
    }

    field.handleChange(item.value);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);

  // Enter selects (or creates) the highlighted option — Base UI otherwise lets
  // the event through and the surrounding form submits.
  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.preventDefault();
  };

  const popup = (
    <ComboboxPopup>
      {emptyText && <ComboboxEmpty>{emptyText}</ComboboxEmpty>}
      <ComboboxList>
        {(item: ComboboxItemData) =>
          item.kind === "create" ? (
            <ComboboxItem key={CREATE_OPTION_VALUE} value={item}>
              <span className="text-primary flex items-center gap-1.5 font-medium">
                {isCreatingOption ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {getCreateOptionLabel ? getCreateOptionLabel(item.label) : item.label}
              </span>
            </ComboboxItem>
          ) : (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )
        }
      </ComboboxList>
      {popupFooter && <div className="border-t p-1">{popupFooter}</div>}
    </ComboboxPopup>
  );

  return (
    <div className={className ?? "flex flex-col gap-2"}>
      {label && (
        <Label helper={labelHelper} data-error={errors.length > 0}>
          {label}
        </Label>
      )}
      {multiple ? (
        <Combobox
          items={items}
          multiple
          autoHighlight
          value={selectedItems}
          onValueChange={handleMultipleChange}
        >
          <ComboboxChips showTrigger scrollFade>
            <ComboboxValue>
              {(value: ComboboxItemData[]) => (
                <>
                  {value.map((item) => (
                    <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                  ))}
                  {pendingCreations.map((name, index) => (
                    <span
                      key={`${name}-${index}`}
                      className="bg-accent text-accent-foreground flex shrink-0 items-center gap-1.5 rounded-[calc(var(--radius-md)-1px)] px-2 text-sm font-medium opacity-70 sm:text-xs/(--text-xs--line-height)"
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {name}
                    </span>
                  ))}
                  <ComboboxChipsInput
                    className="w-12"
                    placeholder={
                      value.length === 0 && pendingCreations.length === 0 ? placeholder : undefined
                    }
                    disabled={disabled}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          {popup}
        </Combobox>
      ) : (
        <Combobox
          items={items}
          autoHighlight
          value={singleSelectedItem}
          onValueChange={handleSingleChange}
        >
          <ComboboxInput
            showTrigger
            showClear={Boolean(field.state.value)}
            placeholder={placeholder}
            disabled={disabled || isCreatingOption}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          {popup}
        </Combobox>
      )}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      {errors.length > 0 && (
        <p className="text-destructive text-sm font-medium">{getFieldError(errors[0])}</p>
      )}
    </div>
  );
};
