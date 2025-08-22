import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, json, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  photoUrl: text("photo_url"), // New field for admin-uploaded photos
  phone: text("phone"), // Optional field for profile
  uid: text("uid").unique(), // 8-digit unique identifier
  givenName: text("given_name"),
  surname: text("surname"),
  displayName: text("display_name"),
  docketCompleted: boolean("docket_completed").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Contract fields - original admin-uploaded documents
  companyContractOriginalUrl: text("company_contract_original_url"),
  companyContractSignedUrl: text("company_contract_signed_url"),
  companyContractStatus: text("company_contract_status").default("pending"), // pending, signed, rejected
  companyContractSignatureValid: boolean("company_contract_signature_valid").default(false),
  
  jobOfferOriginalUrl: text("job_offer_original_url"),
  jobOfferSignedUrl: text("job_offer_signed_url"),
  jobOfferStatus: text("job_offer_status").default("pending"), // pending, signed, rejected
  jobOfferSignatureValid: boolean("job_offer_signature_valid").default(false),
  
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const workPermits = pgTable("work_permits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  status: text("status").notNull().default("preparation"), // preparation, applied, awaiting_decision, approved, rejected
  trackingCode: text("tracking_code"),
  applicationDate: timestamp("application_date"),
  finalDocketUrl: text("final_docket_url"),
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const workVisas = pgTable("work_visas", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  status: text("status").notNull().default("preparation"), // preparation, applied, awaiting_decision, approved, rejected, interview_scheduled
  trackingCode: text("tracking_code"),
  applicationDate: timestamp("application_date"),
  interviewDate: timestamp("interview_date"),
  interviewTime: text("interview_time"), // Time slot for interview (e.g., "10:00 AM", "2:30 PM")
  visaType: text("visa_type"), // e.g., "H1B", "L1", "O1", etc.
  embassyLocation: text("embassy_location"),
  finalVisaUrl: text("final_visa_url"),
  
  // Admin uploaded documents
  irlApplicationFormUrl: text("irl_application_form_url"),
  visaAppointmentUrl: text("visa_appointment_url"),
  vfsVisaPaymentUrl: text("vfs_visa_payment_url"),
  visaCoverLetterUrl: text("visa_cover_letter_url"),
  visaInviteLetterUrl: text("visa_invite_letter_url"),
  supplementaryEmploymentApplicationUrl: text("supplementary_employment_application_url"),
  irelandVacChecklistUrl: text("ireland_vac_checklist_url"),
  travelMedicalInsuranceUrl: text("travel_medical_insurance_url"),
  fullDocketVisaSubmissionUrl: text("full_docket_visa_submission_url"),
  
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Audit logging table for tracking all system activities
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // Can be null for system actions
  adminEmail: text("admin_email"), // For admin actions
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  entityType: text("entity_type").notNull(), // user, docket, contract, work_permit, work_visa, etc.
  entityId: text("entity_id"), // ID of the affected entity
  oldValues: json("old_values").$type<Record<string, any>>(), // Previous values for updates
  newValues: json("new_values").$type<Record<string, any>>(), // New values for creates/updates
  metadata: json("metadata").$type<Record<string, any>>(), // Additional context (IP, user agent, etc.)
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  severity: text("severity").default("info"), // info, warning, error, critical
  description: text("description"), // Human-readable description
  timestamp: timestamp("timestamp").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // info, warning, success, error
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  read: boolean("read").default(false),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  docket: one(dockets, {
    fields: [users.id],
    references: [dockets.userId],
  }),
  contract: one(contracts, {
    fields: [users.id],
    references: [contracts.userId],
  }),
  workPermit: one(workPermits, {
    fields: [users.id],
    references: [workPermits.userId],
  }),
  workVisa: one(workVisas, {
    fields: [users.id],
    references: [workVisas.userId],
  }),
  notifications: many(notifications),
}));

export const docketsRelations = relations(dockets, ({ one }) => ({
  user: one(users, {
    fields: [dockets.userId],
    references: [users.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
}));

export const workPermitsRelations = relations(workPermits, ({ one }) => ({
  user: one(users, {
    fields: [workPermits.userId],
    references: [users.id],
  }),
}));

export const workVisasRelations = relations(workVisas, ({ one }) => ({
  user: one(users, {
    fields: [workVisas.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
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

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true,
});

export const insertWorkPermitSchema = createInsertSchema(workPermits).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertWorkVisaSchema = createInsertSchema(workVisas).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Docket = typeof dockets.$inferSelect;
export type InsertDocket = z.infer<typeof insertDocketSchema>;
export type OtpSession = typeof otpSessions.$inferSelect;
export type InsertOtpSession = z.infer<typeof insertOtpSessionSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type WorkPermit = typeof workPermits.$inferSelect;
export type InsertWorkPermit = z.infer<typeof insertWorkPermitSchema>;
export type WorkVisa = typeof workVisas.$inferSelect;
export type InsertWorkVisa = z.infer<typeof insertWorkVisaSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
