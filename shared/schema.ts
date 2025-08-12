import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, json, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(),
  displayName: text("display_name"),
  email: text("email"),
  profilePhotoUrl: text("profile_photo_url"),
  docketCompleted: boolean("docket_completed").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const dockets = pgTable("dockets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  passportFrontUrl: text("passport_front_url"),
  passportLastUrl: text("passport_last_url"),
  passportVisaUrls: json("passport_visa_urls").$type<string[]>().default([]),
  passportPhotoUrl: text("passport_photo_url"),
  resumeUrl: text("resume_url"),
  educationFiles: json("education_files").$type<{name: string, url: string, size: number}[]>().default([]),
  experienceFiles: json("experience_files").$type<{name: string, url: string, size: number}[]>().default([]),
  offerLetterUrl: text("offer_letter_url"),
  permanentAddressUrl: text("permanent_address_url"),
  currentAddressUrl: text("current_address_url"),
  otherCertifications: json("other_certifications").$type<{name: string, url: string, size: number}[]>().default([]),
  references: json("references").$type<{fullName: string, company: string, designation: string, phone: string, email: string}[]>().default([]),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const otpSessions = pgTable("otp_sessions", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const usersRelations = relations(users, ({ one }) => ({
  docket: one(dockets, {
    fields: [users.id],
    references: [dockets.userId],
  }),
}));

export const docketsRelations = relations(dockets, ({ one }) => ({
  user: one(users, {
    fields: [dockets.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDocketSchema = createInsertSchema(dockets).omit({
  id: true,
  lastUpdated: true,
});

export const insertOtpSessionSchema = createInsertSchema(otpSessions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Docket = typeof dockets.$inferSelect;
export type InsertDocket = z.infer<typeof insertDocketSchema>;
export type OtpSession = typeof otpSessions.$inferSelect;
export type InsertOtpSession = z.infer<typeof insertOtpSessionSchema>;
