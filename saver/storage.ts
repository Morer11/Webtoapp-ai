import {
  users,
  apps,
  adminSettings,
  paymentMethods,
  adSources,
  paymentReceipts,
  type User,
  type UpsertUser,
  type App,
  type InsertApp,
  type AdminSetting,
  type InsertAdminSetting,
  type PaymentMethod,
  type InsertPaymentMethod,
  type AdSource,
  type InsertAdSource,
  type PaymentReceipt,
  type InsertPaymentReceipt,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // App operations
  getApps(userId: string): Promise<App[]>;
  getApp(id: number): Promise<App | undefined>;
  createApp(app: InsertApp): Promise<App>;
  updateApp(id: number, updates: Partial<App>): Promise<App>;
  deleteApp(id: number): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  
  // Payment methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, updates: Partial<PaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<void>;
  
  // Ad sources
  getAdSources(): Promise<AdSource[]>;
  createAdSource(source: InsertAdSource): Promise<AdSource>;
  updateAdSource(id: number, updates: Partial<AdSource>): Promise<AdSource>;
  deleteAdSource(id: number): Promise<void>;
  
  // Payment receipts
  getPaymentReceipts(): Promise<PaymentReceipt[]>;
  getUserPaymentReceipts(userId: string): Promise<PaymentReceipt[]>;
  createPaymentReceipt(receipt: InsertPaymentReceipt): Promise<PaymentReceipt>;
  updatePaymentReceipt(id: number, updates: Partial<PaymentReceipt>): Promise<PaymentReceipt>;
  getPaymentReceipt(id: number): Promise<PaymentReceipt | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // App operations
  async getApps(userId: string): Promise<App[]> {
    return db
      .select()
      .from(apps)
      .where(eq(apps.userId, userId))
      .orderBy(desc(apps.createdAt));
  }

  async getApp(id: number): Promise<App | undefined> {
    const [app] = await db.select().from(apps).where(eq(apps.id, id));
    return app;
  }

  async createApp(app: InsertApp): Promise<App> {
    const [newApp] = await db.insert(apps).values(app).returning();
    return newApp;
  }

  async updateApp(id: number, updates: Partial<App>): Promise<App> {
    const [updatedApp] = await db
      .update(apps)
      .set(updates)
      .where(eq(apps.id, id))
      .returning();
    return updatedApp;
  }

  async deleteApp(id: number): Promise<void> {
    await db.delete(apps).where(eq(apps.id, id));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key));
    return setting;
  }

  async setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    const [newSetting] = await db
      .insert(adminSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: {
          value: setting.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newSetting;
  }

  // Payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).orderBy(desc(paymentMethods.createdAt));
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newMethod] = await db.insert(paymentMethods).values(method).returning();
    return newMethod;
  }

  async updatePaymentMethod(id: number, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const [updatedMethod] = await db
      .update(paymentMethods)
      .set(updates)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updatedMethod;
  }

  async deletePaymentMethod(id: number): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // Ad sources
  async getAdSources(): Promise<AdSource[]> {
    return db.select().from(adSources).orderBy(desc(adSources.createdAt));
  }

  async createAdSource(source: InsertAdSource): Promise<AdSource> {
    const [newSource] = await db.insert(adSources).values(source).returning();
    return newSource;
  }

  async updateAdSource(id: number, updates: Partial<AdSource>): Promise<AdSource> {
    const [updatedSource] = await db
      .update(adSources)
      .set(updates)
      .where(eq(adSources.id, id))
      .returning();
    return updatedSource;
  }

  async deleteAdSource(id: number): Promise<void> {
    await db.delete(adSources).where(eq(adSources.id, id));
  }

  // Payment receipt operations
  async getPaymentReceipts(): Promise<PaymentReceipt[]> {
    return db.select().from(paymentReceipts).orderBy(desc(paymentReceipts.submittedAt));
  }

  async getUserPaymentReceipts(userId: string): Promise<PaymentReceipt[]> {
    return db
      .select()
      .from(paymentReceipts)
      .where(eq(paymentReceipts.userId, userId))
      .orderBy(desc(paymentReceipts.submittedAt));
  }

  async createPaymentReceipt(receipt: InsertPaymentReceipt): Promise<PaymentReceipt> {
    const [newReceipt] = await db
      .insert(paymentReceipts)
      .values(receipt)
      .returning();
    return newReceipt;
  }

  async updatePaymentReceipt(id: number, updates: Partial<PaymentReceipt>): Promise<PaymentReceipt> {
    const [receipt] = await db
      .update(paymentReceipts)
      .set(updates)
      .where(eq(paymentReceipts.id, id))
      .returning();
    return receipt;
  }

  async getPaymentReceipt(id: number): Promise<PaymentReceipt | undefined> {
    const [receipt] = await db
      .select()
      .from(paymentReceipts)
      .where(eq(paymentReceipts.id, id));
    return receipt;
  }
}

export const storage = new DatabaseStorage();
