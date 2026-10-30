"use client";

import { useState, useTransition } from "react";

import { MoreHorizontal } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toastManager,
} from "@louez/ui";
import { StarSolidIcon, UserSolidIcon } from "@louez/ui/icons";

import { UserAvatar } from "@/components/dashboard/shared/user-avatar";

import { removeMember, changeRole } from "./actions";
import { TransferOwnershipDialog } from "./transfer-ownership-dialog";
import type { TeamMember } from "./team-types";

interface TeamMemberRowProps {
  member: TeamMember;
  allMembers: TeamMember[];
  canManageMembers: boolean;
  currentUserId: string;
  readOnly?: boolean;
}

export const TeamMemberRow = ({
  member,
  allMembers,
  canManageMembers,
  currentUserId,
  readOnly = false,
}: TeamMemberRowProps) => {
  const t = useTranslations("dashboard.team");
  const tErrors = useTranslations("errors");
  const format = useFormatter();
  const [isPending, startTransition] = useTransition();

  const isOwner = member.role === "owner";
  const isCurrentUserOwner = currentUserId === member.userId;
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  const handleRemove = () => {
    if (readOnly) return;
    startTransition(async () => {
      const result = await removeMember(member.id);

      if (result.error) {
        const key = result.error.replace("dashboard.team.", "");
        toastManager.add({
          title: t.has(key) ? t(key) : tErrors("generic"),
          type: "error",
        });
        return;
      }

      toastManager.add({ title: t("memberRemoved"), type: "success" });
    });
  };

  return (
    <div className="hover:bg-muted/60 flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors sm:px-3">
      <UserAvatar src={member.user.image} seed={member.user.id} size={40} />

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate font-medium">{member.user.name || member.user.email}</span>
          <Badge
            variant={isOwner ? "progress" : member.role === "admin" ? "success" : "expired"}
            className="gap-1"
          >
            {isOwner ? <StarSolidIcon /> : <UserSolidIcon />}
            {isOwner ? t("ownerBadge") : member.role === "admin" ? "Admin" : t("memberBadge")}
          </Badge>
        </div>
        {member.user.name && (
          <p className="text-muted-foreground truncate text-sm">{member.user.email}</p>
        )}
        <p className="text-muted-foreground text-xs">
          {t("addedOn", {
            date: format.dateTime(new Date(member.createdAt), {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          })}
        </p>
      </div>

      {canManageMembers && (
        <>
          <DropdownMenu modal={readOnly ? false : undefined}>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={readOnly || isPending}
                  aria-label={t("removeMember")}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && isCurrentUserOwner && (
                <DropdownMenuItem
                  onClick={() => {
                    if (readOnly) return;
                    setShowTransferDialog(true);
                  }}
                >
                  {t("transferOwnership")}
                </DropdownMenuItem>
              )}
              {member.role !== "admin" && !isOwner && (
                <DropdownMenuItem
                  onClick={() => {
                    if (readOnly) return;
                    startTransition(async () => {
                      const res = await changeRole(member.id, "admin");
                      if (res.error) {
                        const key = res.error.replace("dashboard.team.", "");
                        toastManager.add({ title: t.has(key) ? t(key) : tErrors("generic"), type: "error" });
                      } else {
                        toastManager.add({ title: t("roleChangedAdmin"), type: "success" });
                      }
                    });
                  }}
                >
                  {t("makeAdmin")}
                </DropdownMenuItem>
              )}
              {member.role !== "member" && !isOwner && (
                <DropdownMenuItem
                  onClick={() => {
                    if (readOnly) return;
                    startTransition(async () => {
                      const res = await changeRole(member.id, "member");
                      if (res.error) {
                        const key = res.error.replace("dashboard.team.", "");
                        toastManager.add({ title: t.has(key) ? t(key) : tErrors("generic"), type: "error" });
                      } else {
                        toastManager.add({ title: t("roleChangedMember"), type: "success" });
                      }
                    });
                  }}
                >
                  {t("makeMember")}
                </DropdownMenuItem>
              )}
              {!isOwner && (
                <DropdownMenuItem className="text-destructive" onClick={handleRemove}>
                  {t("removeMember")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {showTransferDialog && (
            <TransferOwnershipDialog
              members={allMembers}
              currentUserId={currentUserId}
              onClose={() => setShowTransferDialog(false)}
            />
          )}
        </>
      )}
    </div>
  );
};
