"use client";

import { useTranslations } from "next-intl";

import {
  Drawer,
  DrawerDescription,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@louez/ui";

import { CategoryManager } from "./category-manager";

interface CategoryManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryDeleted?: (categoryId: string) => void;
}

export const CategoryManagerDrawer = ({
  open,
  onOpenChange,
  onCategoryDeleted,
}: CategoryManagerDrawerProps) => {
  const t = useTranslations("categories");

  return (
    <Drawer position="right" open={open} onOpenChange={onOpenChange}>
      <DrawerPopup variant="inset" showCloseButton>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>{t("description")}</DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <CategoryManager variant="drawer" onCategoryDeleted={onCategoryDeleted} />
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
};
