import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import { accounts, sessions, users, verificationTokens } from "./db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    providers: [Google],
    callbacks: {
        session({ session, user }) {
            if (session.user && user) {
                // Determine if we are using database sessions (user object present)
                // or JWT (token object present, though argument name varies)
                // With DrizzleAdapter, it's usually database session.
                // Cast user to any to avoid type issues if needed, or rely on inference.
                session.user.id = user.id;
            }
            return session;
        },
    },
})
