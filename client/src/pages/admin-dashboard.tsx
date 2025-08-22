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
  Workflow
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
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: false,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: false, // Disable auto-refetch to prevent excessive polling
    retry: false,
  });

  // Get work permits data for detailed status
  const { data: workPermitsData } = useQuery({
    queryKey: ["/api/admin/workpermits"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
    retry: false,
  });

  // Get contracts data for detailed status
  const { data: contractsData } = useQuery({
    queryKey: ["/api/admin/contracts"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
    retry: false,
  });

  // Get work visas data for detailed status
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

  // CRITICAL: All hooks must be called before any early returns
  // Redirect effect to avoid state update during render
  useEffect(() => {
    if (!adminLoading && !(adminData as any)?.admin) {
      setLocation("/admin/login");
    }
  }, [adminLoading, adminData, setLocation]);

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    return null;
  }

  const stats = (statsData as any)?.stats || {
    totalUsers: 0,
    completedDockets: 0,
    pendingDockets: 0,
    contractsPending: 0,
    issues: 0,
  };

  const users: User[] = (usersData as any)?.users || [];

  // Calculate detailed work permit status
  const workPermits = (workPermitsData as any)?.workPermits || [];
  const workPermitStats = workPermits.reduce((acc: any, wp: any) => {
    const status = wp.workPermit?.status || 'not_started';
    acc[status] = (acc[status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {
    preparation: 0,
    applied: 0,
    awaiting_decision: 0,
    approved: 0,
    rejected: 0,
    not_started: 0,
    total: 0
  });

  // Calculate detailed contract status
  const contracts = (contractsData as any)?.contracts || [];
  const contractStats = contracts.reduce((acc: any, contract: any) => {
    if (contract.companyContractUrl && contract.jobOfferUrl) {
      acc.complete = (acc.complete || 0) + 1;
    } else if (contract.companyContractUrl || contract.jobOfferUrl) {
      acc.partial = (acc.partial || 0) + 1;
    } else {
      acc.empty = (acc.empty || 0) + 1;
    }
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, { complete: 0, partial: 0, empty: 0, total: 0 });

  // Calculate detailed work visa status
  const workVisas = (workVisasData as any)?.workVisas || [];
  const workVisaStats = workVisas.reduce((acc: any, wv: any) => {
    const status = wv.workVisa?.status || 'not_started';
    acc[status] = (acc[status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {
    preparation: 0,
    applied: 0,
    awaiting_decision: 0,
    approved: 0,
    rejected: 0,
    not_started: 0,
    total: 0
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Refreshed Successfully",
        description: "Dashboard data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/admin/export-csv", {
        credentials: "include",
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users.csv";
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "User data exported successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/50">
      {/* Futuristic Glassmorphism Header */}
      <div className="relative bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-2xl sticky top-0 z-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-orange-600/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              {/* Enhanced Logo */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative bg-white rounded-2xl p-3 shadow-xl border border-white/50">
                  <img 
                    src={chefOverseasLogo} 
                    alt="Chef Overseas Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
              
              {/* Interactive Admin Badge */}
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-all duration-300">
                  <Shield className="h-8 w-8 text-white drop-shadow-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg animate-bounce"></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Docketify Pro
                  </h1>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-xs font-bold animate-pulse">
                    <Sparkles className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span>Administrator Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="relative group bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/30 hover:border-blue-300 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 text-blue-600 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="font-medium">Refresh</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExportCSV} 
                className="relative group bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/30 hover:border-green-300 transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2 text-green-600 group-hover:translate-y-0.5 transition-transform duration-300" />
                <span className="font-medium">Export</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="relative group bg-white/60 hover:bg-red-50/80 backdrop-blur-sm border border-white/30 hover:border-red-300 text-red-600 transition-all duration-300"
              >
                <Settings className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Modernized Admin Console Header */}
        <Card className="mb-10 border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50 overflow-hidden relative">
          {/* Background Patterns */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-l from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
          </div>
          
          <CardContent className="relative p-0">
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-8 lg:px-12 py-10">
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-10">
                {/* Enhanced Avatar Section */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-3xl blur opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                  <div className="relative w-28 h-28 bg-white/10 backdrop-blur-lg rounded-3xl border-2 border-white/30 shadow-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-500">
                    <Shield className="h-14 w-14 text-white drop-shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 border-4 border-white rounded-full flex items-center justify-center shadow-xl">
                      <Cpu className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-center lg:text-left text-white space-y-6">
                  <div>
                    <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                      <h2 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                        Administrator Console
                      </h2>
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 text-sm font-bold animate-pulse">
                        <Star className="h-4 w-4 mr-1" />
                        Pro
                      </Badge>
                    </div>
                    <p className="text-cyan-100 text-xl mb-6 max-w-2xl">
                      Advanced management platform with real-time analytics and intelligent automation
                    </p>
                  </div>
                  
                  {/* Enhanced Quick Navigation */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button asChild variant="secondary" size="sm" className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/40 transition-all duration-300">
                      <Link href="/admin/workpermits">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <FileText className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10">Work Permits</span>
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/40 transition-all duration-300">
                      <Link href="/admin/workvisas">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Plane className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10">Work Visas</span>
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/40 transition-all duration-300">
                      <Link href="/admin/contracts">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Briefcase className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10">Contracts</span>
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/40 transition-all duration-300 bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                      <Link href="/admin/sync">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded opacity-100 transition-opacity duration-300"></div>
                        <Database className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10 font-bold">Data Sync</span>
                        <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 relative z-10">NEW</Badge>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Interactive Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Data Sync Card - Highlighted NEW Feature */}
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 ring-2 ring-green-200"
            onClick={() => setLocation("/admin/sync")}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-5 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors shadow-lg">
                  <RefreshCw className="h-10 w-10 text-white" />
                </div>
                <div className="flex flex-col items-end">
                  <Badge className="bg-green-500 text-white text-xs mb-2">NEW</Badge>
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors leading-tight">
                Data Sync
              </h3>
              <p className="text-gray-600 mb-4 text-base leading-relaxed">Monitor data consistency and automated synchronization</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">Auto-Sync Active</span>
                <span className="text-gray-500">Every 5 min</span>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100"
            onClick={() => setLocation("/admin/workpermits")}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-5 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors shadow-lg">
                  <Briefcase className="h-10 w-10 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                Work Permits
              </h3>
              <p className="text-gray-600 mb-4 text-base leading-relaxed">Manage work permit applications and approvals</p>
              
              {/* Detailed Work Permit Status */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved:</span>
                  <span className="font-semibold text-green-600">{workPermitStats.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Under Review:</span>
                  <span className="font-semibold text-yellow-600">{workPermitStats.awaiting_decision}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Preparation:</span>
                  <span className="font-semibold text-blue-600">{workPermitStats.preparation}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-700 px-3 py-2 text-sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Total: {workPermitStats.total}
                </Badge>
                <span className="text-3xl font-bold text-blue-600">{workPermitStats.approved}</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100"
            onClick={() => setLocation("/admin/workvisas")}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-5 bg-orange-500 rounded-xl group-hover:bg-orange-600 transition-colors shadow-lg">
                  <Plane className="h-10 w-10 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                Work Visas
              </h3>
              <p className="text-gray-600 mb-4 text-base leading-relaxed">Manage work visa applications and approvals</p>
              
              {/* Detailed Work Visa Status */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved:</span>
                  <span className="font-semibold text-green-600">{workVisaStats.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Under Review:</span>
                  <span className="font-semibold text-yellow-600">{workVisaStats.awaiting_decision}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Preparation:</span>
                  <span className="font-semibold text-blue-600">{workVisaStats.preparation}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className="bg-orange-100 text-orange-700 px-3 py-2 text-sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Total: {workVisaStats.total}
                </Badge>
                <span className="text-3xl font-bold text-orange-600">{workVisaStats.approved}</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100"
            onClick={() => setLocation("/admin/contracts")}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-5 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors shadow-lg">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors leading-tight">
                Contract Management
              </h3>
              <p className="text-gray-600 mb-4 text-base leading-relaxed">Upload and manage company contracts and job offers</p>
              
              {/* Detailed Contract Status */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Complete:</span>
                  <span className="font-semibold text-green-600">{contractStats.complete}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Partial:</span>
                  <span className="font-semibold text-yellow-600">{contractStats.partial}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Empty:</span>
                  <span className="font-semibold text-red-600">{contractStats.empty}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-700 px-3 py-2 text-sm">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Total: {contractStats.total}
                </Badge>
                <span className="text-3xl font-bold text-green-600">{contractStats.complete}</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100"
            onClick={() => setLocation("/admin/users")}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-5 bg-purple-500 rounded-xl group-hover:bg-purple-600 transition-colors shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors leading-tight">
                User Management
              </h3>
              <p className="text-gray-600 mb-4 text-base leading-relaxed">View, edit, and manage all user accounts</p>
              
              {/* User Activity Summary */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users:</span>
                  <span className="font-semibold text-green-600">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Complete Profiles:</span>
                  <span className="font-semibold text-blue-600">{stats.completedDockets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Setup:</span>
                  <span className="font-semibold text-yellow-600">{Math.max(0, stats.totalUsers - stats.completedDockets)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-700 px-3 py-2 text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Manage All
                </Badge>
                <span className="text-3xl font-bold text-purple-600">{stats.totalUsers}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern User Management Section */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 border-b">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-600" />
                  User Management
                </CardTitle>
                <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
              </div>
              
              {/* Search & Actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation("/admin/users")}
                    className="hover:bg-blue-50 border-blue-200"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    All Users
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setLocation("/admin/user/new")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first user to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User Profile
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Quick Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredUsers.slice(0, 5).map((user, index) => (
                        <tr key={user.id} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                {user.photoUrl ? (
                                  <img
                                    src={user.photoUrl}
                                    alt={user.displayName || 'User'}
                                    className="h-12 w-12 rounded-full object-cover shadow-lg border-2 border-white"
                                    onError={(e) => {
                                      console.log("Image failed to load:", user.photoUrl);
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                    <span className="text-lg font-bold text-white">
                                      {user.givenName ? user.givenName[0] : user.displayName?.[0] || "U"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {user.givenName && user.surname 
                                    ? `${user.givenName} ${user.surname}`
                                    : user.displayName || "Unnamed User"
                                  }
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.photoUrl ? 'Photo available' : 'Joined recently'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">{user.email || "No email"}</div>
                              <div className="text-gray-500">{user.phone || "No phone"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                              {user.uid || "Not assigned"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              className={
                                user.docketCompleted 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }
                            >
                              <div className="flex items-center">
                                {user.docketCompleted ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {user.docketCompleted ? "Complete" : "Pending"}
                              </div>
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(`/admin/user/${user.uid || user.id}`)}
                                className="hover:bg-blue-100 text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(`/admin/user/${user.uid || user.id}/edit`)}
                                className="hover:bg-green-100 text-green-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Show more link */}
                {filteredUsers.length > 5 && (
                  <div className="bg-gray-50 px-6 py-4 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full text-blue-600 hover:bg-blue-50"
                      onClick={() => setLocation("/admin/users")}
                    >
                      View all {filteredUsers.length} users
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}