'use server';

import { db } from '@/db';
import { userSettings, users, sharedUsers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Helper to safely get User ID
async function getAuthenticatedUserId() {
    const session = await auth();
    console.log("SERVER ACTION SESSION:", JSON.stringify(session, null, 2));

    if (session?.user?.id) {
        return session.user.id;
    }

    if (session?.user?.email) {
        const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        if (user.length > 0) {
            return user[0].id;
        }
    }

    return null;
}

// NEW: Sharing Actions
export async function inviteUser(email: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Unauthorized");

    // Check self-invite
    const currentUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (currentUser?.email === email) throw new Error("Você não pode convidar a si mesmo.");

    // Check existing
    const existing = await db.select().from(sharedUsers).where(
        and(
            eq(sharedUsers.ownerId, userId),
            eq(sharedUsers.guestEmail, email)
        )
    ).limit(1);

    if (existing.length > 0) {
        throw new Error("Usuário já convidado.");
    }

    await db.insert(sharedUsers).values({
        ownerId: userId,
        guestEmail: email,
        status: 'pending'
    });

    revalidatePath('/');
    return { success: true };
}

export async function getPendingInvites() {
    const userId = await getAuthenticatedUserId();
    if (!userId) return [];

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.email) return [];

    const invites = await db.select({
        id: sharedUsers.id,
        ownerId: sharedUsers.ownerId,
        ownerName: users.name,
        ownerEmail: users.email,
        createdAt: sharedUsers.createdAt
    })
        .from(sharedUsers)
        .leftJoin(users, eq(sharedUsers.ownerId, users.id))
        .where(
            and(
                eq(sharedUsers.guestEmail, user.email),
                eq(sharedUsers.status, 'pending')
            )
        );

    return invites;
}

export async function acceptInvite(inviteId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.email) throw new Error("Unauthorized");

    // Fix IDOR: Verify guestEmail matches current user
    const invite = await db.select().from(sharedUsers).where(eq(sharedUsers.id, inviteId)).limit(1);
    if (invite.length === 0) throw new Error("Convite não encontrado.");

    if (invite[0].guestEmail !== user.email) {
        throw new Error("Não autorizado.");
    }

    await db.update(sharedUsers).set({ status: 'accepted' }).where(eq(sharedUsers.id, inviteId));
    revalidatePath('/');
}

export async function cancelInvite(inviteId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.email) throw new Error("Unauthorized");

    // Fix IDOR: Allow delete ONLY if Owner OR Guest
    const invite = await db.select().from(sharedUsers).where(eq(sharedUsers.id, inviteId)).limit(1);
    if (invite.length === 0) return; // Already gone

    if (invite[0].ownerId !== userId && invite[0].guestEmail !== user.email) {
        throw new Error("Você não tem permissão para remover este acesso.");
    }

    await db.delete(sharedUsers).where(eq(sharedUsers.id, inviteId));
    revalidatePath('/');
}

export async function getSharedUsers() {
    const userId = await getAuthenticatedUserId();
    if (!userId) return [];

    return await db.select().from(sharedUsers).where(eq(sharedUsers.ownerId, userId));
}

// MODIFIED: Get User Data (Shared Aware)
export async function getUserData() {
    const userId = await getAuthenticatedUserId();
    if (!userId) return null;

    // 1. Check if I am a GUEST (accepted invite)
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (user && user.email) {
        const shared = await db.select().from(sharedUsers).where(
            and(
                eq(sharedUsers.guestEmail, user.email),
                eq(sharedUsers.status, 'accepted')
            )
        ).limit(1);

        if (shared.length > 0) {
            const ownerId = shared[0].ownerId;
            console.log(`ACTION: getUserData - User ${user.email} is accessing SHARED data from owner ${ownerId}`);

            const settings = await db.select().from(userSettings).where(eq(userSettings.userId, ownerId)).limit(1);
            if (settings.length > 0 && settings[0].data) {
                return { ...JSON.parse(settings[0].data), isShared: true, ownerId };
            }
            return { isShared: true, ownerId };
        }
    }

    // 2. Normal Owner Flow
    const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);

    if (settings.length > 0 && settings[0].data) {
        return JSON.parse(settings[0].data);
    }

    return null;
}

export async function saveAppState(state: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        console.error("ACTION: saveAppState - Unauthorized");
        throw new Error("Unauthorized");
    }

    let targetUserId = userId;

    // 1. Check if I am a GUEST saving to OWNER's account
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (user && user.email) {
        const shared = await db.select().from(sharedUsers).where(
            and(
                eq(sharedUsers.guestEmail, user.email),
                eq(sharedUsers.status, 'accepted')
            )
        ).limit(1);

        if (shared.length > 0) {
            targetUserId = shared[0].ownerId;
            console.log(`ACTION: saveAppState - Guest saving to owner ${targetUserId}`);
        }
    }

    const { isShared, ownerId, ...cleanState } = state; // Remove metadata
    const jsonState = JSON.stringify(cleanState);
    console.log(`ACTION: saveAppState - Saving state for ${targetUserId}. Size: ${jsonState.length}`);

    try {
        const existing = await db.select().from(userSettings).where(eq(userSettings.userId, targetUserId)).limit(1);

        if (existing.length > 0) {
            await db.update(userSettings).set({
                data: jsonState,
                updatedAt: new Date()
            }).where(eq(userSettings.id, existing[0].id));
            console.log("ACTION: saveAppState - Updated existing record.");
        } else {
            await db.insert(userSettings).values({
                userId: targetUserId,
                data: jsonState
            });
            console.log("ACTION: saveAppState - Inserted new record.");
        }

        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("ACTION: saveAppState - FAILED", e);
        throw e;
    }
}
