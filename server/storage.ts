import { users, dockets, otpSessions, contracts, adminSessions, workPermits, type User, type InsertUser, type Docket, type InsertDocket, type OtpSession, type InsertOtpSession, type Contract, type InsertContract, type AdminSession, type InsertAdminSession, type WorkPermit, type InsertWorkPermit } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  generateUniqueUid(): Promise<string>;

  // OTP operations
  createOtpVerification(session: InsertOtpSession): Promise<OtpSession>;
  getLatestOtpVerification(phone: string): Promise<OtpSession | undefined>;
  markOtpAsVerified(id: number): Promise<void>;
  cleanupExpiredOtp(): Promise<void>;

  // Docket operations
  getDocketByUserId(userId: string): Promise<Docket | undefined>;
  createDocket(docket: InsertDocket): Promise<Docket>;
  updateDocket(userId: string, updates: Partial<Docket>): Promise<Docket>;
  getAllDockets(): Promise<Docket[]>;

  // Contract operations
  getContractByUserId(userId: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(userId: string, updates: Partial<Contract>): Promise<Contract>;

  // Work permit operations
  getWorkPermitByUserId(userId: string): Promise<WorkPermit | undefined>;
  createWorkPermit(workPermit: InsertWorkPermit): Promise<WorkPermit>;
  updateWorkPermit(userId: string, updates: Partial<InsertWorkPermit>): Promise<WorkPermit>;
  getAllWorkPermits(): Promise<(WorkPermit & { user: User })[]>;

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

  async deleteUser(id: string): Promise<void> {
    // Delete related records first
    await db.delete(dockets).where(eq(dockets.userId, id));
    await db.delete(contracts).where(eq(contracts.userId, id));
    await db.delete(workPermits).where(eq(workPermits.userId, id));
    
    // Delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid));
    return user || undefined;
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
    const insertData: InsertDocket = {
      ...docket,
      passportVisaUrls: docket.passportVisaUrls || [],
      educationFiles: docket.educationFiles || [],
      experienceFiles: docket.experienceFiles || [],
      otherCertifications: docket.otherCertifications || [],
      references: docket.references || []
    };

    const [newDocket] = await db
      .insert(dockets)
      .values([insertData])
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
}

export const storage = new DatabaseStorage();
