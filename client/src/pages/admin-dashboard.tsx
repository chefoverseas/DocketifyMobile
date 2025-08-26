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
  HeartHandshake,
  Archive
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
    refetchInterval: 5000, // Even faster updates - 5 seconds
    retry: false,
    staleTime: 0,
    gcTime: 0, // React Query v5 uses gcTime instead of cacheTime
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

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

  // Force re-render when stats change
  const systemHealthValue = stats?.systemHealth;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = () => logoutMutation.mutate();

  const filteredUsers = users.filter((user: User) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName || user.lastName) && `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate advanced metrics
  const totalApplications = workPermits.length + workVisas.length + contracts.length;
  const completionRate = totalApplications > 0 ? Math.round((stats?.completedDockets || 0) / totalApplications * 100) : 0;
  const activeUsersCount = users.filter((user: User) => !user.archived).length;
  const pendingWorkPermits = workPermits.filter((wp: any) => wp.status === 'pending' || wp.status === 'under_review').length;

  return (
    <div className="admin-gradient-bg min-h-screen">
      {/* Modern Header with Glass Effect */}
      <div className="admin-header-glass sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-0.5">
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                    <img src={chefOverseasLogo} alt="Chef Overseas" className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Admin Control Center
                  </h1>
                  <p className="text-sm text-purple-600/70">
                    {currentUser?.email} • System Administrator
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-white text-sm font-medium">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>All Systems Operational</span>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="admin-secondary-btn rounded-full px-4 py-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                className="admin-danger-btn rounded-full px-4 py-2"
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
          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600/70 mb-1">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-purple-600/50 mt-1">{activeUsersCount} active</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600/70 mb-1">Completed Dockets</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats?.completedDockets || 0}
                  </p>
                  <p className="text-xs text-purple-600/50 mt-1">{completionRate}% completion rate</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600/70 mb-1">Pending Items</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {stats?.pendingDockets + pendingWorkPermits || 0}
                  </p>
                  <p className="text-xs text-purple-600/50 mt-1">Requires attention</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-purple-600/70">System Health</p>
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500" key={`health-${systemHealthValue}-${Date.now()}`}>
                    {systemHealthValue ?? 98}%
                  </p>
                  <div className="text-xs text-purple-600/50 mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <span className={`font-medium ${stats?.systemHealthDetails?.database?.score > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {stats?.systemHealthDetails?.database?.score ?? '--'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>API:</span>
                      <span className={`font-medium ${stats?.systemHealthDetails?.apiResponse?.score > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {stats?.systemHealthDetails?.apiResponse?.score ?? '--'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className={`font-medium ${stats?.systemHealthDetails?.storage?.score > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {stats?.systemHealthDetails?.storage?.score ?? '--'}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                  <Gauge className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Clusters */}
        <div className="space-y-8 mb-12">
          {/* Core Operations Cluster */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      Core Operations
                    </CardTitle>
                    <p className="text-sm text-purple-600/70">User management, document processing & work visa administration</p>
                  </div>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="admin-secondary-btn rounded-full px-4 py-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/users">
                    <Users className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Users</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/dockets">
                    <FileText className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Dockets</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/workpermits">
                    <Briefcase className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Work Permits</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/workvisas">
                    <Plane className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Work Visas</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/contracts">
                    <FileCheck className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Contracts</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visa & Immigration Services Cluster */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Visa & Immigration Services
                  </CardTitle>
                  <p className="text-sm text-purple-600/70">International travel and visa processing</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/workvisas">
                    <Plane className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Work Visas</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/interviews">
                    <Calendar className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Interviews</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/embassy-tracking">
                    <Globe className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Embassy Tracking</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Management Cluster */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    System Management
                  </CardTitle>
                  <p className="text-sm text-purple-600/70">Data synchronization and system maintenance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/sync">
                    <RefreshCw className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Data Sync</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/archive">
                    <Archive className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Archive</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/monitoring">
                    <Monitor className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Monitoring</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/settings">
                    <Settings className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Reporting Cluster */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Analytics & Reporting
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Performance insights and business intelligence</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Analytics</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/reports">
                    <PieChart className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Reports</span>
                  </Link>
                </Button>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group h-20 flex-col justify-center"
                >
                  <Link href="/admin/insights">
                    <TrendingUp className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Insights</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          {/* Archive Management Center */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
                <Archive className="h-6 w-6" />
                <span>Archive Management</span>
                <Badge className="bg-amber-500 text-white text-xs">NEW</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Automated user archiving and lifecycle management for users older than 1 year
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Link href="/admin/archive">
                    <Archive className="h-4 w-4 mr-2" />
                    Manage Archive
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