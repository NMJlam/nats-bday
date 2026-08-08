import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  message: text("message").notNull().default(""),
  mediaType: text("media_type").notNull(),
  mediaUrl: text("media_url").notNull(),
  posterUrl: text("poster_url"),
  alt: text("alt").notNull().default(""),
  ownerId: text("owner_id").notNull(),
  ownerEmail: text("owner_email").notNull(),
  ownerName: text("owner_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CardRow = typeof cards.$inferSelect;
export type NewCardRow = typeof cards.$inferInsert;
