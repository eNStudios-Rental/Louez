"use client";

import { useContext, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  FileText,
  MoreHorizontal,
  Trash2,
  Printer,
  Copy,
  ExternalLink,
  Check,
  Pencil,
  Loader2,
} from "lucide-react";
import { toastManager } from "@louez/ui";
import { useRouter } from "next/navigation";

import { Button } from "@louez/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Checkbox,
} from "@louez/ui";

import { ReservationIdentity } from "./reservation-identity";
import { ContractDownloadContext } from "@/lib/document-previews/contract-download-context";
import { SendEmailModal } from "./send-email-modal";
import { deleteReservation } from "./delete-reservation-action";
import { generateAccessUrl } from "@/app/(dashboard)/dashboard/reservations/actions";
import { ReservationBackButton } from "./reservation-back-button";
import { reservationAnalyticsActions } from "@/lib/product-analytics/analytics-events";
import {
  captureReservationActionFailed,
  captureReservationActionStarted,
  captureReservationActionSucceeded,
} from "@/lib/product-analytics/reservation-analytics-client";

type ReservationStatus =
  | "pending"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "rejected"
  | "quote"
  | "declined";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ReservationHeaderProps {
  reservationId: string;
  reservationNumber: string;
  internalTitle?: string | null;
  status: ReservationStatus;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  customer: Customer;
  storeSlug: string;
  // Payment data
  rentalAmount: number;
  rentalPaid: number;
  depositAmount: number;
  depositCollected: number;
  depositReturned: number;
  totalAmount: number;
  // Optional
  sentEmails?: string[];
  currency?: string;
  readOnly?: boolean;
  canDelete?: boolean;
  onBack?: () => void;
  onDownloadContract?: () => void;
  /** Opens the caller's own email window, which a read-only file cannot send from. */
  onPreviewEmail?: () => void;
}

export function ReservationHeader({
  reservationId,
  reservationNumber,
  internalTitle,
  status,
  createdAt: _createdAt,
  startDate: _startDate,
  endDate: _endDate,
  customer,
  storeSlug: _storeSlug,
  rentalAmount,
  rentalPaid,
  depositAmount,
  depositCollected,
  depositReturned,
  totalAmount: _totalAmount,
  sentEmails = [],
  currency: _currency = "PLN",
  readOnly = false,
  canDelete = false,
  onBack,
  onDownloadContract,
  onPreviewEmail,
}: ReservationHeaderProps) {
  const t = useTranslations("dashboard.reservations");
  const tCommon = useTranslations("common");
  const inheritedDownloadContract = useContext(ContractDownloadContext);
  const downloadContract = onDownloadContract ?? inheritedDownloadContract;

  const router = useRouter();

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [finishedDeleteDialogOpen, setFinishedDeleteDialogOpen] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFullyPaid =
    rentalPaid >= rentalAmount && (depositAmount === 0 || depositCollected >= depositAmount);
  const canEdit = !["completed", "cancelled", "rejected", "declined"].includes(status);

  const handleGenerateAccessUrl = async (
    action:
      | typeof reservationAnalyticsActions.copyAccessLink
      | typeof reservationAnalyticsActions.viewAsCustomer,
  ) => {
    setIsGeneratingLink(true);
    try {
      const result = await generateAccessUrl(reservationId);
      if ("error" in result) {
        captureReservationActionFailed({
          reservationId,
          reservationStatus: status,
          action,
          properties: { error_code: "access_url_failed" },
        });
        toastManager.add({ title: t("accessLink.sendError"), type: "error" });
        return null;
      }
      return result.url;
    } catch {
      captureReservationActionFailed({
        reservationId,
        reservationStatus: status,
        action,
        properties: { error_code: "access_url_failed" },
      });
      toastManager.add({ title: t("accessLink.sendError"), type: "error" });
      return null;
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleViewAsCustomer = async () => {
    const action = reservationAnalyticsActions.viewAsCustomer;
    captureReservationActionStarted({ reservationId, reservationStatus: status, action });
    const url = await handleGenerateAccessUrl(action);
    if (!url) return;

    const openedWindow = window.open(url, "_blank");
    if (openedWindow) {
      captureReservationActionSucceeded({ reservationId, reservationStatus: status, action });
    } else {
      captureReservationActionFailed({
        reservationId,
        reservationStatus: status,
        action,
        properties: { error_code: "popup_blocked" },
      });
    }
  };

  const handleCopyLink = async () => {
    const action = reservationAnalyticsActions.copyAccessLink;
    captureReservationActionStarted({ reservationId, reservationStatus: status, action });
    const url = await handleGenerateAccessUrl(action);
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toastManager.add({ title: t("linkCopied"), type: "success" });
      setTimeout(() => setCopiedLink(false), 2000);
      captureReservationActionSucceeded({ reservationId, reservationStatus: status, action });
    } catch {
      captureReservationActionFailed({
        reservationId,
        reservationStatus: status,
        action,
        properties: { error_code: "clipboard_failed" },
      });
    }
  };

  const handleDownloadContract = () => {
    if (downloadContract) {
      downloadContract();
      return;
    }
    if (readOnly) return;
    captureReservationActionStarted({
      reservationId,
      reservationStatus: status,
      action: reservationAnalyticsActions.downloadContract,
    });
    window.open(`/api/reservations/${reservationId}/contract`, "_blank");
  };

  const handleEdit = () => {
    captureReservationActionStarted({
      reservationId,
      reservationStatus: status,
      action: reservationAnalyticsActions.editReservation,
    });
    router.push(`/dashboard/reservations/${reservationId}/edit`);
  };

  const handlePrint = () => {
    const action = reservationAnalyticsActions.printReservation;
    captureReservationActionStarted({ reservationId, reservationStatus: status, action });
    window.print();
    captureReservationActionSucceeded({ reservationId, reservationStatus: status, action });
  };

  const handleDeleteReservation = async (confirmFinishedReservation = false) => {
    setIsDeleting(true);
    try {
      const result = await deleteReservation({
        reservationId,
        notifyCustomer,
        confirmFinishedReservation,
      });
      if (!result.success) {
        const message = {
          unauthorized: t("deleteDialog.errors.unauthorized"),
          "invalid-input": t("deleteDialog.errors.failed"),
          "not-found": t("deleteDialog.errors.notFound"),
          "email-required": t("deleteDialog.errors.emailRequired"),
          "email-unavailable": t("deleteDialog.errors.emailUnavailable"),
          "active-rental": t("deleteDialog.errors.activeRental"),
          "confirmation-required": t("deleteDialog.errors.confirmationRequired"),
          "financial-records": t("deleteDialog.errors.financialRecords"),
          "external-sync": t("deleteDialog.errors.externalSync"),
          failed: t("deleteDialog.errors.failed"),
        }[result.reason];
        toastManager.add({ title: message, type: "error" });
        return;
      }

      setDeleteDialogOpen(false);
      setFinishedDeleteDialogOpen(false);
      toastManager.add({
        title: result.emailSent
          ? t("deleteDialog.deletedWithEmail")
          : notifyCustomer
            ? t("deleteDialog.deletedEmailFailed")
            : t("deleteDialog.deleted"),
        type: result.emailSent || !notifyCustomer ? "success" : "error",
      });
      router.push("/dashboard/reservations");
      router.refresh();
    } catch {
      toastManager.add({ title: t("deleteDialog.errors.failed"), type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 pb-6 border-b">
        {/* Top row: Back button + Title + Badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ReservationBackButton onBack={onBack} readOnly={readOnly} />

            <ReservationIdentity
              reservationNumber={reservationNumber}
              internalTitle={internalTitle}
              status={status}
              rentalAmount={rentalAmount}
              rentalPaid={rentalPaid}
              depositAmount={depositAmount}
              depositCollected={depositCollected}
              depositReturned={depositReturned}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Email button */}
            <Button
              variant="outline"
              data-demo-target="reservation-preview-email"
              disabled={readOnly && !onPreviewEmail}
              onClick={() => (onPreviewEmail ? onPreviewEmail() : setEmailModalOpen(true))}
              className="hidden sm:flex"
            >
              <Mail className="h-4 w-4 mr-2" />
              {t("actions.sendEmail")}
            </Button>

            {/* Contract download button - always visible */}
            <Button
              data-demo-target="download-contract"
              disabled={readOnly && !downloadContract}
              variant="outline"
              onClick={handleDownloadContract}
              className="hidden sm:flex"
            >
              <FileText className="h-4 w-4 mr-2" />
              {t("contract.download")}
            </Button>

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={readOnly}
                render={<Button variant="outline" size="icon" className="h-9 w-9" />}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{tCommon("actions")}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Mobile-only items */}
                <DropdownMenuItem onClick={() => setEmailModalOpen(true)} className="sm:hidden">
                  <Mail className="h-4 w-4 mr-2" />
                  {t("actions.sendEmail")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadContract} className="sm:hidden">
                  <FileText className="h-4 w-4 mr-2" />
                  {t("contract.download")}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />

                {/* Edit reservation */}
                {canEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t("edit.button")}
                  </DropdownMenuItem>
                )}
                {canEdit && <DropdownMenuSeparator />}

                {/* Common items */}
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  {t("actions.print")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyLink}>
                  {copiedLink ? (
                    <Check className="h-4 w-4 mr-2 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {t("actions.copyLink")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewAsCustomer} disabled={isGeneratingLink}>
                  {isGeneratingLink ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  {t("actions.viewAsCustomer")}
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setNotifyCustomer(false);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("deleteDialog.actionLabel")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {!readOnly && (
        <SendEmailModal
          open={emailModalOpen}
          onOpenChange={setEmailModalOpen}
          reservationId={reservationId}
          reservationNumber={reservationNumber}
          customer={customer}
          status={status}
          isFullyPaid={isFullyPaid}
          sentEmails={sentEmails}
        />
      )}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", { number: reservationNumber })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <label className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox
              checked={notifyCustomer}
              disabled={!customer.email || isDeleting}
              onCheckedChange={(checked) => setNotifyCustomer(checked === true)}
              aria-label={t("deleteDialog.emailLabel")}
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">{t("deleteDialog.emailLabel")}</span>
              <span className="block text-sm text-muted-foreground">
                {customer.email
                  ? t("deleteDialog.emailDescription", { email: customer.email })
                  : t("deleteDialog.emailUnavailable")}
              </span>
            </span>
          </label>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("deleteDialog.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false);
                setFinishedDeleteDialogOpen(true);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? t("deleteDialog.deleting") : t("deleteDialog.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={finishedDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setFinishedDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {status === "completed"
                ? t("deleteDialog.finishedWarningTitle")
                : t("deleteDialog.cancellableWarningTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === "completed" ? (
                <>
                  {t("deleteDialog.finishedWarningIntro")}
                  <ul className="my-2 list-disc space-y-1 pl-5">
                    <li>{t("deleteDialog.finishedWarningPayments")}</li>
                    <li>{t("deleteDialog.finishedWarningProtocols")}</li>
                    <li>{t("deleteDialog.finishedWarningHistory")}</li>
                    <li>{t("deleteDialog.finishedWarningRelated")}</li>
                  </ul>
                  {t("deleteDialog.finishedWarningConclusion")}
                </>
              ) : (
                t("deleteDialog.cancellableWarningDescription")
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setFinishedDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("deleteDialog.changedMind")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteReservation(true)}
              disabled={isDeleting}
            >
              {isDeleting ? t("deleteDialog.deleting") : t("deleteDialog.knowWhatDoing")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
