import { users, dockets, otpSessions, type User, type InsertUser, type Docket, type InsertDocket, type OtpSession, type InsertOtpSession } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // OTP operations
  createOtpVerification(session: InsertOtpSession): Promise<OtpSession>;
  getLatestOtpVerification(phone: string): Promise<OtpSession | undefined>;
  markOtpAsVerified(id: number): Promise<void>;
  cleanupExpiredOtp(): Promise<void>;

  // Docket operations
  getDocketByUserId(userId: string): Promise<Docket | undefined>;
  createDocket(docket: InsertDocket): Promise<Docket>;
  updateDocket(userId: string, updates: Partial<Docket>): Promise<Docket>;

  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    completedDockets: number;
    pendingDockets: number;
    issues: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createOtpVerification(session: InsertOtpSession): Promise<OtpSession> {
    // First clean up any existing sessions for this phone
    await db.delete(otpSessions).where(eq(otpSessions.phone, session.phone));
    
    const [otpSession] = await db
      .insert(otpSessions)
      .values(session)
      .returning();
    return otpSession;
  }

  async getLatestOtpVerification(phone: string): Promise<OtpSession | undefined> {
    const [session] = await db
      .select()
      .from(otpSessions)
      .where(eq(otpSessions.phone, phone))
      .orderBy(desc(otpSessions.createdAt));
    return session || undefined;
  }

  async markOtpAsVerified(id: number): Promise<void> {
    await db
      .update(otpSessions)
      .set({ verified: true })
      .where(eq(otpSessions.id, id));
  }

  async cleanupExpiredOtp(): Promise<void> {
    await db
      .delete(otpSessions)
      .where(lt(otpSessions.expiresAt, new Date()));
  }

  async getDocketByUserId(userId: string): Promise<Docket | undefined> {
    const [docket] = await db.select().from(dockets).where(eq(dockets.userId, userId));
    return docket || undefined;
  }

  async createDocket(docket: InsertDocket): Promise<Docket> {
    const [newDocket] = await db
      .insert(dockets)
      .values(docket)
      .returning();
    return newDocket;
  }

  async updateDocket(userId: string, updates: Partial<Docket>): Promise<Docket> {
    // First check if docket exists
    let docket = await this.getDocketByUserId(userId);
    
    if (!docket) {
      // Create new docket
      docket = await this.createDocket({ userId, ...updates });
    } else {
      // Update existing docket
      const [updatedDocket] = await db
        .update(dockets)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(dockets.userId, userId))
        .returning();
      docket = updatedDocket;
    }
    
    return docket;
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    completedDockets: number;
    pendingDockets: number;
    issues: number;
  }> {
    const allUsers = await this.getAllUsers();
    const totalUsers = allUsers.length;
    const completedDockets = allUsers.filter(u => u.docketCompleted).length;
    const pendingDockets = totalUsers - completedDockets;
    
    return {
      totalUsers,
      completedDockets,
      pendingDockets,
      issues: 0, // Can be implemented based on specific business logic
    };
  }
}

export const storage = new DatabaseStorage();
