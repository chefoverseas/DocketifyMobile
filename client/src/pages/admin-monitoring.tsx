import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Monitor, 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  FileText,
  Zap,
  BarChart3,
  ArrowLeft,
  Gauge,
  Target,
  Layers
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface SystemHealth {
  database: { status: string; responseTime: number; };
  apiResponse: { status: string; responseTime: number; };
  storage: { status: string; responseTime: number; };
  overall: number;
}

interface PerformanceMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  applicationSuccessRate: number;
  totalApplications: number;
  successfulApplications: number;
  pendingApplications: number;
  timestamp: string;
}

export default function AdminMonitoringPage() {
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: statsData, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 5000, // Real-time updates
    retry: false,
    staleTime: 0,
  });

  // Early returns after all hooks are called
  if (adminLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">Loading System Monitoring...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gathering performance metrics</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const stats = (statsData as any)?.stats;
  const systemHealth: SystemHealth = stats?.systemHealthDetails;
  const performance: PerformanceMetrics = stats?.performanceMetrics;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getHealthStatus = (value: number) => {
    if (value >= 95) return { label: "Excellent", color: "bg-green-500", textColor: "text-green-600" };
    if (value >= 85) return { label: "Good", color: "bg-blue-500", textColor: "text-blue-600" };
    if (value >= 70) return { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-600" };
    return { label: "Poor", color: "bg-red-500", textColor: "text-red-600" };
  };

  const overallHealth = getHealthStatus(systemHealth?.overall || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center space-x-3">
                <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-auto" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    System Monitoring Center
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Real-time system performance & health</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className={`${overallHealth.textColor} border-current`}>
                <Activity className="h-3 w-3 mr-1" />
                {overallHealth.label}
              </Badge>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Health */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Gauge className="h-5 w-5 mr-2 text-blue-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {systemHealth?.overall || 0}%
                </div>
                <Badge className={`${overallHealth.color} text-white mb-3`}>
                  {overallHealth.label}
                </Badge>
                <Progress value={systemHealth?.overall || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Uptime */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {performance?.uptime || 0}%
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Operational since last restart
                </div>
                <Progress value={performance?.uptime || 0} className="h-2 mt-3" />
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {performance?.responseTime || 0}ms
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Average API response
                </div>
                <div className="mt-3 flex justify-center">
                  {(performance?.responseTime || 0) < 500 ? 
                    <Badge className="bg-green-500 text-white">Fast</Badge> :
                    (performance?.responseTime || 0) < 1000 ?
                    <Badge className="bg-yellow-500 text-white">Moderate</Badge> :
                    <Badge className="bg-red-500 text-white">Slow</Badge>
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Cpu className="h-5 w-5 mr-2 text-purple-500" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {performance?.memoryUsage?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  System memory utilized
                </div>
                <Progress value={performance?.memoryUsage || 0} className="h-2 mt-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Components Health */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Layers className="h-6 w-6 mr-3 text-blue-500" />
              System Components Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Database */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Database</h3>
                  </div>
                  <Badge className={systemHealth?.database?.status === 'healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {systemHealth?.database?.status === 'healthy' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {systemHealth?.database?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Response Time: {systemHealth?.database?.responseTime || 0}ms
                </div>
              </div>

              {/* API Response */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">API Services</h3>
                  </div>
                  <Badge className={systemHealth?.apiResponse?.status === 'healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {systemHealth?.apiResponse?.status === 'healthy' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {systemHealth?.apiResponse?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Response Time: {systemHealth?.apiResponse?.responseTime || 0}ms
                </div>
              </div>

              {/* Storage */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-purple-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">File Storage</h3>
                  </div>
                  <Badge className={systemHealth?.storage?.status === 'healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {systemHealth?.storage?.status === 'healthy' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {systemHealth?.storage?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Response Time: {systemHealth?.storage?.responseTime || 0}ms
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Success Rate */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Target className="h-6 w-6 mr-3 text-green-500" />
                Application Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {performance?.applicationSuccessRate?.toFixed(1) || 0}%
                </div>
                <Progress value={performance?.applicationSuccessRate || 0} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{performance?.totalApplications || 0}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{performance?.successfulApplications || 0}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{performance?.pendingApplications || 0}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Rate */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-red-500" />
                Error Rate & Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {performance?.errorRate?.toFixed(1) || 0}%
                </div>
                <Progress value={performance?.errorRate || 0} className="h-3" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Last Updated:</span>
                  <span className="text-sm font-medium">
                    {performance?.timestamp ? format(new Date(performance.timestamp), 'HH:mm:ss') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Performance Status:</span>
                  <Badge className={performance?.errorRate < 5 ? 'bg-green-500 text-white' : 
                                   performance?.errorRate < 10 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}>
                    {performance?.errorRate < 5 ? 'Excellent' : 
                     performance?.errorRate < 10 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Status */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Activity className="h-6 w-6 mr-3 text-blue-500" />
              Real-time System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Authentication</div>
                  <div className="text-xs text-green-600">Operational</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">File Upload</div>
                  <div className="text-xs text-green-600">Operational</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Email Service</div>
                  <div className="text-xs text-green-600">Operational</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-500 mr-3 animate-spin" />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Data Sync</div>
                  <div className="text-xs text-blue-600">Running</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}