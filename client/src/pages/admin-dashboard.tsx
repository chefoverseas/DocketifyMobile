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
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { User } from "@shared/schema";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Modern Admin Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Docketify Pro Admin
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-orange-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleExportCSV} className="hover:bg-blue-100">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-100 text-red-600">
                <Settings className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Profile & Quick Actions Header */}
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-white via-blue-50 to-indigo-50 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-3 border-white rounded-full flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Administrator Console</h2>
                  <p className="text-blue-100 mb-4">Real-time system overview and management tools</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Activity className="h-3 w-3 mr-1" />
                      System Active
                    </Badge>
                    <Badge className="bg-green-500/20 text-white border-green-300/30">
                      <Bell className="h-3 w-3 mr-1" />
                      Real-time Updates
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                    onClick={() => setLocation("/admin/dockets")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Dockets
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                    onClick={() => setLocation("/admin/contracts")}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Contracts
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Row */}
            <div className="bg-white px-8 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <div className="text-xs text-gray-500">Total Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.completedDockets}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingDockets}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.contractsPending}</div>
                  <div className="text-xs text-gray-500">Contracts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Interactive Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100"
            onClick={() => setLocation("/admin/workpermits")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Work Permits
              </h3>
              <p className="text-gray-600 mb-4">Manage work permit applications and approvals</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-700">
                  <Activity className="h-3 w-3 mr-1" />
                  Active Management
                </Badge>
                <span className="text-2xl font-bold text-blue-600">{stats.contractsPending}</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100"
            onClick={() => setLocation("/admin/contracts")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Contract Management
              </h3>
              <p className="text-gray-600 mb-4">Upload and manage company contracts and job offers</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-700">
                  <FileCheck className="h-3 w-3 mr-1" />
                  Document Control
                </Badge>
                <span className="text-2xl font-bold text-green-600">{stats.completedDockets}</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100"
            onClick={() => setLocation("/admin/users")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-purple-500 rounded-xl group-hover:bg-purple-600 transition-colors shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                User Management
              </h3>
              <p className="text-gray-600 mb-4">View, edit, and manage all user accounts</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-700">
                  <Users className="h-3 w-3 mr-1" />
                  User Control
                </Badge>
                <span className="text-2xl font-bold text-purple-600">{stats.totalUsers}</span>
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
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                  <span className="text-lg font-bold text-white">
                                    {user.givenName ? user.givenName[0] : user.displayName?.[0] || "U"}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {user.givenName && user.surname 
                                    ? `${user.givenName} ${user.surname}`
                                    : user.displayName || "Unnamed User"
                                  }
                                </div>
                                <div className="text-sm text-gray-500">
                                  Joined recently
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