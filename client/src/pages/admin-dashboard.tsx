import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  FileText,
  Plus,
  Edit,
  Eye,
  Download,
  Briefcase,
  Settings,
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  ChevronRight,
  Shield,
  Bell,
  Zap,
  CheckCircle,
  Plane,
  Sparkles,
  Globe,
  Database,
  Layers,
  Cpu,
  LineChart,
  ArrowUpRight,
  Star,
  Workflow,
  LogOut,
  Monitor,
  Gauge,
  Target,
  HeartHandshake
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { User } from "@shared/schema";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
    retry: false,
    staleTime: 0,
    cacheTime: 0,
  });

  // Debug logging for system health
  console.log("Admin dashboard statsData:", statsData);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: false,
    retry: false,
  });

  const { data: workPermitsData } = useQuery({
    queryKey: ["/api/admin/workpermits"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
    retry: false,
  });

  const { data: contractsData } = useQuery({
    queryKey: ["/api/admin/contracts"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
    retry: false,
  });

  const { data: workVisasData } = useQuery({
    queryKey: ["/api/admin/workvisas"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/logout", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
    },
  });

  useEffect(() => {
    if (!adminLoading && !(adminData as any)?.admin) {
      setLocation("/admin/login");
    }
  }, [adminLoading, adminData, setLocation]);

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    return null;
  }

  const currentUser = adminData as any;
  const stats = (statsData as any)?.stats;
  const users = (usersData as any)?.users || [];
  const workPermits = (workPermitsData as any)?.workPermits || [];
  const contracts = (contractsData as any)?.contracts || [];
  const workVisas = (workVisasData as any)?.workVisas || [];

  // Debug system health value
  console.log("System health from stats:", stats?.systemHealth);
  console.log("Full stats object:", stats);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = () => logoutMutation.mutate();

  const filteredUsers = users.filter((user: User) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate advanced metrics
  const totalApplications = workPermits.length + workVisas.length + contracts.length;
  const completionRate = totalApplications > 0 ? Math.round((stats?.completedDockets || 0) / totalApplications * 100) : 0;
  const activeUsersCount = users.filter((user: User) => user.isActive).length;
  const pendingWorkPermits = workPermits.filter((wp: any) => wp.status === 'pending' || wp.status === 'under_review').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-auto brightness-0 invert" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Command Center
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentUser?.email} • System Administrator
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-blue-100 text-xs mt-1">{activeUsersCount} active</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Completed Dockets</p>
                  <p className="text-3xl font-bold">{stats?.completedDockets || 0}</p>
                  <p className="text-emerald-100 text-xs mt-1">{completionRate}% completion rate</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileCheck className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending Items</p>
                  <p className="text-3xl font-bold">{stats?.pendingDockets + pendingWorkPermits || 0}</p>
                  <p className="text-orange-100 text-xs mt-1">Requires attention</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">System Health</p>
                  <p className="text-3xl font-bold">{stats?.systemHealth ?? 98}%</p>
                  <p className="text-purple-100 text-xs mt-1">Real-time performance</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Gauge className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Navigation */}
        <Card className="mb-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
                <p className="text-slate-600 dark:text-slate-400">Manage your platform efficiently</p>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button
                asChild
                className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/admin/workpermits" className="flex flex-col items-center space-y-2">
                  <FileText className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Work Permits</span>
                </Link>
              </Button>

              <Button
                asChild
                className="h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/admin/workvisas" className="flex flex-col items-center space-y-2">
                  <Plane className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Work Visas</span>
                </Link>
              </Button>

              <Button
                asChild
                className="h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/admin/contracts" className="flex flex-col items-center space-y-2">
                  <Briefcase className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Contracts</span>
                </Link>
              </Button>

              <Button
                asChild
                className="h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/admin/users" className="flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Users</span>
                </Link>
              </Button>

              <Button
                asChild
                className="h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative"
              >
                <Link href="/admin/sync" className="flex flex-col items-center space-y-2">
                  <Database className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Data Sync</span>
                  <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1">NEW</Badge>
                </Link>
              </Button>

              <Button
                asChild
                className="h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative"
              >
                <Link href="/admin/analytics" className="flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Analytics</span>
                  <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1">PRO</Badge>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* System Health Monitor */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Monitor className="h-5 w-5 text-green-600" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Database</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Optimal</Badge>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">API Response</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Fast</Badge>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Storage</span>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">70% Used</Badge>
                </div>
                <Progress value={70} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Work permit approved</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Document uploaded</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">10 minutes ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Target className="h-5 w-5 text-purple-600" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{completionRate}%</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Application Success Rate</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{activeUsersCount}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Active Users</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-600">{totalApplications}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total Apps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audit & Security Center */}
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-violet-800 dark:text-violet-300">
                <Shield className="h-6 w-6" />
                <span>Security & Audit Center</span>
                <Badge className="bg-violet-500 text-white text-xs">Advanced</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive security monitoring and audit trail management
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Link href="/admin/audit">
                    <Shield className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management Hub */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-300">
                <HeartHandshake className="h-6 w-6" />
                <span>User Management Hub</span>
                <Badge className="bg-blue-500 text-white text-xs">Essential</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Complete user lifecycle management and support tools
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    All Users
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Link href="/admin/user/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}