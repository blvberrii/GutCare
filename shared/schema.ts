import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  age: integer("age"),
  gender: text("gender"), // Female, Male, Neither
  conditions: text("conditions").array(),
  symptoms: text("symptoms").array(),
  struggles: text("struggles").array(),
  allergies: text("allergies").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // Can be null for guest scans if we allow it, but requirements say "Profile page" etc.
  productName: text("product_name"),
  barcode: text("barcode"),
  score: integer("score"), // 0-100
  grade: text("grade"), // A-F
  imageUrl: text("image_url"),
  ingredients: text("ingredients"),
  positives: jsonb("positives"), // Array of { title: string, description: string }
  negatives: jsonb("negatives"), // Array of { title: string, description: string, additives: [] }
  alternatives: jsonb("alternatives"), // Array of { name: string, score: number, image: string }
  userRating: integer("user_rating"), // 1-5 stars, changed to A-F in requirements? "make that an A-F scoring system" - wait, user rating or app grading? "let a user leave a written comment"
  userComment: text("user_comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  user: one(users, {
    fields: [scans.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScanSchema = createInsertSchema(scans).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

export type CreateProfileRequest = InsertUserProfile;
export type UpdateProfileRequest = Partial<InsertUserProfile>;

export type CreateScanRequest = InsertScan;
export type UpdateScanRequest = Partial<InsertScan>;

export type ScansListResponse = Scan[];
export type ScanResponse = Scan;

