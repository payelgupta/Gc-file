import { pgTable, uuid, text, boolean, numeric, timestamp, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Gyan Prakasha Path (জ্ঞানচর্চা'লয়) - Drizzle Database Schema
 * Modeled for PostgreSQL / Supabase
 */

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull(),
  video_url: text("video_url"),
  pdf_url: text("pdf_url"),
  image_url: text("image_url"),
  is_published: boolean("is_published").notNull().default(true),
  requires_permission: boolean("requires_permission").notNull().default(false),
  is_paid: boolean("is_paid").notNull().default(false),
  price: numeric("price").notNull().default("0"),
  discount_price: numeric("discount_price"),
  chapters: jsonb("chapters").notNull().default([]),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const premiumFiles = pgTable("premium_files", {
  postId: uuid("post_id").primaryKey().references(() => posts.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pdfUnlockRequests = pgTable(
  "pdf_unlock_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    email: text("email").notNull(),
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    method: text("method").notNull(),
    senderNumber: text("sender_number").notNull(),
    trxId: text("trx_id").notNull(),
    amount: numeric("amount").notNull().default("0"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueActiveTrxPerMethod: uniqueIndex("idx_pdf_unlock_unique_trx")
      .on(
        sql`lower(trim(${table.method}))`,
        sql`upper(trim(${table.trxId}))`
      )
      .where(sql`status != 'rejected'`),
  })
);

export const postChapters = pgTable("post_chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  pdfUrl: text("pdf_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
