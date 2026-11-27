import { z } from "zod";

const positionSchema = z.object({
  id: z.string().min(1).max(80),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().gt(0).max(100),
  height: z.number().gt(0).max(100),
});

const imageUrlSchema = z
  .string()
  .max(2048)
  .refine((value) => {
    if (value.startsWith("/") && !value.startsWith("//")) return true;

    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  });

const imageKeySchema = z.string().regex(/^[a-zA-Z0-9/_-]+\.(?:jpe?g|png|gif|webp)$/i);

const elementSchema = z.discriminatedUnion("type", [
  positionSchema.extend({ type: z.literal("reference") }),
  positionSchema.extend({ type: z.literal("qr") }),
  positionSchema.extend({
    type: z.literal("text"),
    text: z.string().max(280),
  }),
  positionSchema.extend({
    type: z.literal("image"),
    key: imageKeySchema,
    url: imageUrlSchema,
  }),
]);

export const scopePrintingLabelImageKey = (key: string, storeId: string): string | null => {
  if (!imageKeySchema.safeParse(key).success) return null;

  const prefix = `${storeId}/labels/`;
  if (key.startsWith(prefix)) return key;
  if (key.includes("/labels/")) return null;

  return `${prefix}${key}`;
};

export const printingLabelTemplateSchema = z
  .object({
    version: z.literal(1),
    elements: z.array(elementSchema).max(24),
  })
  .superRefine((template, context) => {
    const ids = new Set<string>();

    template.elements.forEach((element, index) => {
      if (ids.has(element.id)) {
        context.addIssue({
          code: "custom",
          message: "Element identifiers must be unique",
          path: ["elements", index, "id"],
        });
      }
      ids.add(element.id);

      if (element.x + element.width > 100 || element.y + element.height > 100) {
        context.addIssue({
          code: "custom",
          message: "Elements must fit inside the label",
          path: ["elements", index],
        });
      }
    });
  });
