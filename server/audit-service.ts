import { db } from "./db";
import { auditLogs, type InsertAuditLog, type AuditLog } from "@shared/schema";
import { desc, and, gte, lte, eq, ilike, or } from "drizzle-orm";

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' 
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'UPLOAD' | 'DOWNLOAD' | 'VIEW'
  | 'STATUS_CHANGE' | 'PERMISSION_CHANGE'
  | 'SYNC_START' | 'SYNC_COMPLETE';

export type AuditEntityType = 
  | 'user' | 'docket' | 'contract' | 'work_permit' | 'work_visa'
  | 'notification' | 'system' | 'session' | 'file';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditContext {
  userId?: string;
  adminEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(
    action: AuditAction,
    entityType: AuditEntityType,
    context: AuditContext,
    options?: {
      entityId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      description?: string;
      severity?: AuditSeverity;
    }
  ): Promise<void> {
    try {
      const auditEntry: InsertAuditLog = {
        userId: context.userId || null,
        adminEmail: context.adminEmail || null,
        action,
        entityType,
        entityId: options?.entityId || null,
        oldValues: options?.oldValues || null,
        newValues: options?.newValues || null,
        metadata: context.metadata || null,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
        sessionId: context.sessionId || null,
        severity: options?.severity || 'info',
        description: options?.description || this.generateDescription(action, entityType, options?.entityId),
      };

      await db.insert(auditLogs).values(auditEntry);
      
      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📋 AUDIT: ${action} ${entityType}${options?.entityId ? ` (${options.entityId})` : ''} by ${context.adminEmail || context.userId || 'system'}`);
      }
    } catch (error) {
      console.error('❌ Failed to log audit event:', error);
      // Don't throw - audit logging should not break application flow
    }
  }

  /**
   * Log user authentication events
   */
  static async logAuth(
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED',
    userIdOrEmail: string,
    context: AuditContext,
    isAdmin: boolean = false
  ): Promise<void> {
    await this.log(action, 'session', context, {
      entityId: userIdOrEmail,
      description: `${isAdmin ? 'Admin' : 'User'} ${action.toLowerCase()} ${isAdmin ? '' : 'attempt'}`,
      severity: action === 'LOGIN_FAILED' ? 'warning' : 'info',
      metadata: {
        isAdmin,
        timestamp: new Date().toISOString(),
      }
    });
  }

  /**
   * Log data changes with before/after values
   */
  static async logDataChange(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: AuditEntityType,
    entityId: string,
    context: AuditContext,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    await this.log(action, entityType, context, {
      entityId,
      oldValues,
      newValues,
      description: this.generateDataChangeDescription(action, entityType, entityId, oldValues, newValues),
      severity: action === 'DELETE' ? 'warning' : 'info',
    });
  }

  /**
   * Log file operations
   */
  static async logFileOperation(
    action: 'UPLOAD' | 'DOWNLOAD' | 'DELETE',
    fileName: string,
    context: AuditContext,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(action, 'file', context, {
      entityId: fileName,
      description: `File ${action.toLowerCase()}: ${fileName}`,
      severity: action === 'DELETE' ? 'warning' : 'info',
      metadata: {
        fileName,
        fileSize: metadata?.fileSize,
        mimeType: metadata?.mimeType,
        ...metadata,
      }
    });
  }

  /**
   * Log system events
   */
  static async logSystem(
    action: AuditAction,
    description: string,
    context: AuditContext = {},
    severity: AuditSeverity = 'info'
  ): Promise<void> {
    await this.log(action, 'system', context, {
      description,
      severity,
      metadata: {
        timestamp: new Date().toISOString(),
        ...context.metadata,
      }
    });
  }

  /**
   * Get audit logs with filtering and pagination
   */
  static async getAuditLogs(options: {
    page?: number;
    limit?: number;
    userId?: string;
    adminEmail?: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    entityId?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 50,
      userId,
      adminEmail,
      action,
      entityType,
      entityId,
      severity,
      startDate,
      endDate,
      search
    } = options;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const conditions = [];
    
    if (userId) conditions.push(eq(auditLogs.userId, userId));
    if (adminEmail) conditions.push(eq(auditLogs.adminEmail, adminEmail));
    if (action) conditions.push(eq(auditLogs.action, action));
    if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
    if (entityId) conditions.push(eq(auditLogs.entityId, entityId));
    if (severity) conditions.push(eq(auditLogs.severity, severity));
    if (startDate) conditions.push(gte(auditLogs.timestamp, startDate));
    if (endDate) conditions.push(lte(auditLogs.timestamp, endDate));
    
    if (search) {
      conditions.push(
        or(
          ilike(auditLogs.description, `%${search}%`),
          ilike(auditLogs.entityId, `%${search}%`),
          ilike(auditLogs.adminEmail, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db.select().from(auditLogs).where(whereClause);
    const total = totalResult.length;

    // Get paginated results
    const logs = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(days: number = 30): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByEntity: Record<string, number>;
    actionsBySeverity: Record<string, number>;
    dailyActivity: Array<{ date: string; count: number }>;
    topUsers: Array<{ user: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db
      .select()
      .from(auditLogs)
      .where(gte(auditLogs.timestamp, startDate))
      .orderBy(desc(auditLogs.timestamp));

    const stats = {
      totalActions: logs.length,
      actionsByType: {} as Record<string, number>,
      actionsByEntity: {} as Record<string, number>,
      actionsBySeverity: {} as Record<string, number>,
      dailyActivity: [] as Array<{ date: string; count: number }>,
      topUsers: [] as Array<{ user: string; count: number }>,
    };

    // Count by type, entity, severity
    const userCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    logs.forEach(log => {
      // Action types
      stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;
      
      // Entity types
      stats.actionsByEntity[log.entityType] = (stats.actionsByEntity[log.entityType] || 0) + 1;
      
      // Severity
      stats.actionsBySeverity[log.severity || 'info'] = (stats.actionsBySeverity[log.severity || 'info'] || 0) + 1;
      
      // User activity
      const user = log.adminEmail || log.userId || 'system';
      userCounts[user] = (userCounts[user] || 0) + 1;
      
      // Daily activity
      const date = log.timestamp?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    // Convert to arrays and sort
    stats.topUsers = Object.entries(userCounts)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    stats.dailyActivity = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  }

  /**
   * Generate human-readable description
   */
  private static generateDescription(action: AuditAction, entityType: AuditEntityType, entityId?: string): string {
    const entity = entityId ? ` ${entityId}` : '';
    const entityName = entityType.replace('_', ' ');
    
    switch (action) {
      case 'CREATE': return `Created ${entityName}${entity}`;
      case 'UPDATE': return `Updated ${entityName}${entity}`;
      case 'DELETE': return `Deleted ${entityName}${entity}`;
      case 'LOGIN': return `User logged in`;
      case 'LOGOUT': return `User logged out`;
      case 'LOGIN_FAILED': return `Failed login attempt`;
      case 'UPLOAD': return `Uploaded file${entity}`;
      case 'DOWNLOAD': return `Downloaded file${entity}`;
      case 'VIEW': return `Viewed ${entityName}${entity}`;
      case 'STATUS_CHANGE': return `Changed status of ${entityName}${entity}`;
      case 'PERMISSION_CHANGE': return `Changed permissions for ${entityName}${entity}`;
      case 'SYNC_START': return `Started data synchronization`;
      case 'SYNC_COMPLETE': return `Completed data synchronization`;
      default: return `${action} ${entityName}${entity}`;
    }
  }

  /**
   * Generate detailed description for data changes
   */
  private static generateDataChangeDescription(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: AuditEntityType,
    entityId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): string {
    const entityName = entityType.replace('_', ' ');
    
    if (action === 'CREATE') {
      return `Created ${entityName} ${entityId}`;
    }
    
    if (action === 'DELETE') {
      return `Deleted ${entityName} ${entityId}`;
    }
    
    if (action === 'UPDATE' && oldValues && newValues) {
      const changedFields = Object.keys(newValues).filter(
        key => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
      );
      
      if (changedFields.length > 0) {
        return `Updated ${entityName} ${entityId}: ${changedFields.join(', ')}`;
      }
    }
    
    return `Updated ${entityName} ${entityId}`;
  }
}