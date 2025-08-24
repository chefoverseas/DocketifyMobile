import { DatabaseStorage } from "./storage";
import { sendDocketReminderEmail } from "./sendgrid";
import { AuditService } from "./audit-service";

interface UserDocketStatus {
  id: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  docketCompleted: boolean | null;
  docket: any;
  createdAt: Date | null;
}

export class DocketReminderService {
  private storage: DatabaseStorage;
  private reminderInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  /**
   * Start the docket reminder service - runs every 24 hours
   */
  start(): void {
    console.log('🔔 Starting docket reminder service - checking every 24 hours');
    
    // Run initial check after 1 minute (to allow system startup)
    setTimeout(() => {
      this.sendDocketReminders();
    }, 60 * 1000);
    
    // Schedule subsequent checks every 24 hours
    this.reminderInterval = setInterval(() => {
      this.sendDocketReminders();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Stop the reminder service
   */
  stop(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('🔔 Docket reminder service stopped');
    }
  }

  /**
   * Check for incomplete dockets and send reminder emails
   */
  private async sendDocketReminders(): Promise<void> {
    try {
      console.log('🔍 [Docket Reminders] Starting daily docket reminder check...');
      const startTime = Date.now();
      
      // Get all users with incomplete dockets
      const incompleteUsers = await this.getIncompleteUsers();
      
      console.log(`📊 [Docket Reminders] Found ${incompleteUsers.length} users with incomplete dockets`);
      
      let remindersSent = 0;
      let errors = 0;
      
      // Send reminder emails to users with incomplete dockets
      for (const user of incompleteUsers) {
        try {
          // Check if user has been registered for more than 1 hour (to avoid spamming new users immediately)
          const userCreatedAt = user.createdAt ? new Date(user.createdAt) : new Date();
          const timeSinceRegistration = Date.now() - userCreatedAt.getTime();
          const oneHour = 60 * 60 * 1000;
          
          if (timeSinceRegistration < oneHour) {
            console.log(`⏳ [Docket Reminders] Skipping ${user.email} - registered less than 1 hour ago`);
            continue;
          }

          const missingDocuments = this.getMissingDocuments(user.docket);
          
          console.log(`📧 [Docket Reminders] Sending reminder to ${user.email} - missing: ${missingDocuments.join(', ')}`);
          
          const emailSent = await sendDocketReminderEmail(
            user.email || '',
            user.displayName || user.phone || 'User',
            missingDocuments
          );
          
          if (emailSent) {
            remindersSent++;
            
            // Log audit trail
            await AuditService.log('VIEW', 'notification', {
              userId: user.id,
              metadata: { 
                reminderType: 'docket_incomplete',
                missingDocuments,
                emailAddress: user.email
              }
            }, {
              description: `Docket reminder sent to user ${user.email}`,
              severity: 'info'
            });
            
          } else {
            errors++;
            console.error(`❌ [Docket Reminders] Failed to send reminder to ${user.email}`);
          }
          
          // Small delay to avoid overwhelming the email service
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          errors++;
          console.error(`❌ [Docket Reminders] Error processing user ${user.email}:`, error);
        }
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ [Docket Reminders] Reminder check complete - ${remindersSent} reminders sent, ${errors} errors (${duration}ms)`);
      
      // Log service completion audit
      await AuditService.log('SYNC_COMPLETE', 'system', {
        metadata: {
          serviceType: 'docket_reminders',
          usersProcessed: incompleteUsers.length,
          remindersSent,
          errors,
          duration
        }
      }, {
        description: `Docket reminder service completed - ${remindersSent} reminders sent`,
        severity: errors > 0 ? 'warning' : 'info'
      });
      
    } catch (error) {
      console.error('❌ [Docket Reminders] Service error:', error);
      
      // Log error audit
      await AuditService.log('SYNC_COMPLETE', 'system', {
        metadata: { 
          serviceType: 'docket_reminders',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }, {
        description: 'Docket reminder service failed',
        severity: 'error'
      });
    }
  }

  /**
   * Get all users with incomplete dockets
   */
  private async getIncompleteUsers(): Promise<UserDocketStatus[]> {
    const allUsers = await this.storage.getAllUsers();
    const incompleteUsers: UserDocketStatus[] = [];
    
    for (const user of allUsers) {
      // Skip if docket is already completed or user has no email
      if (user.docketCompleted || !user.email) {
        continue;
      }
      
      // Get user's docket
      const docket = await this.storage.getDocketByUserId(user.id);
      
      // Check if docket has missing required documents
      const missingDocuments = this.getMissingDocuments(docket);
      
      if (missingDocuments.length > 0) {
        incompleteUsers.push({
          id: user.id,
          email: user.email || '',
          displayName: user.displayName || '',
          phone: user.phone || '',
          docketCompleted: user.docketCompleted || false,
          docket,
          createdAt: user.createdAt || new Date()
        });
      }
    }
    
    return incompleteUsers;
  }

  /**
   * Get list of missing required documents for a docket
   */
  private getMissingDocuments(docket: any): string[] {
    if (!docket) {
      return [
        'Passport Front Page',
        'Passport Last Page', 
        'Passport Photo Page',
        'Offer Letter',
        'Permanent Address Proof',
        'Current Address Proof'
      ];
    }

    const missingDocs: string[] = [];
    
    if (!docket.passportFrontUrl) missingDocs.push('Passport Front Page');
    if (!docket.passportLastUrl) missingDocs.push('Passport Last Page');
    if (!docket.passportPhotoUrl) missingDocs.push('Passport Photo Page');
    if (!docket.offerLetterUrl) missingDocs.push('Offer Letter');
    if (!docket.permanentAddressUrl) missingDocs.push('Permanent Address Proof');
    if (!docket.currentAddressUrl) missingDocs.push('Current Address Proof');
    
    return missingDocs;
  }

  /**
   * Manual trigger for testing purposes
   */
  async triggerManualReminderCheck(): Promise<{ sent: number; errors: number }> {
    console.log('🔔 [Manual Trigger] Starting manual docket reminder check...');
    
    const incompleteUsers = await this.getIncompleteUsers();
    let sent = 0;
    let errors = 0;
    
    for (const user of incompleteUsers) {
      try {
        const missingDocuments = this.getMissingDocuments(user.docket);
        const emailSent = await sendDocketReminderEmail(
          user.email || '',
          user.displayName || user.phone || 'User',
          missingDocuments
        );
        
        if (emailSent) {
          sent++;
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
      }
    }
    
    console.log(`✅ [Manual Trigger] Reminder check complete - ${sent} reminders sent, ${errors} errors`);
    return { sent, errors };
  }
}

// Export singleton instance
export const docketReminderService = new DocketReminderService();