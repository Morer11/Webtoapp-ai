import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  plan: text("plan").notNull().default("free"), // 'free' or 'pro'
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Apps table
export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  platform: text("platform").notNull(), // 'android', 'ios', 'desktop'
  status: text("status").notNull().default("pending"), // 'pending', 'analyzing', 'generating', 'completed', 'failed'
  mode: text("mode").notNull().default("online"), // 'online', 'offline'
  aiAnalysis: jsonb("ai_analysis"),
  downloadUrl: text("download_url"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Admin Settings table
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Payment Methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'crypto'
  network: text("network").notNull(),
  address: text("address").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ad Sources table
export const adSources = pgTable("ad_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'admob', 'facebook', etc.
  appId: text("app_id"),
  placementId: text("placement_id"),
  revenueShare: real("revenue_share").notNull(), // percentage (0-100)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Payment Receipts table
export const paymentReceipts = pgTable("payment_receipts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paymentMethodId: integer("payment_method_id").notNull().references(() => paymentMethods.id),
  transactionHash: text("transaction_hash").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'verified', 'rejected'
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  verifiedAt: timestamp("verified_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  apps: many(apps),
  paymentReceipts: many(paymentReceipts),
}));

export const appsRelations = relations(apps, ({ one }) => ({
  user: one(users, {
    fields: [apps.userId],
    references: [users.id],
  }),
}));

export const paymentReceiptsRelations = relations(paymentReceipts, ({ one }) => ({
  user: one(users, {
    fields: [paymentReceipts.userId],
    references: [users.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [paymentReceipts.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const registerSchema = insertUserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 characters"),
});

export const insertAppSchema = createInsertSchema(apps).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdSourceSchema = createInsertSchema(adSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentReceiptSchema = createInsertSchema(paymentReceipts).omit({
  id: true,
  submittedAt: true,
  verifiedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type App = typeof apps.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type AdSource = typeof adSources.$inferSelect;
export type InsertAdSource = z.infer<typeof insertAdSourceSchema>;
export type PaymentReceipt = typeof paymentReceipts.$inferSelect;
export type InsertPaymentReceipt = z.infer<typeof insertPaymentReceiptSchema>;
