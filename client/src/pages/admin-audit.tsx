import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Activity, 
  Search, 
  Filter, 
  Calendar,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  User,
  Settings,
  FileText,
  Database,
  Globe,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  ShieldCheck,
  Zap,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface AuditLog {
  id: number;
  userId: string | null;
  adminEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  severity: string;
  description: string | null;
  timestamp: string;
}

interface AuditStats {
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
  actionsByEntity: Record<string, number>;
  actionsBySeverity: Record<string, number>;
  dailyActivity: Array<{ date: string; count: number }>;
  topUsers: Array<{ user: string; count: number }>;
}

export default function AdminAuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch audit logs
  const { data: auditData, isLoading: auditLoading, refetch } = useQuery({
    queryKey: ["/api/admin/audit", currentPage, searchTerm, filterAction, filterEntity, filterSeverity],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50"
      });
      
      if (searchTerm) params.append("search", searchTerm);
      if (filterAction !== "all") params.append("action", filterAction);
      if (filterEntity !== "all") params.append("entityType", filterEntity);
      if (filterSeverity !== "all") params.append("severity", filterSeverity);
      
      const response = await fetch(`/api/admin/audit?${params.toString()}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }
      
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch audit statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/audit/stats"],
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const logs = auditData?.logs || [];
  const stats = statsData?.stats || {} as AuditStats;

  // Get severity icon and color
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { icon: XCircle, color: 'text-red-600 bg-red-100', bgColor: 'bg-red-50' };
      case 'error':
        return { icon: AlertTriangle, color: 'text-red-500 bg-red-100', bgColor: 'bg-red-50' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-100', bgColor: 'bg-yellow-50' };
      case 'info':
      default:
        return { icon: Info, color: 'text-blue-600 bg-blue-100', bgColor: 'bg-blue-50' };
    }
  };

  // Get action icon and color
  const getActionInfo = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'UPDATE':
        return { icon: Settings, color: 'text-blue-600' };
      case 'DELETE':
        return { icon: XCircle, color: 'text-red-600' };
      case 'LOGIN':
      case 'LOGOUT':
        return { icon: User, color: 'text-purple-600' };
      case 'UPLOAD':
      case 'DOWNLOAD':
        return { icon: FileText, color: 'text-orange-600' };
      default:
        return { icon: Activity, color: 'text-gray-600' };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/50">
      {/* Modern Header */}
      <Card className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white border-none shadow-2xl mb-8 rounded-none">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                  <img 
                    src={chefOverseasLogo} 
                    alt="Chef Overseas Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">Audit & Compliance Center</h1>
                  <p className="text-blue-100 text-lg mt-1">
                    Comprehensive system activity monitoring and security auditing
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Real-time Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Complete Audit Trail</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Compliance</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="container mx-auto px-4 pb-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">Total</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Total Actions</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalActions || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-800">Info</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Normal Activity</h3>
              <p className="text-2xl font-bold text-green-600">{stats.actionsBySeverity?.info || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Info level events</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Warnings</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.actionsBySeverity?.warning || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Security alerts</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500 rounded-xl">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-red-100 text-red-800">Critical</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Critical Events</h3>
              <p className="text-2xl font-bold text-red-600">{(stats.actionsBySeverity?.error || 0) + (stats.actionsBySeverity?.critical || 0)}</p>
              <p className="text-sm text-gray-500 mt-2">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 border-b">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Filter className="h-6 w-6 mr-3 text-blue-600" />
              Audit Log Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="UPLOAD">Upload</SelectItem>
                  <SelectItem value="DOWNLOAD">Download</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="docket">Dockets</SelectItem>
                  <SelectItem value="contract">Contracts</SelectItem>
                  <SelectItem value="work_permit">Work Permits</SelectItem>
                  <SelectItem value="work_visa">Work Visas</SelectItem>
                  <SelectItem value="file">Files</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterAction("all");
                    setFilterEntity("all");
                    setFilterSeverity("all");
                  }}
                  className="flex-1"
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 border-b">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 mr-3 text-blue-600" />
              System Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {auditLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading audit logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No audit logs found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || filterAction || filterEntity || filterSeverity 
                    ? "Try adjusting your filters" 
                    : "System activity will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Entity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {logs.map((log) => {
                        const severityInfo = getSeverityInfo(log.severity);
                        const actionInfo = getActionInfo(log.action);
                        const SeverityIcon = severityInfo.icon;
                        const ActionIcon = actionInfo.icon;

                        return (
                          <tr key={log.id} className="hover:bg-blue-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div className="text-sm text-gray-900">
                                  {formatTimestamp(log.timestamp)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <ActionIcon className={`h-4 w-4 ${actionInfo.color}`} />
                                <Badge variant="outline" className="text-xs">
                                  {log.action}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">
                                {log.entityType.replace('_', ' ')}
                                {log.entityId && (
                                  <div className="text-xs text-gray-500 truncate max-w-32">
                                    {log.entityId}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {log.adminEmail || log.userId || 'System'}
                              </div>
                              {log.ipAddress && (
                                <div className="text-xs text-gray-500">{log.ipAddress}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <SeverityIcon className={`h-4 w-4 ${severityInfo.color.split(' ')[0]}`} />
                                <Badge className={severityInfo.color}>
                                  {log.severity}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-md truncate">
                                {log.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                                className="hover:bg-blue-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {auditData?.totalPages && auditData.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing page {auditData.page} of {auditData.totalPages} ({auditData.total} total records)
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(auditData.totalPages, currentPage + 1))}
                        disabled={currentPage === auditData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 border-b">
              <CardTitle className="flex items-center justify-between">
                <span>Audit Log Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Event Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Action:</strong> {selectedLog.action}</div>
                    <div><strong>Entity Type:</strong> {selectedLog.entityType}</div>
                    <div><strong>Entity ID:</strong> {selectedLog.entityId || 'N/A'}</div>
                    <div><strong>Severity:</strong> {selectedLog.severity}</div>
                    <div><strong>Timestamp:</strong> {formatTimestamp(selectedLog.timestamp)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>User ID:</strong> {selectedLog.userId || 'N/A'}</div>
                    <div><strong>Admin Email:</strong> {selectedLog.adminEmail || 'N/A'}</div>
                    <div><strong>IP Address:</strong> {selectedLog.ipAddress || 'N/A'}</div>
                    <div><strong>Session ID:</strong> {selectedLog.sessionId || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {selectedLog.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedLog.description}
                  </p>
                </div>
              )}

              {selectedLog.oldValues && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Previous Values</h4>
                  <pre className="text-xs bg-red-50 p-3 rounded-lg overflow-x-auto text-red-800">
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValues && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">New Values</h4>
                  <pre className="text-xs bg-green-50 p-3 rounded-lg overflow-x-auto text-green-800">
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Metadata</h4>
                  <pre className="text-xs bg-blue-50 p-3 rounded-lg overflow-x-auto text-blue-800">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">User Agent</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}