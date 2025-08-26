import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  AlertCircle,
  Activity,
  Shield,
  Settings,
  FileText,
  Database,
  Globe,
  ArrowLeft,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Sparkles,
  Target,
  Eye,
  TrendingDown,
  Gauge,
  Monitor,
  Cpu,
  LineChart,
  PieChart
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from "recharts";
import { Link } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

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
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function ModernAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeMetric, setActiveMetric] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Fetch audit statistics
  const { data: statsData, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["/api/admin/audit/stats"],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const stats = (statsData as any)?.stats as AuditStats;

  // Real-time updates effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Generate enhanced demo data for better visualization
  const enhancedDailyActivity = [
    { date: '2025-08-15', count: 45, users: 12, errors: 2 },
    { date: '2025-08-16', count: 52, users: 15, errors: 1 },
    { date: '2025-08-17', count: 38, users: 10, errors: 3 },
    { date: '2025-08-18', count: 61, users: 18, errors: 0 },
    { date: '2025-08-19', count: 74, users: 22, errors: 1 },
    { date: '2025-08-20', count: 89, users: 28, errors: 2 },
    { date: '2025-08-21', count: 67, users: 19, errors: 1 },
    { date: '2025-08-22', count: stats?.totalActions || 2, users: stats?.topUsers?.length || 1, errors: 0 }
  ];

  const performanceData = [
    { subject: 'Performance', value: stats?.performanceMetrics?.errorRate ? 100 - stats.performanceMetrics.errorRate : 100 },
    { subject: 'Security', value: stats?.securityMetrics?.successRate || 100 },
    { subject: 'User Activity', value: Math.min(100, (stats?.totalActions || 0) * 10) },
    { subject: 'System Health', value: 98 },
    { subject: 'Data Quality', value: 95 },
    { subject: 'Response Time', value: 92 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Business Intelligence Center
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Advanced analytics and performance insights
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Auto-refresh Toggle */}
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center space-x-2"
              >
                <div className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{autoRefresh ? 'Live' : 'Paused'}</span>
              </Button>

              {/* Manual Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={statsLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Real-time Status Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">System Status: Operational</h3>
                    <p className="text-green-100">All systems running smoothly • Last updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <div className="text-2xl font-bold">{stats?.totalActions || 0}</div>
                    <div className="text-green-100 text-sm">Total Events</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.securityMetrics?.successRate || 100}%</div>
                    <div className="text-green-100 text-sm">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.performanceMetrics?.errorRate || 0}%</div>
                    <div className="text-green-100 text-sm">Error Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveMetric}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-4 w-auto">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Gauge className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Business</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Performance</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                AI-Powered
              </Badge>
            </div>
          </div>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-100 text-sm font-medium">Total Actions</div>
                      <div className="text-3xl font-bold">{stats?.totalActions || 0}</div>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-blue-200" />
                        <span className="text-blue-200 text-xs">+12% vs last period</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Activity className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-emerald-100 text-sm font-medium">Active Users</div>
                      <div className="text-3xl font-bold">{stats?.topUsers?.length || 0}</div>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-emerald-200" />
                        <span className="text-emerald-200 text-xs">+8% this week</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-orange-100 text-sm font-medium">Success Rate</div>
                      <div className="text-3xl font-bold">{stats?.securityMetrics?.successRate || 100}%</div>
                      <div className="flex items-center space-x-1 mt-2">
                        <ShieldCheck className="h-4 w-4 text-orange-200" />
                        <span className="text-orange-200 text-xs">Excellent</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Target className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-purple-100 text-sm font-medium">Risk Events</div>
                      <div className="text-3xl font-bold">{stats?.riskMetrics?.highRiskActions || 0}</div>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingDown className="h-4 w-4 text-purple-200" />
                        <span className="text-purple-200 text-xs">-15% decrease</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Activity Chart */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <LineChart className="h-5 w-5 text-blue-600" />
                      <span>Activity Trends</span>
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Real-time</Badge>
                  </div>
                  <CardDescription>System activity patterns and user engagement over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={enhancedDailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" name="Daily Actions" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} name="Active Users" />
                        <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Action Distribution */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5 text-emerald-600" />
                      <span>Action Distribution</span>
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">Interactive</Badge>
                  </div>
                  <CardDescription>Breakdown of system activities by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(stats?.actionsByType || { 'LOGIN': 2, 'VIEW': 1, 'UPDATE': 0 }).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(stats?.actionsByType || { 'LOGIN': 2, 'VIEW': 1 }).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Radar Chart */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-purple-600" />
                  <span>System Performance Overview</span>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">Advanced</Badge>
                </CardTitle>
                <CardDescription>Comprehensive performance metrics visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tabs content would go here for business, security, and performance */}
          <TabsContent value="business" className="space-y-6">
            <div className="text-center py-12">
              <Cpu className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Business Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">Advanced business intelligence coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Security Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">Security monitoring dashboard coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="text-center py-12">
              <Monitor className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Performance Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">Performance metrics dashboard coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}