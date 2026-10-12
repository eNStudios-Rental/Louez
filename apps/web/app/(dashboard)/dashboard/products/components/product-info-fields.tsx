"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";

import { ChevronRight, FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, Label } from "@louez/ui";
import { AI_ADVISOR_PRODUCT_CONTEXT_MAX_LENGTH } from "@louez/validations";

import { CategoryManagerDrawer } from "@/components/categories/category-manager-drawer";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { getFieldError } from "@/hooks/form/form-context";

import type { Category, ProductFormComponentApi } from "../types";

export interface ProductInfoFieldsProps {
  form: ProductFormComponentApi;
  showAiContext: boolean;
  categories: Category[];
  onCreateCategory: (name: string) => Promise<string | null>;
  isCreatingCategory: boolean;
  onNameInputChange?: (
    event: ChangeEvent<HTMLInputElement>,
    handleChange: (value: string) => void,
  ) => void;
}

export function ProductInfoFields({
  form,
  showAiContext,
  categories,
  onCreateCategory,
  isCreatingCategory,
  onNameInputChange,
}: ProductInfoFieldsProps) {
  const t = useTranslations("dashboard.products.form");
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="grid items-center gap-5 sm:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.Input
              label={t("name")}
              placeholder={t("namePlaceholder")}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (onNameInputChange) {
                  onNameInputChange(event, field.handleChange);
                  return;
                }

                field.handleChange(event.target.value);
              }}
            />
          )}
        </form.AppField>

        <form.AppField name="categoryIds">
          {(field) => (
            <>
              <field.Combobox
                multiple
                label={t("categories")}
                labelHelper={t("categoryOptional")}
                options={categories.map((category) => {
                  const parent = category.parentId
                    ? categories.find((c) => c.id === category.parentId)
                    : null;
                  return {
                    value: category.id,
                    label: parent ? `${parent.name} > ${category.name}` : category.name,
                  };
                })}
                placeholder={t("categorySearchPlaceholder")}
                emptyText={t("categoryNoResults")}
                onCreateOption={onCreateCategory}
                isCreatingOption={isCreatingCategory}
                getCreateOptionLabel={(name: string) => t("categoryCreateOption", { name })}
                popupFooter={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-muted-foreground hover:text-foreground"
                    onClick={() => setCategoryManagerOpen(true)}
                  >
                    <span className="flex items-center  text gap-1 ">
                      <FolderOpen data-slot="icon" className="size-4" />
                      {t("manageCategories")}
                    </span>
                    <ChevronRight data-slot="icon" className="text-muted-foreground size-4" />
                  </Button>
                }
              />
              <CategoryManagerDrawer
                open={categoryManagerOpen}
                onOpenChange={setCategoryManagerOpen}
                onCategoryDeleted={(categoryId) => {
                  field.handleChange((current: string[]) =>
                    Array.isArray(current)
                      ? current.filter((selectedId) => selectedId !== categoryId)
                      : [],
                  );
                }}
              />
            </>
          )}
        </form.AppField>
      </div>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <RichTextEditor
              value={field.state.value || ""}
              onChange={field.handleChange}
              placeholder={t("descriptionPlaceholder")}
            />
            <p className="text-muted-foreground text-xs">{t("descriptionHint")}</p>
            {field.state.meta.errors.length > 0 && (
              <p className="text-destructive text-sm font-medium">
                {getFieldError(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {showAiContext && (
        <form.AppField name="aiContext">
          {(field) => (
            <field.Textarea
              label={t("aiContext")}
              placeholder={t("aiContextPlaceholder")}
              description={t("aiContextHint")}
              rows={4}
              maxLength={AI_ADVISOR_PRODUCT_CONTEXT_MAX_LENGTH}
            />
          )}
        </form.AppField>
      )}
    </div>
  );
}
