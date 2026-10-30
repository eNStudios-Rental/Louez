"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toastManager,
} from "@louez/ui";

import { transferOwnership } from "./actions";
import type { TeamMember } from "./team-types";

interface TransferOwnershipDialogProps {
  members: TeamMember[];
  currentUserId: string;
  onClose: () => void;
}

export const TransferOwnershipDialog = ({
  members,
  currentUserId,
  onClose,
}: TransferOwnershipDialogProps) => {
  const t = useTranslations("dashboard.team");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const eligibleMembers = members.filter(
    (member) => member.userId !== currentUserId && member.role !== "owner",
  );

  const resolveErrorMessage = (code: string | undefined) => {
    if (!code) return tErrors("generic");
    const teamKey = code.replace("dashboard.team.", "");
    if (t.has(teamKey)) return t(teamKey);

    const errorKey = code.replace("errors.", "");
    if (tErrors.has(errorKey)) return tErrors(errorKey);

    return tErrors("generic");
  };

  const handleTransfer = async () => {
    if (!selectedMemberId) return;

    startTransition(async () => {
      const result = await transferOwnership(selectedMemberId);

      if (result.error) {
        toastManager.add({
          title: resolveErrorMessage(result.error),
          type: "error",
        });
        return;
      }

      toastManager.add({ title: t("ownershipTransferred"), type: "success" });
      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("transferOwnership")}</DialogTitle>
          <DialogDescription>{t("transferOwnershipDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">{t("selectNewOwner")}:</p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {eligibleMembers.length > 0 ? (
              eligibleMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                    selectedMemberId === member.id ? "border-primary bg-muted/50" : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        selectedMemberId === member.id
                          ? "border-primary bg-primary"
                          : "border-muted"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{member.user.name || member.user.email}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("noEligibleMembers")}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedMemberId || isPending || eligibleMembers.length === 0}
          >
            {isPending ? tCommon("loading") : t("transferOwnership")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
