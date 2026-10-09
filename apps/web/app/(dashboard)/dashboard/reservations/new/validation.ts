import { z } from "zod";

type ValidationTranslator = (key: string) => string;

export function createManualReservationSchema(t: ValidationTranslator) {
  return z
    .object({
      customerId: z.string(),
      startDate: z.custom<Date | undefined>(
        (value) => value === undefined || value instanceof Date,
      ),
      endDate: z.custom<Date | undefined>((value) => value === undefined || value instanceof Date),
      internalTitle: z.string().max(255),
      internalNotes: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.customerId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("required"),
          path: ["customerId"],
        });
      }

      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("required"),
          path: ["startDate"],
        });
      }

      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("required"),
          path: ["endDate"],
        });
      } else if (data.startDate && data.endDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("endDateBeforeStart"),
          path: ["endDate"],
        });
      }
    });
}
