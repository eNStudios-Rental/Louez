"use server";

import { revalidatePath } from "next/cache";

import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

import { db } from "@louez/db";
import { stores, storeInvitations, storeMembers, users } from "@louez/db";
import { isEmailConfigured } from "@louez/email";

import { auth } from "@/lib/auth";
import { notifyTeamMemberInvited } from "@/lib/discord/platform-notifications";
import { getLocaleFromCountry } from "@/lib/email/i18n";
import { sendTeamInvitationEmail } from "@/lib/email/send";
import { log } from "@/lib/evlog";
import { canAddTeamMember } from "@/lib/plan-limits";
import { currentUserHasPermission, getCurrentStore } from "@/lib/store-context";
import { isPlatformAdmin } from "@/lib/platform-admin";

import { env } from "@/env";
import type { MemberRole } from "@louez/utils";

const addMemberSchema = z.object({
  email: z.email(),
});

export async function addTeamMember(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "errors.unauthorized" };
  }

  const store = await getCurrentStore();
  if (!store) {
    return { error: "errors.storeNotFound" };
  }

  // Check permission
  const canManage = await currentUserHasPermission("manage_members");
  if (!canManage) {
    return { error: "errors.unauthorized" };
  }

  // Check plan limits
  const teamLimits = await canAddTeamMember(store.id);
  if (!teamLimits.allowed) {
    return { error: "dashboard.team.limitReached" };
  }

  const validated = addMemberSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { error: "errors.invalidEmail" };
  }

  const email = validated.data.email.toLowerCase();

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    // Check if already a member
    const existingMember = await db.query.storeMembers.findFirst({
      where: and(eq(storeMembers.storeId, store.id), eq(storeMembers.userId, existingUser.id)),
    });

    if (existingMember) {
      return { error: "dashboard.team.alreadyMember" };
    }

    // Add as member directly
    await db.insert(storeMembers).values({
      storeId: store.id,
      userId: existingUser.id,
      role: "member",
      addedBy: session.user.id,
    });

    notifyTeamMemberInvited({ id: store.id, name: store.name, slug: store.slug }, email).catch(
      () => {},
    );

    revalidatePath("/dashboard/team");
    return { success: true, type: "added" };
  }

  // User doesn't exist, check for existing pending invitation
  const existingInvitation = await db.query.storeInvitations.findFirst({
    where: and(
      eq(storeInvitations.storeId, store.id),
      eq(storeInvitations.email, email),
      eq(storeInvitations.status, "pending"),
    ),
  });

  if (existingInvitation) {
    return { error: "dashboard.team.invitationAlreadySent" };
  }

  // Create invitation
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  await db.insert(storeInvitations).values({
    storeId: store.id,
    email,
    role: "member",
    token,
    invitedBy: session.user.id,
    expiresAt,
  });

  // Send invitation email
  try {
    const inviter = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    await sendTeamInvitationEmail({
      to: email,
      storeName: store.name,
      storeLogoUrl: store.logoUrl,
      inviterName: inviter?.name || inviter?.email || "Un membre",
      invitationUrl: `${env.NEXT_PUBLIC_APP_URL}/invitation/${token}`,
      locale: getLocaleFromCountry(store.settings?.country),
    });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    // Don't fail the action if email fails
  }

  notifyTeamMemberInvited({ id: store.id, name: store.name, slug: store.slug }, email).catch(
    () => {},
  );

  revalidatePath("/dashboard/team");

  if (!isEmailConfigured()) {
    return {
      success: true,
      type: "invited",
      invitationUrl: `${env.NEXT_PUBLIC_APP_URL}/invitation/${token}`,
    };
  }

  return { success: true, type: "invited" };
}

export async function removeMember(memberId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "errors.unauthorized" };
  }

  const store = await getCurrentStore();
  if (!store) {
    return { error: "errors.storeNotFound" };
  }

  const canManage = await currentUserHasPermission("manage_members");
  if (!canManage) {
    return { error: "errors.unauthorized" };
  }

  // Get the member to remove
  const member = await db.query.storeMembers.findFirst({
    where: and(eq(storeMembers.id, memberId), eq(storeMembers.storeId, store.id)),
  });

  if (!member) {
    return { error: "errors.memberNotFound" };
  }

  // Cannot remove self
  if (member.userId === session.user.id) {
    return { error: "dashboard.team.cannotRemoveSelf" };
  }

  // Cannot remove owner
  if (member.role === "owner") {
    return { error: "dashboard.team.cannotRemoveOwner" };
  }

  await db.delete(storeMembers).where(eq(storeMembers.id, memberId));

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function changeRole(memberId: string, newRole: MemberRole) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "errors.unauthorized" };
  }

  const store = await getCurrentStore();
  if (!store) {
    return { error: "errors.storeNotFound" };
  }

  const canManage = await currentUserHasPermission("manage_members");
  if (!canManage) {
    return { error: "errors.unauthorized" };
  }

  if (newRole === "owner") {
    return { error: "errors.unauthorized" };
  }

  const member = await db.query.storeMembers.findFirst({
    where: and(eq(storeMembers.id, memberId), eq(storeMembers.storeId, store.id)),
  });

  if (!member) {
    return { error: "errors.memberNotFound" };
  }

  // Cannot change role of owner
  if (member.role === "owner") {
    return { error: "errors.unauthorized" };
  }

  // Platform admins aren't stored in storeMembers table
  if (newRole === "platform_admin") {
    return { error: "errors.unauthorized" };
  }

  await db
    .update(storeMembers)
    .set({ role: newRole as "admin" | "member" | "owner" })
    .where(eq(storeMembers.id, memberId));

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function cancelInvitation(invitationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "errors.unauthorized" };
  }

  const store = await getCurrentStore();
  if (!store) {
    return { error: "errors.storeNotFound" };
  }

  const canManage = await currentUserHasPermission("manage_members");
  if (!canManage) {
    return { error: "errors.unauthorized" };
  }

  await db
    .update(storeInvitations)
    .set({ status: "cancelled" })
    .where(and(eq(storeInvitations.id, invitationId), eq(storeInvitations.storeId, store.id)));

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function resendInvitation(invitationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "errors.unauthorized" };
  }

  const store = await getCurrentStore();
  if (!store) {
    return { error: "errors.storeNotFound" };
  }

  const canManage = await currentUserHasPermission("manage_members");
  if (!canManage) {
    return { error: "errors.unauthorized" };
  }

  const invitation = await db.query.storeInvitations.findFirst({
    where: and(eq(storeInvitations.id, invitationId), eq(storeInvitations.storeId, store.id)),
  });

  if (!invitation || invitation.status !== "pending") {
    return { error: "errors.invitationNotFound" };
  }

  // Update expiry and generate new token
  const newToken = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db
    .update(storeInvitations)
    .set({ token: newToken, expiresAt })
    .where(eq(storeInvitations.id, invitationId));

  // Resend email
  try {
    const inviter = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    await sendTeamInvitationEmail({
      to: invitation.email,
      storeName: store.name,
      storeLogoUrl: store.logoUrl,
      inviterName: inviter?.name || inviter?.email || "Un membre",
      invitationUrl: `${env.NEXT_PUBLIC_APP_URL}/invitation/${newToken}`,
      locale: getLocaleFromCountry(store.settings?.country),
    });
  } catch (error) {
    console.error("Failed to resend invitation email:", error);
  }

  revalidatePath("/dashboard/team");

  if (!isEmailConfigured()) {
    return {
      success: true,
      invitationUrl: `${env.NEXT_PUBLIC_APP_URL}/invitation/${newToken}`,
    };
  }

  return { success: true };
}

export async function getTeamData() {
  const store = await getCurrentStore();
  if (!store) {
    return { members: [], invitations: [], limits: null };
  }

  // Get members, invitations, and limits in parallel
  const [members, invitations, limits] = await Promise.all([
    db.query.storeMembers.findMany({
      where: eq(storeMembers.storeId, store.id),
      with: {
        user: true,
      },
      orderBy: [desc(storeMembers.createdAt)],
    }),
    db.query.storeInvitations.findMany({
      where: and(eq(storeInvitations.storeId, store.id), eq(storeInvitations.status, "pending")),
      orderBy: [desc(storeInvitations.createdAt)],
    }),
    canAddTeamMember(store.id),
  ]);

  return { members, invitations, limits };
}

/**
 * Transfer ownership of the store from the current owner to another member.
 * Only the current owner or a platform admin can transfer ownership.
 * The new owner must already be a member of the store.
 * This updates both the store_members.role and stores.userId fields.
 */
export async function transferOwnership(newOwnerMemberId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const validated = z.string().min(1).safeParse(newOwnerMemberId);
  if (!validated.success) {
    return { success: false, error: "errors.invalidData" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "errors.unauthorized" };
  }

  const store = await getCurrentStore();
  if (!store) {
    return { success: false, error: "errors.storeNotFound" };
  }

  // Check permission - only current owner or platform admin can transfer ownership
  const currentRole = await db.query.storeMembers.findFirst({
    where: and(eq(storeMembers.storeId, store.id), eq(storeMembers.userId, session.user.id)),
  });

  const isAdmin = isPlatformAdmin(session.user.email);
  if (!isAdmin && currentRole?.role !== "owner") {
    return { success: false, error: "errors.unauthorized" };
  }

  // Get the new owner member
  const newOwner = await db.query.storeMembers.findFirst({
    where: and(eq(storeMembers.id, validated.data), eq(storeMembers.storeId, store.id)),
    with: { user: true },
  });

  if (!newOwner) {
    return { success: false, error: "errors.memberNotFound" };
  }

  // Cannot transfer ownership to self
  if (newOwner.userId === session.user.id) {
    return { success: false, error: "dashboard.team.cannotTransferToSelf" };
  }

  // Cannot transfer ownership to someone who is already owner
  if (newOwner.role === "owner") {
    return { success: false, error: "dashboard.team.newOwnerAlreadyOwner" };
  }

  // Get the current owner member of the store
  const currentOwner = await db.query.storeMembers.findFirst({
    where: and(eq(storeMembers.storeId, store.id), eq(storeMembers.role, "owner")),
  });

  if (!currentOwner) {
    return { success: false, error: "errors.noCurrentOwner" };
  }

  // If not platform admin, verify that the authenticated caller is the current store owner
  if (!isAdmin && currentOwner.userId !== session.user.id) {
    return { success: false, error: "errors.unauthorized" };
  }

  try {
    // Use a transaction to ensure all updates succeed or fail together
    await db.transaction(async (tx) => {
      // Update current owner to admin
      await tx
        .update(storeMembers)
        .set({ role: "admin" as const })
        .where(eq(storeMembers.id, currentOwner.id));

      // Update new owner to owner role
      await tx
        .update(storeMembers)
        .set({ role: "owner" as const })
        .where(eq(storeMembers.id, newOwner.id));

      // Update the store's userId to the new owner
      await tx.update(stores).set({ userId: newOwner.userId }).where(eq(stores.id, store.id));
    });

    revalidatePath("/dashboard/team");
    return { success: true };
  } catch (error) {
    log.error({ error, message: "Ownership transfer failed" });
    return { success: false, error: "dashboard.team.transferFailed" };
  }
}
