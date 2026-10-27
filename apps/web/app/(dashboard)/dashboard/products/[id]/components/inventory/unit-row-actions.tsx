"use client";

import { Archive, History, MoreHorizontal, Pencil, RotateCcw, Wrench, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@louez/ui";

import type { ProductInventoryUnit } from "../../queries";

interface UnitRowActionsProps {
  row: ProductInventoryUnit;
  disabled?: boolean;
  onCloseDowntime: (row: ProductInventoryUnit) => void;
  onDeclareDowntime: (row: ProductInventoryUnit) => void;
  onEditDetails: (row: ProductInventoryUnit) => void;
  onReinstate: (row: ProductInventoryUnit) => void;
  onRetire: (row: ProductInventoryUnit) => void;
  onViewHistory: (row: ProductInventoryUnit) => void;
}

export const UnitRowActions = ({
  row,
  disabled = false,
  onCloseDowntime,
  onDeclareDowntime,
  onEditDetails,
  onReinstate,
  onRetire,
  onViewHistory,
}: UnitRowActionsProps) => {
  const t = useTranslations("dashboard.inventory.actions");
  const tCommon = useTranslations("common");
  const isRetired = row.lifecycleStatus === "retired";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={disabled} />}>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">{tCommon("actions")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDeclareDowntime(row)}>
          {row.currentDowntime ? (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              {t("editDowntime")}
            </>
          ) : (
            <>
              <Wrench className="mr-2 h-4 w-4" />
              {t("declareDowntime")}
            </>
          )}
        </DropdownMenuItem>
        {row.currentDowntime ? (
          <DropdownMenuItem onClick={() => onCloseDowntime(row)}>
            <XCircle className="mr-2 h-4 w-4" />
            {t("closeDowntime")}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        {isRetired ? (
          <DropdownMenuItem onClick={() => onReinstate(row)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("reinstate")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onRetire(row)}>
            <Archive className="mr-2 h-4 w-4" />
            {t("retire")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEditDetails(row)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("editDetails")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewHistory(row)}>
          <History className="mr-2 h-4 w-4" />
          {t("viewHistory")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
