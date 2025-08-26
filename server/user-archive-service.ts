import { storage } from "./storage";
import { AuditService } from "./audit-service";
import type { User } from "@shared/schema";

interface ArchiveStats {
  totalUsers: number;
  activeUsers: number;
  archivedUsers: number;
  usersEligibleForArchive: number;
  oldestUserAge: number;
}

export class UserArchiveService {
  private static instance: UserArchiveService;
  private running = false;

  public static getInstance(): UserArchiveService {
    if (!UserArchiveService.instance) {
      UserArchiveService.instance = new UserArchiveService();
    }
    return UserArchiveService.instance;
  }

  /**
   * Check for users older than 1 year and archive them automatically
   */
  public async runAutomaticArchive(): Promise<{
    archived: number;
    errors: string[];
    summary: string;
  }> {
    if (this.running) {
      return {
        archived: 0,
        errors: ["Archive service is already running"],
        summary: "Archive service busy"
      };
    }

    this.running = true;
    const errors: string[] = [];
    let archivedCount = 0;

    try {
      console.log("🗂️  [Archive Service] Starting automatic user archive check...");

      // Get users older than 1 year who are not already archived
      const eligibleUsers = await storage.getUsersOlderThanOneYear();
      
      if (eligibleUsers.length === 0) {
        console.log("✅ [Archive Service] No users found eligible for archiving");
        return {
          archived: 0,
          errors: [],
          summary: "No users eligible for archiving"
        };
      }

      console.log(`📊 [Archive Service] Found ${eligibleUsers.length} users eligible for archiving`);

      // Archive each eligible user
      for (const user of eligibleUsers) {
        try {
          const userAge = this.calculateUserAgeInDays(user.createdAt!);
          const archiveReason = `automatic_archive_${userAge}_days_old`;

          await storage.archiveUser(user.id, archiveReason);
          archivedCount++;

          console.log(`📦 [Archive Service] Archived user: ${user.email} (${userAge} days old)`);

          // Log to audit system
          await AuditService.logSystemActivity('USER_ARCHIVED', {
            userId: user.id
          });

        } catch (error) {
          const errorMsg = `Failed to archive user ${user.email}: ${error}`;
          console.error(`❌ [Archive Service] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      const summary = `Archived ${archivedCount} users out of ${eligibleUsers.length} eligible`;
      console.log(`✅ [Archive Service] ${summary}`);

      return {
        archived: archivedCount,
        errors,
        summary
      };

    } catch (error) {
      const errorMsg = `Archive service error: ${error}`;
      console.error(`❌ [Archive Service] ${errorMsg}`);
      errors.push(errorMsg);
      
      return {
        archived: archivedCount,
        errors,
        summary: "Archive service encountered errors"
      };
    } finally {
      this.running = false;
    }
  }

  /**
   * Get comprehensive archive statistics
   */
  public async getArchiveStats(): Promise<ArchiveStats> {
    try {
      const [allUsers, activeUsers, archivedUsers, eligibleUsers] = await Promise.all([
        storage.getAllUsers(),
        storage.getActiveUsers(), 
        storage.getArchivedUsers(),
        storage.getUsersOlderThanOneYear()
      ]);

      // Find oldest user
      let oldestUserAge = 0;
      if (activeUsers.length > 0) {
        const oldestUser = activeUsers.reduce((oldest, user) => 
          (!user.createdAt || !oldest.createdAt) ? oldest :
          user.createdAt < oldest.createdAt ? user : oldest
        );
        if (oldestUser.createdAt) {
          oldestUserAge = this.calculateUserAgeInDays(oldestUser.createdAt);
        }
      }

      return {
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        archivedUsers: archivedUsers.length,
        usersEligibleForArchive: eligibleUsers.length,
        oldestUserAge
      };
    } catch (error) {
      console.error("❌ [Archive Service] Error getting stats:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        archivedUsers: 0,
        usersEligibleForArchive: 0,
        oldestUserAge: 0
      };
    }
  }

  /**
   * Manually archive a user
   */
  public async archiveUser(userId: string, reason: string = "manual_archive"): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    if (user.archived) {
      throw new Error(`User ${user.email} is already archived`);
    }

    await storage.archiveUser(userId, reason);
    console.log(`📦 [Archive Service] Manually archived user: ${user.email}`);

    // Log to audit system
    await AuditService.logSystemActivity('USER_MANUALLY_ARCHIVED', {
      userId: user.id
    });
  }

  /**
   * Restore a user from archive
   */
  public async unarchiveUser(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    if (!user.archived) {
      throw new Error(`User ${user.email} is not archived`);
    }

    await storage.unarchiveUser(userId);
    console.log(`📤 [Archive Service] Unarchived user: ${user.email}`);

    // Log to audit system
    await AuditService.logSystemActivity('USER_UNARCHIVED', {
      userId: user.id
    });
  }

  /**
   * Get list of archived users with details
   */
  public async getArchivedUsers(): Promise<User[]> {
    return await storage.getArchivedUsers();
  }

  /**
   * Get users eligible for archiving (older than 1 year)
   */
  public async getUsersEligibleForArchive(): Promise<User[]> {
    return await storage.getUsersOlderThanOneYear();
  }

  /**
   * Calculate user age in days
   */
  private calculateUserAgeInDays(createdAt: Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Schedule automatic archiving to run periodically
   */
  public startScheduledArchiving(): void {
    // Run archive check every 24 hours
    const ARCHIVE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    console.log("🕐 [Archive Service] Starting scheduled archiving (every 24 hours)");
    
    // Run immediately on startup
    this.runAutomaticArchive().catch(error => {
      console.error("❌ [Archive Service] Initial archive check failed:", error);
    });
    
    // Then run every 24 hours
    setInterval(async () => {
      try {
        const result = await this.runAutomaticArchive();
        console.log(`📊 [Archive Service] Scheduled archive complete: ${result.summary}`);
      } catch (error) {
        console.error("❌ [Archive Service] Scheduled archive failed:", error);
      }
    }, ARCHIVE_INTERVAL);
  }

  /**
   * Check if service is currently running
   */
  public isRunning(): boolean {
    return this.running;
  }
}

// Export singleton instance
export const userArchiveService = UserArchiveService.getInstance();