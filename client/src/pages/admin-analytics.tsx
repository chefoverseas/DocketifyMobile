import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  RefreshCw
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

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function AdminAnalyticsPage() {
  // Fetch audit statistics
  const { data: statsData, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["/api/admin/audit/stats"],
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const stats = statsData?.stats as AuditStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Business Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive insights into system performance and user behavior
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business Metrics</TabsTrigger>
            <TabsTrigger value="security">Security Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Actions</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats?.totalActions || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats?.topUsers?.length || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-green-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.securityMetrics?.successRate || 100}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-red-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Risk Events</div>
                      <div className="text-2xl font-bold text-red-600">
                        {stats?.riskMetrics?.highRiskActions || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Chart */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span>Daily Activity Trend</span>
                </CardTitle>
                <CardDescription>System activity over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.dailyActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#ea580c" 
                        fill="url(#colorGradient)" 
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            {/* Business Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">User Engagement</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats?.businessMetrics?.userEngagement || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Admin Activity</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats?.businessMetrics?.adminActivity || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Database className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Data Changes</div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.businessMetrics?.dataModifications || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">File Operations</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {stats?.businessMetrics?.fileOperations || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Types Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle>Action Types Distribution</CardTitle>
                  <CardDescription>Breakdown of all system actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(stats?.actionsByType || {}).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(stats?.actionsByType || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle>Entity Types Activity</CardTitle>
                  <CardDescription>Activity breakdown by entity type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(stats?.actionsByEntity || {}).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="#ea580c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-red-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Login Attempts</div>
                      <div className="text-2xl font-bold text-red-600">
                        {stats?.securityMetrics?.loginAttempts || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-yellow-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Failed Logins</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats?.securityMetrics?.failedLogins || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.securityMetrics?.successRate || 100}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Unique IPs</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats?.securityMetrics?.uniqueIPs || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Assessment */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Risk Assessment Dashboard</span>
                </CardTitle>
                <CardDescription>Monitor security threats and risk indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>High Risk Actions</span>
                      <span className="text-red-600">{stats?.riskMetrics?.highRiskActions || 0}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (stats?.riskMetrics?.highRiskActions || 0) * 10)} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Suspicious Activity</span>
                      <span className="text-yellow-600">{stats?.riskMetrics?.suspiciousActivity || 0}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (stats?.riskMetrics?.suspiciousActivity || 0) * 5)} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Error Events</span>
                      <span className="text-orange-600">{stats?.riskMetrics?.errorEvents || 0}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (stats?.riskMetrics?.errorEvents || 0) * 20)} 
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Zap className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Error Rate</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {stats?.performanceMetrics?.errorRate || 0}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Peak Hour</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats?.performanceMetrics?.peakHours?.[0]?.hour !== undefined 
                          ? `${stats.performanceMetrics.peakHours[0].hour}:00` 
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Activity Points</div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.performanceMetrics?.activityTrend?.length || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Hours Chart */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Peak Activity Hours</span>
                </CardTitle>
                <CardDescription>System usage patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.performanceMetrics?.peakHours || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => `${value}:00`}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}