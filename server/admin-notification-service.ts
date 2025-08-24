import { DatabaseStorage } from "./storage";
import { AuditService } from "./audit-service";

export class AdminNotificationService {
  private storage: DatabaseStorage;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  /**
   * Send 5 notifications to admin dashboard when user completes docket
   */
  async sendDocketCompletionNotifications(userId: string, userDisplayName: string, userEmail: string): Promise<void> {
    try {
      console.log(`🔔 [Admin Notifications] Sending docket completion notifications for user: ${userEmail}`);
      
      // Create 5 different notifications for admin dashboard
      const notifications = [
        {
          type: 'success' as const,
          title: '✅ Docket Completed',
          message: `${userDisplayName} (${userEmail}) has completed their docket with all required documents.`,
          actionUrl: `/admin/user/${userId}`,
          priority: 'high' as const
        },
        {
          type: 'info' as const,
          title: '📋 Document Review Required',
          message: `New completed docket from ${userDisplayName} requires admin review and verification.`,
          actionUrl: `/admin/docket-upload/${userId}`,
          priority: 'high' as const
        },
        {
          type: 'success' as const,
          title: '🚀 Ready for Processing',
          message: `${userDisplayName}'s application is ready to move to the next stage of processing.`,
          actionUrl: `/admin/user/${userId}`,
          priority: 'medium' as const
        },
        {
          type: 'info' as const,
          title: '📊 Application Progress',
          message: `${userDisplayName} has reached a major milestone - docket completion achieved.`,
          actionUrl: `/admin/user/${userId}`,
          priority: 'medium' as const
        },
        {
          type: 'success' as const,
          title: '🎉 User Achievement',
          message: `Congratulations to ${userDisplayName} for successfully completing all required documentation.`,
          actionUrl: `/admin/user/${userId}`,
          priority: 'low' as const
        }
      ];

      // Create admin user ID (we'll create a system admin user)
      let adminUser = await this.storage.getUserByEmail('admin@chefoverseas.com');
      
      if (!adminUser) {
        // Create system admin user for notifications if doesn't exist
        adminUser = await this.storage.createUser({
          email: 'admin@chefoverseas.com',
          displayName: 'System Admin',
          firstName: 'System',
          lastName: 'Admin',
          isAdmin: true,
          docketCompleted: true
        });
      }

      // Send each notification
      for (let i = 0; i < notifications.length; i++) {
        const notif = notifications[i];
        
        await this.storage.createNotification({
          userId: adminUser.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          actionUrl: notif.actionUrl,
          priority: notif.priority,
          read: false,
          dismissed: false
        });

        console.log(`📨 [Admin Notifications] Sent notification ${i + 1}/5: ${notif.title}`);
        
        // Small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Log audit trail
      await AuditService.log('CREATE', 'notification', {
        adminEmail: 'system@chefoverseas.com',
        metadata: {
          notificationType: 'docket_completion',
          targetUser: userEmail,
          notificationCount: 5
        }
      }, {
        description: `Generated 5 admin notifications for docket completion by ${userEmail}`,
        severity: 'info'
      });

      console.log(`✅ [Admin Notifications] Successfully sent 5 docket completion notifications for ${userEmail}`);

    } catch (error) {
      console.error(`❌ [Admin Notifications] Failed to send notifications for user ${userEmail}:`, error);
      
      // Log error audit
      await AuditService.log('CREATE', 'notification', {
        adminEmail: 'system@chefoverseas.com',
        metadata: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          targetUser: userEmail
        }
      }, {
        description: `Failed to generate admin notifications for docket completion by ${userEmail}`,
        severity: 'error'
      });
    }
  }

  /**
   * Send work permit status change notifications to admin
   */
  async sendWorkPermitStatusNotification(userId: string, userEmail: string, status: string, oldStatus?: string): Promise<void> {
    try {
      let adminUser = await this.storage.getUserByEmail('admin@chefoverseas.com');
      
      if (!adminUser) {
        adminUser = await this.storage.createUser({
          email: 'admin@chefoverseas.com',
          displayName: 'System Admin',
          firstName: 'System',
          lastName: 'Admin',
          isAdmin: true,
          docketCompleted: true
        });
      }

      const statusEmoji = this.getStatusEmoji(status);
      const priorityLevel = this.getStatusPriority(status);
      
      await this.storage.createNotification({
        userId: adminUser.id,
        type: priorityLevel === 'high' ? 'warning' : 'info',
        title: `${statusEmoji} Work Permit Status Update`,
        message: `${userEmail}'s work permit status changed${oldStatus ? ` from ${oldStatus}` : ''} to ${status}`,
        actionUrl: `/admin/user/${userId}`,
        priority: priorityLevel,
        read: false,
        dismissed: false
      });

      console.log(`📨 [Admin Notifications] Sent work permit status notification for ${userEmail}: ${status}`);

    } catch (error) {
      console.error(`❌ [Admin Notifications] Failed to send work permit status notification:`, error);
    }
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌'; 
      case 'under_review': return '🔍';
      case 'preparation': return '📝';
      case 'submitted': return '📤';
      default: return '📋';
    }
  }

  private getStatusPriority(status: string): 'low' | 'medium' | 'high' {
    switch (status) {
      case 'approved':
      case 'rejected': 
        return 'high';
      case 'under_review':
      case 'submitted':
        return 'medium';
      default:
        return 'low';
    }
  }
}

// Export singleton instance
export const adminNotificationService = new AdminNotificationService();