import { db } from "./db";
import {
  userProfiles,
  scans,
  barcodeProducts,
  users,
  type UserProfile,
  type InsertUserProfile,
  type Scan,
  type InsertScan,
  type UpdateProfileRequest,
  type UpdateScanRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export type BarcodeProduct = typeof barcodeProducts.$inferSelect;

export interface IStorage {
  // Profiles
  getProfile(userId: string): Promise<UserProfile | undefined>;
  createProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UserProfile>;
  deleteProfile(userId: string): Promise<void>;

  // Scans
  getScans(userId: string): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;
  updateScan(id: number, updates: UpdateScanRequest): Promise<Scan>;

  // Barcode DB
  lookupBarcode(barcode: string): Promise<BarcodeProduct | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UserProfile> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async deleteProfile(userId: string): Promise<void> {
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
  }

  // Scans
  async getScans(userId: string): Promise<Scan[]> {
    return await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt));
  }

  async getScan(id: number): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async createScan(scan: InsertScan): Promise<Scan> {
    const [newScan] = await db.insert(scans).values(scan).returning();
    return newScan;
  }

  async updateScan(id: number, updates: UpdateScanRequest): Promise<Scan> {
    const [updated] = await db
      .update(scans)
      .set(updates)
      .where(eq(scans.id, id))
      .returning();
    return updated;
  }

  // Barcode DB
  async lookupBarcode(barcode: string): Promise<BarcodeProduct | undefined> {
    const [product] = await db.select().from(barcodeProducts).where(eq(barcodeProducts.barcode, barcode));
    return product;
  }
}

export const storage = new DatabaseStorage();
