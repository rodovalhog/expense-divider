import { pgTable, uuid, date, text, integer, boolean, timestamp, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { type AdapterAccount } from 'next-auth/adapters';

export const ownerEnum = pgEnum('owner', ['Me', 'Wife', 'Shared']);
export const sourceEnum = pgEnum('source', ['CSV', 'Manual']);

export const transactions = pgTable('transactions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    date: date('date').notNull(),
    cardName: text('card_name').notNull(),
    cardLastFour: text('card_last_four').notNull(),
    category: text('category').notNull(),
    customCategory: text('custom_category'),
    description: text('description').notNull(),
    installment: text('installment').default('1/1'),
    amount: integer('amount').notNull(), // Amount in cents
    originalAmountUS: integer('original_amount_us'), // Amount in cents
    owner: ownerEnum('owner').notNull(),
    sourceFile: text('source_file').notNull(),
    source: sourceEnum('source').notNull(),
    excluded: boolean('excluded').default(false),
    isRecurring: boolean('is_recurring').default(false),
    monthGroup: text('month_group'), // For grouping transactions by "month" logic
    userId: text('user_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const userSettings = pgTable('user_settings', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    data: text('data').default('{}'), // Stores the ENTIRE state: monthsData, recurExp, monthOrder, incomes, selectedMonth
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Auth Tables

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
})

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => [
        primaryKey({ columns: [vt.identifier, vt.token] }),
    ]
)
