import { 
  users, 
  dockets, 
  otpSessions, 
  contracts, 
  adminSessions, 
  workPermits, 
  workVisas,
  notifications,
  type User, 
  type UpsertUser,
  type InsertUser, 
  type Docket, 
  type InsertDocket, 
  type OtpSession, 
  type InsertOtpSession, 
  type Contract, 
  type InsertContract, 
  type AdminSession, 
  type InsertAdminSession, 
  type WorkPermit, 
  type InsertWorkPermit,
  type WorkVisa,
  type InsertWorkVisa,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";
import { AuditService } from "./audit-service";

export interface IStorage {
  // User operations (updated for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  generateUniqueUid(): Promise<string>;

  // Archive operations
  archiveUser(userId: string, reason: string): Promise<void>;
  unarchiveUser(userId: string): Promise<void>;
  getArchivedUsers(): Promise<User[]>;
  getActiveUsers(): Promise<User[]>;
  getUsersOlderThanOneYear(): Promise<User[]>;

  // Email OTP operations
  createOtpVerification(session: InsertOtpSession): Promise<OtpSession>;
  getLatestOtpVerification(email: string): Promise<OtpSession | undefined>;
  markOtpAsVerified(id: number): Promise<void>;
  cleanupExpiredOtp(): Promise<void>;

  // Docket operations
  getDocketByUserId(userId: string): Promise<Docket | undefined>;
  createDocket(docket: InsertDocket): Promise<Docket>;
  updateDocket(userId: string, updates: Partial<Docket>): Promise<Docket>;
  getAllDockets(): Promise<Docket[]>;

  // Contract operations
  getContractByUserId(userId: string): Promise<Contract | undefined>;
  getContract(userId: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(userId: string, updates: Partial<Contract>): Promise<Contract>;
  getAllContracts(): Promise<(Contract & { user: User })[]>;

  // Work permit operations
  getWorkPermitByUserId(userId: string): Promise<WorkPermit | undefined>;
  createWorkPermit(workPermit: InsertWorkPermit): Promise<WorkPermit>;
  updateWorkPermit(userId: string, updates: Partial<InsertWorkPermit>): Promise<WorkPermit>;
  getAllWorkPermits(): Promise<(WorkPermit & { user: User })[]>;

  // Work visa operations
  getWorkVisaByUserId(userId: string): Promise<WorkVisa | undefined>;
  createWorkVisa(workVisa: InsertWorkVisa): Promise<WorkVisa>;
  updateWorkVisa(userId: string, updates: Partial<InsertWorkVisa>): Promise<WorkVisa>;
  getAllWorkVisas(): Promise<(WorkVisa & { user: User })[]>;

  // Admin session operations
  createAdminSession(session: InsertAdminSession): Promise<AdminSession>;
  getAdminSession(sessionToken: string): Promise<AdminSession | undefined>;
  deleteAdminSession(sessionToken: string): Promise<void>;
  cleanupExpiredAdminSessions(): Promise<void>;

  // Admin operations
  getUserById(id: string): Promise<User | undefined>;
  getAllContracts(): Promise<(Contract & { user: User })[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    completedDockets: number;
    pendingDockets: number;
    contractsPending: number;
    issues: number;
  }>;

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<number>;
  dismissNotification(notificationId: string, userId: string): Promise<void>;

  // Audit operations
  getAuditLogs(options: any): Promise<any>;
  getAuditStats(days?: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid));
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

  async updateUserPhoto(uid: string, photoUrl: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ 
        photoUrl,
        updatedAt: new Date()
      })
      .where(eq(users.uid, uid))
      .returning();
    return user || null;
  }

  async deleteUser(id: string): Promise<void> {
    console.log(`🗑️  Starting cascading deletion for user: ${id}`);
    
    try {
      // Get user details for logging
      const user = await this.getUser(id);
      if (!user) {
        console.log(`❌ User ${id} not found for deletion`);
        return;
      }
      
      console.log(`Deleting user: ${user.email} (${user.displayName})`);
      
      // Delete all related records with cascade (order matters for foreign key constraints)
      // 1. Delete OTP sessions for this user's email
      if (user.email) {
        const deletedOtpSessions = await db.delete(otpSessions).where(eq(otpSessions.email, user.email));
        console.log(`🔐 Deleted OTP sessions for ${user.email}`);
      }
      
      // 2. Delete work permits
      const deletedWorkPermits = await db.delete(workPermits).where(eq(workPermits.userId, id));
      console.log(`📋 Deleted work permits for user ${id}`);
      
      // 3. Delete contracts
      const deletedContracts = await db.delete(contracts).where(eq(contracts.userId, id));
      console.log(`📄 Deleted contracts for user ${id}`);
      
      // 4. Delete dockets
      const deletedDockets = await db.delete(dockets).where(eq(dockets.userId, id));
      console.log(`📁 Deleted dockets for user ${id}`);
      
      // 5. Finally delete the user
      const deletedUser = await db.delete(users).where(eq(users.id, id));
      console.log(`👤 Deleted user record ${id}`);
      
      console.log(`✅ Successfully completed cascading deletion for user: ${user.email}`);
      
      // Log user deletion for audit
      await AuditService.logDataChange('DELETE', 'user', user.id, {
        adminEmail: 'info@chefoverseas.com',
        metadata: { 
          deletedUserEmail: user.email,
          deletedUserName: user.displayName,
          deletionTime: new Date().toISOString()
        }
      }, {
        email: user.email,
        displayName: user.displayName,
        uid: user.uid
      }, undefined);
      
    } catch (error) {
      console.error(`❌ Error during cascading deletion for user ${id}:`, error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async generateUniqueUid(): Promise<string> {
    let uid: string;
    let existingUser: User | undefined;
    
    do {
      uid = Math.floor(10000000 + Math.random() * 90000000).toString();
      existingUser = await this.getUserByUid(uid);
    } while (existingUser);
    
    return uid;
  }

  // Archive operations
  async archiveUser(userId: string, reason: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    await db
      .update(users)
      .set({
        archived: true,
        archivedAt: new Date(),
        archivedReason: reason,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Log archive action for audit
    await AuditService.logDataChange('UPDATE', 'user', userId, {
      adminEmail: 'system',
      metadata: { 
        action: 'ARCHIVE',
        reason,
        archivedAt: new Date().toISOString(),
        userEmail: user.email
      }
    }, user, { archived: true, archivedAt: new Date(), archivedReason: reason });
  }

  async unarchiveUser(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    await db
      .update(users)
      .set({
        archived: false,
        archivedAt: null,
        archivedReason: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Log unarchive action for audit
    await AuditService.logDataChange('UPDATE', 'user', userId, {
      adminEmail: 'system',
      metadata: { 
        action: 'UNARCHIVE',
        unarchivedAt: new Date().toISOString(),
        userEmail: user.email
      }
    }, { archived: true, archivedAt: user.archivedAt, archivedReason: user.archivedReason }, { archived: false });
  }

  async getArchivedUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.archived, true))
      .orderBy(desc(users.archivedAt));
  }

  async getActiveUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.archived, false))
      .orderBy(desc(users.createdAt));
  }

  async getUsersOlderThanOneYear(): Promise<User[]> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return await db
      .select()
      .from(users)
      .where(and(
        eq(users.archived, false), // Only non-archived users
        lt(users.createdAt, oneYearAgo)
      ))
      .orderBy(users.createdAt);
  }

  async createOtpVerification(session: InsertOtpSession): Promise<OtpSession> {
    // First clean up any existing sessions for this email
    await db.delete(otpSessions).where(eq(otpSessions.email, session.email));
    
    const [otpSession] = await db
      .insert(otpSessions)
      .values(session)
      .returning();
    return otpSession;
  }

  async getLatestOtpVerification(email: string): Promise<OtpSession | undefined> {
    const [session] = await db
      .select()
      .from(otpSessions)
      .where(eq(otpSessions.email, email))
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
    const validatedDocket = {
      ...docket,
      passportVisaUrls: Array.isArray(docket.passportVisaUrls) ? [...docket.passportVisaUrls] as string[] : [],
      educationFiles: Array.isArray(docket.educationFiles) ? [...docket.educationFiles] : [],
      experienceFiles: Array.isArray(docket.experienceFiles) ? [...docket.experienceFiles] : [],
      otherCertifications: Array.isArray(docket.otherCertifications) ? [...docket.otherCertifications] : [],
      references: Array.isArray(docket.references) ? [...docket.references] : []
    };
    
    const [newDocket] = await db
      .insert(dockets)
      .values(validatedDocket)
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
        .set({ 
          ...updates, 
          lastUpdated: new Date(),
          passportVisaUrls: Array.isArray(updates.passportVisaUrls) ? updates.passportVisaUrls : docket.passportVisaUrls,
          educationFiles: Array.isArray(updates.educationFiles) ? updates.educationFiles : docket.educationFiles,
          experienceFiles: Array.isArray(updates.experienceFiles) ? updates.experienceFiles : docket.experienceFiles,
          otherCertifications: Array.isArray(updates.otherCertifications) ? updates.otherCertifications : docket.otherCertifications,
          references: Array.isArray(updates.references) ? updates.references : docket.references
        })
        .where(eq(dockets.userId, userId))
        .returning();
      docket = updatedDocket;
    }
    
    return docket;
  }

  // Contract operations
  async getContractByUserId(userId: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.userId, userId));
    return contract || undefined;
  }

  async getContract(userId: string): Promise<Contract | undefined> {
    return this.getContractByUserId(userId);
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db
      .insert(contracts)
      .values([contract])
      .returning();
    return newContract;
  }

  async updateContract(userId: string, updates: Partial<Contract>): Promise<Contract> {
    // First check if contract exists
    let contract = await this.getContractByUserId(userId);
    
    if (!contract) {
      // Create new contract
      contract = await this.createContract({ userId, ...updates });
    } else {
      // Update existing contract
      const [updatedContract] = await db
        .update(contracts)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(contracts.userId, userId))
        .returning();
      contract = updatedContract;
    }
    
    return contract;
  }

  // Work permit operations
  async getWorkPermitByUserId(userId: string): Promise<WorkPermit | undefined> {
    const [workPermit] = await db.select().from(workPermits).where(eq(workPermits.userId, userId));
    return workPermit || undefined;
  }

  async createWorkPermit(workPermit: InsertWorkPermit): Promise<WorkPermit> {
    const [newWorkPermit] = await db
      .insert(workPermits)
      .values([workPermit])
      .returning();
    return newWorkPermit;
  }

  async updateWorkPermit(userId: string, updates: Partial<InsertWorkPermit>): Promise<WorkPermit> {
    // First check if work permit exists
    let workPermit = await this.getWorkPermitByUserId(userId);
    
    if (!workPermit) {
      // Create new work permit
      workPermit = await this.createWorkPermit({ userId, ...updates });
    } else {
      // If status is being set to 'applied' and no application date exists, set it
      if (updates.status === 'applied' && !workPermit.applicationDate) {
        updates.applicationDate = new Date();
      }
      
      // Update existing work permit
      const [updatedWorkPermit] = await db
        .update(workPermits)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(workPermits.userId, userId))
        .returning();
      workPermit = updatedWorkPermit;
    }
    
    return workPermit;
  }

  async getAllWorkPermits(): Promise<(WorkPermit & { user: User })[]> {
    const result = await db
      .select()
      .from(workPermits)
      .leftJoin(users, eq(workPermits.userId, users.id))
      .orderBy(desc(workPermits.lastUpdated));

    return result.map(({ work_permits, users: user }) => ({
      ...work_permits,
      user: user!
    }));
  }

  // Work visa operations
  async getWorkVisaByUserId(userId: string): Promise<WorkVisa | undefined> {
    const [workVisa] = await db.select().from(workVisas).where(eq(workVisas.userId, userId));
    return workVisa || undefined;
  }

  async createWorkVisa(workVisa: InsertWorkVisa): Promise<WorkVisa> {
    const [newWorkVisa] = await db
      .insert(workVisas)
      .values([workVisa])
      .returning();
    return newWorkVisa;
  }

  async updateWorkVisa(userId: string, updates: Partial<InsertWorkVisa>): Promise<WorkVisa> {
    // First check if work visa exists
    let workVisa = await this.getWorkVisaByUserId(userId);
    
    if (!workVisa) {
      // Create new work visa
      workVisa = await this.createWorkVisa({ userId, ...updates });
    } else {
      // If status is being set to 'applied' and no application date exists, set it
      if (updates.status === 'applied' && !workVisa.applicationDate) {
        updates.applicationDate = new Date();
      }
      
      // Update existing work visa
      const [updatedWorkVisa] = await db
        .update(workVisas)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(workVisas.userId, userId))
        .returning();
      workVisa = updatedWorkVisa;
    }
    
    return workVisa;
  }

  async getAllWorkVisas(): Promise<(WorkVisa & { user: User })[]> {
    const result = await db
      .select()
      .from(workVisas)
      .leftJoin(users, eq(workVisas.userId, users.id))
      .orderBy(desc(workVisas.lastUpdated));

    return result.map(({ work_visas, users: user }) => ({
      ...work_visas,
      user: user!
    }));
  }

  async getAllDockets(): Promise<Docket[]> {
    const result = await db
      .select()
      .from(dockets)
      .orderBy(desc(dockets.lastUpdated));
    
    return result;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getAllContracts(): Promise<(Contract & { user: User })[]> {
    const result = await db
      .select()
      .from(contracts)
      .leftJoin(users, eq(contracts.userId, users.id))
      .orderBy(desc(contracts.lastUpdated));
    
    return result.map(({ contracts: contract, users: user }) => ({
      ...contract!,
      user: user!
    }));
  }

  // Admin session operations
  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    const [adminSession] = await db
      .insert(adminSessions)
      .values(session)
      .returning();
    return adminSession;
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.sessionToken, sessionToken));
    return session || undefined;
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.sessionToken, sessionToken));
  }

  async cleanupExpiredAdminSessions(): Promise<void> {
    await db
      .delete(adminSessions)
      .where(lt(adminSessions.expiresAt, new Date()));
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    completedDockets: number;
    pendingDockets: number;
    contractsPending: number;
    issues: number;
  }> {
    const allUsers = await this.getAllUsers();
    const contractData = await db.select().from(contracts);
    
    const totalUsers = allUsers.length;
    const completedDockets = allUsers.filter(u => u.docketCompleted).length;
    const pendingDockets = totalUsers - completedDockets;
    const contractsPending = contractData.filter(c => 
      (c.companyContractStatus === 'pending' && c.companyContractOriginalUrl) || 
      (c.jobOfferStatus === 'pending' && c.jobOfferOriginalUrl)
    ).length;
    
    return {
      totalUsers,
      completedDockets,
      pendingDockets,
      contractsPending,
      issues: 0, // Can be implemented based on specific business logic
    };
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.dismissed, false)))
      .orderBy(desc(notifications.createdAt));
    
    return userNotifications;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return created;
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set({ 
        read: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();
    
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ 
        read: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ))
      .returning();
    
    return result.length;
  }

  async dismissNotification(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        dismissed: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }

  // Audit operations
  async getAuditLogs(options: any): Promise<any> {
    return await AuditService.getAuditLogs(options);
  }

  async getAuditStats(days: number = 30): Promise<any> {
    return await AuditService.getAuditStats(days);
  }
}

export const storage = new DatabaseStorage();
