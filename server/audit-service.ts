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
    const authContext = {
      ...context,
      metadata: {
        ...context.metadata,
        isAdmin,
        timestamp: new Date().toISOString(),
      }
    };
    
    await this.log(action, 'session', authContext, {
      entityId: userIdOrEmail,
      description: `${isAdmin ? 'Admin' : 'User'} ${action.toLowerCase()} ${isAdmin ? '' : 'attempt'}`,
      severity: action === 'LOGIN_FAILED' ? 'warning' : 'info',
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
    const fileContext = {
      ...context,
      metadata: {
        ...context.metadata,
        fileName,
        fileSize: metadata?.fileSize,
        mimeType: metadata?.mimeType,
        ...metadata,
      }
    };
    
    await this.log(action, 'file', fileContext, {
      entityId: fileName,
      description: `File ${action.toLowerCase()}: ${fileName}`,
      severity: action === 'DELETE' ? 'warning' : 'info',
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
    const systemContext = {
      ...context,
      metadata: {
        ...context.metadata,
        timestamp: new Date().toISOString(),
      }
    };
    
    await this.log(action, 'system', systemContext, {
      description,
      severity,
    });
  }

  /**
   * Log system activity events (alias for logSystem)
   */
  static async logSystemActivity(
    description: string,
    context: AuditContext = {},
    severity: AuditSeverity = 'info'
  ): Promise<void> {
    await this.logSystem('SYNC_COMPLETE', description, context, severity);
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
   * Get comprehensive audit statistics with business analytics
   */
  static async getAuditStats(days: number = 30): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByEntity: Record<string, number>;
    actionsBySeverity: Record<string, number>;
    dailyActivity: Array<{ date: string; count: number }>;
    topUsers: Array<{ user: string; count: number }>;
    securityMetrics: {
      loginAttempts: number;
      failedLogins: number;
      successRate: number;
      uniqueIPs: number;
    };
    businessMetrics: {
      userEngagement: number;
      adminActivity: number;
      dataModifications: number;
      fileOperations: number;
    };
    performanceMetrics: {
      errorRate: number;
      peakHours: Array<{ hour: number; count: number }>;
      activityTrend: Array<{ hour: string; count: number }>;
    };
    riskMetrics: {
      highRiskActions: number;
      suspiciousActivity: number;
      errorEvents: number;
    };
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
      securityMetrics: {
        loginAttempts: 0,
        failedLogins: 0,
        successRate: 0,
        uniqueIPs: 0,
      },
      businessMetrics: {
        userEngagement: 0,
        adminActivity: 0,
        dataModifications: 0,
        fileOperations: 0,
      },
      performanceMetrics: {
        errorRate: 0,
        peakHours: [] as Array<{ hour: number; count: number }>,
        activityTrend: [] as Array<{ hour: string; count: number }>,
      },
      riskMetrics: {
        highRiskActions: 0,
        suspiciousActivity: 0,
        errorEvents: 0,
      },
    };

    // Count by type, entity, severity
    const userCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};
    const hourlyTrend: Record<string, number> = {};
    const ipSet = new Set<string>();

    logs.forEach(log => {
      const logDate = new Date(log.timestamp || new Date());
      
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
      const date = logDate.toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      
      // Hourly activity for peak hours analysis
      const hour = logDate.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      
      // Hourly trend for last 24 hours
      const hourKey = logDate.toISOString().substring(0, 14) + '00:00';
      hourlyTrend[hourKey] = (hourlyTrend[hourKey] || 0) + 1;
      
      // IP addresses for security analysis
      if (log.ipAddress) {
        ipSet.add(log.ipAddress);
      }
      
      // Security metrics
      if (log.action === 'LOGIN' || log.action === 'LOGIN_FAILED') {
        stats.securityMetrics.loginAttempts++;
        if (log.action === 'LOGIN_FAILED') {
          stats.securityMetrics.failedLogins++;
        }
      }
      
      // Business metrics
      if (log.adminEmail) {
        stats.businessMetrics.adminActivity++;
      } else if (log.userId) {
        stats.businessMetrics.userEngagement++;
      }
      
      if (['CREATE', 'UPDATE', 'DELETE'].includes(log.action)) {
        stats.businessMetrics.dataModifications++;
      }
      
      if (['UPLOAD', 'DOWNLOAD'].includes(log.action)) {
        stats.businessMetrics.fileOperations++;
      }
      
      // Risk metrics
      if (['DELETE', 'PERMISSION_CHANGE'].includes(log.action)) {
        stats.riskMetrics.highRiskActions++;
      }
      
      if (log.severity === 'error' || log.severity === 'critical') {
        stats.riskMetrics.errorEvents++;
        stats.performanceMetrics.errorRate++;
      }
      
      // Detect suspicious activity (multiple failed logins, unusual hours, etc.)
      if (log.action === 'LOGIN_FAILED' || 
          (hour < 6 || hour > 22) || 
          log.severity === 'warning') {
        stats.riskMetrics.suspiciousActivity++;
      }
    });

    // Convert to arrays and sort
    stats.topUsers = Object.entries(userCounts)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    stats.dailyActivity = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate security success rate
    stats.securityMetrics.successRate = stats.securityMetrics.loginAttempts > 0 
      ? Math.round(((stats.securityMetrics.loginAttempts - stats.securityMetrics.failedLogins) / stats.securityMetrics.loginAttempts) * 100)
      : 100;
    
    stats.securityMetrics.uniqueIPs = ipSet.size;
    
    // Peak hours analysis
    stats.performanceMetrics.peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Activity trend for charts
    stats.performanceMetrics.activityTrend = Object.entries(hourlyTrend)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
    
    // Calculate error rate as percentage
    stats.performanceMetrics.errorRate = stats.totalActions > 0 
      ? Math.round((stats.performanceMetrics.errorRate / stats.totalActions) * 100)
      : 0;

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