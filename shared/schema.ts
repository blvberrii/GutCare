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
  firstName: text("first_name"),
  dob: timestamp("dob"),
  gender: text("gender"), // Female, Male, Neither
  conditions: text("conditions").array(),
  symptoms: text("symptoms").array(),
  struggles: text("struggles").array(),
  allergies: text("allergies").array(),
  language: text("language").default("English"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  productName: text("product_name"),
  barcode: text("barcode"),
  score: integer("score"), // 0-100
  grade: text("grade"), // A-F
  imageUrl: text("image_url"),
  ingredients: text("ingredients"),
  positives: jsonb("positives"), // Array of { title: string, description: string }
  negatives: jsonb("negatives"), // Array of { title: string, description: string, additives: [] }
  alternatives: jsonb("alternatives"), // Array of { name: string, score: number, image: string }
  userRating: text("user_rating"), // A-F
  userComment: text("user_comment"),
  citations: jsonb("citations"), // Array of { source: string, text: string, url: string }
  additivesDetails: jsonb("additives_details"), // Array of { name: string, risk: string, description: string, category: string }
  isFavorite: boolean("is_favorite").default(false),
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
export const insertUserProfileSchema = createInsertSchema(userProfiles, {
  dob: z.union([z.string(), z.date(), z.null()]).transform((val) => val ? new Date(val) : null),
  conditions: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  struggles: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });
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
