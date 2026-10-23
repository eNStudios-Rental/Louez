"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db, users } from "@louez/db";
import { isOwnedImageUrl } from "@louez/validations";

import { auth } from "@/lib/auth";
import {
  findDuplicateKeyboardShortcut,
  keyboardShortcutIds,
  keyboardShortcutOverridesSchema,
  resolveKeyboardShortcuts,
  type KeyboardShortcutOverrides,
} from "@/lib/keyboard-shortcuts";

const updateAccountInfoSchema = z.object({
  name: z.string().trim().min(2).max(255),
  // Uploaded images can be absolute bucket URLs or same-origin `/files/...` paths.
  // isOwnedImageUrl below validates the storage URL and its user-owned prefix.
  imageUrl: z.string().nullable().optional(),
});

type UpdateAccountInfoInput = z.infer<typeof updateAccountInfoSchema>;

export async function updateAccountInfo(input: UpdateAccountInfoInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "errors.unauthorized" };
  }

  const parsed = updateAccountInfoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "errors.invalidData" };
  }

  const imageUrl = parsed.data.imageUrl;
  if (imageUrl && !isOwnedImageUrl(imageUrl, `users/${session.user.id}`)) {
    return { error: "errors.invalidData" };
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      ...(imageUrl !== undefined ? { image: imageUrl } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return { success: true as const, imageUrl };
}

export async function updateKeyboardShortcuts(input: KeyboardShortcutOverrides) {
  const session = await auth();
  if (!session?.user?.id) {
    // `success` is the discriminant callers narrow on to reach `shortcuts`.
    return { success: false as const, error: "errors.unauthorized" };
  }

  const parsed = keyboardShortcutOverridesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "errors.invalidData" };
  }

  const resolvedShortcuts = resolveKeyboardShortcuts(parsed.data);
  if (findDuplicateKeyboardShortcut(resolvedShortcuts)) {
    return { success: false as const, error: "errors.invalidData" };
  }

  const hasOverrides = keyboardShortcutIds.some(
    (shortcutId) => parsed.data[shortcutId] !== undefined,
  );

  await db
    .update(users)
    .set({
      keyboardShortcuts: hasOverrides ? parsed.data : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return {
    success: true as const,
    shortcuts: resolvedShortcuts,
  };
}
