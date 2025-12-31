'use server';

import { db } from '@/db';
import { userSettings, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

export async function getUserData() {
    const userId = await getAuthenticatedUserId();
    if (!userId) return null;

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

    const jsonState = JSON.stringify(state);
    console.log(`ACTION: saveAppState - Saving state. Size: ${jsonState.length} chars. Keys: ${Object.keys(state).join(', ')}`);

    try {
        const existing = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);

        if (existing.length > 0) {
            await db.update(userSettings).set({
                data: jsonState,
                updatedAt: new Date()
            }).where(eq(userSettings.id, existing[0].id));
            console.log("ACTION: saveAppState - Updated existing record.");
        } else {
            await db.insert(userSettings).values({
                userId,
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
