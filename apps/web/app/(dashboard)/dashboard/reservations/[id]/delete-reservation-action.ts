"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { isEmailConfigured } from "@louez/email";
import {
  aiAdvisorConversations,
  aiAdvisorMessages,
  customers,
  db,
  discordLogs,
  documents,
  emailLogs,
  inspectionFieldValues,
  inspectionItems,
  inspectionPhotos,
  inspections,
  invoicePayments,
  invoices,
  marketplaceBookingAttempts,
  payments,
  paymentRequests,
  platformFees,
  referralRewards,
  reminderLogs,
  reservationActivity,
  reservationCalendarEvents,
  reservationItems,
  reservations,
  restoreReservationStock,
  reviewRequestLogs,
  smsLogs,
  verificationCodes,
} from "@louez/db";

import { getLocaleFromCountry, type EmailLocale } from "@/lib/email/i18n";
import { sendReservationCancelledEmail } from "@/lib/email/send";
import { getStorefrontUrl } from "@/lib/storefront-url";
import { getImageFiles } from "@/lib/storage/files";
import { log } from "@/lib/evlog";
import { getCurrentStore } from "@/lib/store-context";

const deleteReservationInputSchema = z.object({
  reservationId: z.string().length(21),
  notifyCustomer: z.boolean(),
  confirmFinishedReservation: z.boolean(),
});

const deletionEmailReason = {
  fr: "La boutique a supprimé définitivement cette réservation de son système.",
  en: "The store permanently deleted this reservation from its system.",
  de: "Der Shop hat diese Reservierung dauerhaft aus seinem System gelöscht.",
  es: "La tienda ha eliminado permanentemente esta reserva de su sistema.",
  it: "Il negozio ha eliminato definitivamente questa prenotazione dal proprio sistema.",
  nl: "De winkel heeft deze reservering permanent uit het systeem verwijderd.",
  pl: "Sklep trwale usunął tę rezerwację ze swojego systemu.",
  pt: "A loja eliminou permanentemente esta reserva do seu sistema.",
  zh: "商店已从系统中永久删除此预订。",
  ja: "店舗はこの予約をシステムから完全に削除しました。",
  ru: "Магазин навсегда удалил это бронирование из своей системы.",
  id: "Toko telah menghapus reservasi ini secara permanen dari sistemnya.",
  ko: "매장에서 이 예약을 시스템에서 영구적으로 삭제했습니다.",
} satisfies Record<EmailLocale, string>;

export type DeleteReservationResult =
  | { success: true; emailSent: boolean }
  | {
      success: false;
      reason:
        | "unauthorized"
        | "invalid-input"
        | "not-found"
        | "email-required"
        | "email-unavailable"
        | "confirmation-required"
        | "tulip-contract"
        | "external-sync"
        | "failed";
    };

export async function deleteReservation(
  input: z.input<typeof deleteReservationInputSchema>,
): Promise<DeleteReservationResult> {
  const parsed = deleteReservationInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, reason: "invalid-input" };

  const store = await getCurrentStore();
  if (!store || (store.role !== "owner" && store.role !== "admin")) {
    return { success: false, reason: "unauthorized" };
  }

  const { reservationId, notifyCustomer, confirmFinishedReservation } = parsed.data;

  try {
    let inspectionPhotoKeys: string[] = [];
    const result = await db.transaction(async (tx) => {
      const [reservation] = await tx
        .select({
          id: reservations.id,
          number: reservations.number,
          status: reservations.status,
          startDate: reservations.startDate,
          endDate: reservations.endDate,
          tulipContractId: reservations.tulipContractId,
          customerId: reservations.customerId,
        })
        .from(reservations)
        .where(and(eq(reservations.id, reservationId), eq(reservations.storeId, store.id)))
        .for("update");

      if (!reservation) return { success: false as const, reason: "not-found" as const };
      const isConfirmedFinishedDeletion =
        reservation.status === "completed" && confirmFinishedReservation;
      if (!confirmFinishedReservation) {
        return { success: false as const, reason: "confirmation-required" as const };
      }

      const [customer] = await tx
        .select({ firstName: customers.firstName, lastName: customers.lastName, email: customers.email })
        .from(customers)
        .where(and(eq(customers.id, reservation.customerId), eq(customers.storeId, store.id)))
        .limit(1);

      if (notifyCustomer && !customer?.email) {
        return { success: false as const, reason: "email-required" as const };
      }

      if (notifyCustomer && !isEmailConfigured()) {
        return { success: false as const, reason: "email-unavailable" as const };
      }

      const reservationPaymentRows = await tx
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.reservationId, reservationId));
      const paymentIds = reservationPaymentRows.map(({ id }) => id);
      const reservationInvoiceRows = await tx
        .select({ id: invoices.id, documentId: invoices.documentId })
        .from(invoices)
        .where(and(eq(invoices.reservationId, reservationId), eq(invoices.storeId, store.id)));
      const invoiceIds = reservationInvoiceRows.map(({ id }) => id);
      if (reservation.tulipContractId) {
        return { success: false as const, reason: "tulip-contract" as const };
      }

      const [calendarEvent] = await tx
        .select({ id: reservationCalendarEvents.id })
        .from(reservationCalendarEvents)
        .where(eq(reservationCalendarEvents.reservationId, reservationId))
        .limit(1);
      const [marketplaceAttempt] = await tx
        .select({ id: marketplaceBookingAttempts.id })
        .from(marketplaceBookingAttempts)
        .where(eq(marketplaceBookingAttempts.reservationId, reservationId))
        .limit(1);

      if (calendarEvent || marketplaceAttempt) {
        return { success: false as const, reason: "external-sync" as const };
      }

      const reservationInspectionRows = await tx
        .select({ id: inspections.id })
        .from(inspections)
        .where(and(eq(inspections.reservationId, reservationId), eq(inspections.storeId, store.id)));
      const inspectionIds = reservationInspectionRows.map(({ id }) => id);

      if (inspectionIds.length > 0) {
        const itemRows = await tx
          .select({ id: inspectionItems.id })
          .from(inspectionItems)
          .where(inArray(inspectionItems.inspectionId, inspectionIds));
        const inspectionItemIds = itemRows.map(({ id }) => id);

        if (inspectionItemIds.length > 0) {
          const photos = await tx
            .select({ photoKey: inspectionPhotos.photoKey, thumbnailKey: inspectionPhotos.thumbnailKey })
            .from(inspectionPhotos)
            .where(inArray(inspectionPhotos.inspectionItemId, inspectionItemIds));
          inspectionPhotoKeys = photos.flatMap((photo) =>
            [photo.photoKey, photo.thumbnailKey].filter((key): key is string => Boolean(key)),
          );
          await tx
            .delete(inspectionPhotos)
            .where(inArray(inspectionPhotos.inspectionItemId, inspectionItemIds));
          await tx
            .delete(inspectionFieldValues)
            .where(inArray(inspectionFieldValues.inspectionItemId, inspectionItemIds));
          await tx.delete(inspectionItems).where(inArray(inspectionItems.id, inspectionItemIds));
        }

        await tx.delete(inspections).where(inArray(inspections.id, inspectionIds));
      }

      if (invoiceIds.length > 0) {
        await tx.delete(invoicePayments).where(inArray(invoicePayments.invoiceId, invoiceIds));
      }
      if (paymentIds.length > 0) {
        await tx.delete(invoicePayments).where(inArray(invoicePayments.paymentId, paymentIds));
        await tx.delete(referralRewards).where(
          inArray(referralRewards.qualifyingPaymentId, paymentIds),
        );
      }
      await tx.delete(platformFees).where(
        and(eq(platformFees.reservationId, reservationId), eq(platformFees.storeId, store.id)),
      );
      if (invoiceIds.length > 0) {
        await tx.delete(invoices).where(inArray(invoices.id, invoiceIds));
      }
      if (paymentIds.length > 0) {
        await tx.delete(payments).where(inArray(payments.id, paymentIds));
      }

      const invoiceDocumentIds = reservationInvoiceRows.map(({ documentId }) => documentId);
      if (invoiceDocumentIds.length > 0) {
        await tx.delete(documents).where(inArray(documents.id, invoiceDocumentIds));
      }

      if (isConfirmedFinishedDeletion) {
        await tx.delete(documents).where(eq(documents.reservationId, reservationId));
        await tx.delete(referralRewards).where(
          eq(referralRewards.qualifyingReservationId, reservationId),
        );
      }

      if (reservation.status === "confirmed") {
        await restoreReservationStock(tx, reservationId, store.id);
      }

      await tx.delete(reservationItems).where(eq(reservationItems.reservationId, reservationId));
      await tx.delete(reservationActivity).where(eq(reservationActivity.reservationId, reservationId));
      await tx.delete(paymentRequests).where(
        and(eq(paymentRequests.reservationId, reservationId), eq(paymentRequests.storeId, store.id)),
      );
      await tx.delete(reviewRequestLogs).where(
        and(eq(reviewRequestLogs.reservationId, reservationId), eq(reviewRequestLogs.storeId, store.id)),
      );
      await tx.delete(reminderLogs).where(
        and(eq(reminderLogs.reservationId, reservationId), eq(reminderLogs.storeId, store.id)),
      );

      if (isConfirmedFinishedDeletion) {
        await tx.delete(emailLogs).where(
          and(eq(emailLogs.reservationId, reservationId), eq(emailLogs.storeId, store.id)),
        );
        await tx.delete(smsLogs).where(
          and(eq(smsLogs.reservationId, reservationId), eq(smsLogs.storeId, store.id)),
        );
        await tx.delete(discordLogs).where(
          and(eq(discordLogs.reservationId, reservationId), eq(discordLogs.storeId, store.id)),
        );
        await tx.delete(verificationCodes).where(
          and(eq(verificationCodes.reservationId, reservationId), eq(verificationCodes.storeId, store.id)),
        );

        const advisorConversationRows = await tx
          .select({ id: aiAdvisorConversations.id })
          .from(aiAdvisorConversations)
          .where(
            and(
              eq(aiAdvisorConversations.reservationId, reservationId),
              eq(aiAdvisorConversations.storeId, store.id),
            ),
          );
        const advisorConversationIds = advisorConversationRows.map(({ id }) => id);
        if (advisorConversationIds.length > 0) {
          await tx.delete(aiAdvisorMessages).where(
            inArray(aiAdvisorMessages.conversationId, advisorConversationIds),
          );
          await tx.delete(aiAdvisorConversations).where(
            inArray(aiAdvisorConversations.id, advisorConversationIds),
          );
        }
      } else {
        // Preserve customer communications and signed contract files, detached
        // from reservations deleted before they were finished.
        await tx.update(documents).set({ reservationId: null }).where(eq(documents.reservationId, reservationId));
        await tx.update(emailLogs).set({ reservationId: null }).where(
          and(eq(emailLogs.reservationId, reservationId), eq(emailLogs.storeId, store.id)),
        );
        await tx.update(smsLogs).set({ reservationId: null }).where(
          and(eq(smsLogs.reservationId, reservationId), eq(smsLogs.storeId, store.id)),
        );
        await tx.update(discordLogs).set({ reservationId: null }).where(
          and(eq(discordLogs.reservationId, reservationId), eq(discordLogs.storeId, store.id)),
        );
        await tx.update(verificationCodes).set({ reservationId: null }).where(
          and(eq(verificationCodes.reservationId, reservationId), eq(verificationCodes.storeId, store.id)),
        );
        await tx.update(aiAdvisorConversations).set({ reservationId: null }).where(
          and(eq(aiAdvisorConversations.reservationId, reservationId), eq(aiAdvisorConversations.storeId, store.id)),
        );
        await tx.update(referralRewards).set({ qualifyingReservationId: null }).where(
          eq(referralRewards.qualifyingReservationId, reservationId),
        );
      }

      await tx.delete(reservations).where(
        and(eq(reservations.id, reservationId), eq(reservations.storeId, store.id)),
      );

      return {
        success: true as const,
        reservation: {
          id: reservation.id,
          number: reservation.number,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
        },
        customer,
      };
    });

    if (!result.success) return result;

    try {
      const imageDeleteResults = await Promise.allSettled(
        inspectionPhotoKeys.map((key) => getImageFiles().delete(key)),
      );
      for (const [index, imageResult] of imageDeleteResults.entries()) {
        if (imageResult.status === "rejected") {
          log.error(
            "reservation.delete-inspection-photo.failed",
            `Reservation ${reservationId}; object ${inspectionPhotoKeys[index]}: ${imageResult.reason instanceof Error ? imageResult.reason.message : String(imageResult.reason)}`,
          );
        }
      }
    } catch (error) {
      log.error(
        "reservation.delete-inspection-photo.cleanup-failed",
        `Reservation ${reservationId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    let emailSent = false;
    if (notifyCustomer && result.customer?.email) {
      try {
        await sendReservationCancelledEmail({
          to: result.customer.email,
          store,
          customer: {
            firstName: result.customer.firstName ?? "",
            lastName: result.customer.lastName ?? "",
            email: result.customer.email,
          },
          reservation: result.reservation,
          reason: deletionEmailReason[getLocaleFromCountry(store.settings?.country)],
          storefrontUrl: getStorefrontUrl(store.slug),
          locale: getLocaleFromCountry(store.settings?.country),
        });
        emailSent = true;
      } catch (error) {
        log.error(
          "reservation.delete-notification.failed",
          `Reservation ${reservationId} was deleted but the client email failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // The cancellation mail sender logs using the reservation ID. Keep that
      // delivery record while removing its dangling association.
      try {
        await db
          .update(emailLogs)
          .set({ reservationId: null })
          .where(and(eq(emailLogs.reservationId, reservationId), eq(emailLogs.storeId, store.id)));
      } catch (error) {
        log.error(
          "reservation.delete-email-log-cleanup.failed",
          `Reservation ${reservationId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    revalidatePath("/dashboard/reservations");
    revalidatePath(`/dashboard/reservations/${reservationId}`);
    revalidatePath(`/${store.slug}/account`);
    return { success: true, emailSent };
  } catch (error) {
    log.error(
      "reservation.delete.failed",
      `Reservation ${reservationId} in store ${store.id}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { success: false, reason: "failed" };
  }
}
