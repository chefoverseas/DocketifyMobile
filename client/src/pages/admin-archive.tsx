import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Archive, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Download,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Database,
  TrendingDown,
  TrendingUp,
  Clock
} from "lucide-react";
import { Link, useLocation } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface ArchivedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  archived: boolean;
  archivedAt: string | null;
  archivedReason: string | null;
  createdAt: string;
}

interface ArchiveStats {
  totalUsers: number;
  archivedUsers: number;
  eligibleForArchive: number;
  recentlyArchived: number;
}

export default function AdminArchive() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [archiveReason, setArchiveReason] = useState("");

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  // Get archive statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/archive/stats"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
  });

  // Get all users (archived and active)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/archive/users"],
    enabled: !!(adminData as any)?.admin,
  });

  useEffect(() => {
    if (!adminLoading && !(adminData as any)?.admin) {
      setLocation("/admin/login");
    }
  }, [adminLoading, adminData, setLocation]);

  // Manual archive user mutation
  const archiveUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const res = await apiRequest("POST", `/api/admin/archive/user/${userId}`, { reason });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User archived successfully",
        description: "The user has been archived and moved to the archive list.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archive/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archive/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Archive failed",
        description: error.message || "Failed to archive user",
        variant: "destructive",
      });
    },
  });

  // Restore user mutation
  const restoreUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/archive/restore/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User restored successfully",
        description: "The user has been restored and is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archive/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archive/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Restore failed",
        description: error.message || "Failed to restore user",
        variant: "destructive",
      });
    },
  });

  // Auto archive eligible users mutation
  const autoArchiveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/archive/auto");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Auto archive completed",
        description: `Successfully archived ${data.archivedCount} users older than 1 year.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archive/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archive/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Auto archive failed",
        description: error.message || "Failed to run auto archive",
        variant: "destructive",
      });
    },
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = statsData?.stats as ArchiveStats;
  const users = usersData?.users as ArchivedUser[] || [];

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "archived" && user.archived) ||
      (filterStatus === "active" && !user.archived);
    
    return matchesSearch && matchesFilter;
  });

  const handleArchiveUser = (userId: string) => {
    if (!archiveReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for archiving this user.",
        variant: "destructive",
      });
      return;
    }
    archiveUserMutation.mutate({ userId, reason: archiveReason });
    setArchiveReason("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-orange-900/20 dark:to-amber-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-400/15 to-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-orange-200/50 dark:border-orange-800/50 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button asChild variant="ghost" size="sm" className="hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-300 hover:scale-105">
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src={chefOverseasLogo} alt="Chef Overseas" className="h-12 w-12 rounded-xl shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Archive Management
                  </h1>
                  <p className="text-sm text-orange-600/80 dark:text-orange-400/80">Advanced user lifecycle management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Archive className="h-3 w-3 mr-1" />
                Archive Center
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                <Clock className="h-4 w-4" />
                <span>Auto-sync active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Total Users</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active system users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Archive className="h-8 w-8 text-white" />
                </div>
                <Database className="h-5 w-5 text-amber-500 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">Archived Users</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors duration-300">
                  {stats?.archivedUsers || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stored securely</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <Clock className="h-5 w-5 text-orange-500 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">Eligible for Archive</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors duration-300">
                  {stats?.eligibleForArchive || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Older than 1 year</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <CheckCircle className="h-5 w-5 text-green-500 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">Recently Archived</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors duration-300">
                  {stats?.recentlyArchived || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last 30 days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl mb-12 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10 pb-6">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Archive Operations</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">Automated and manual user lifecycle management</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 block">
                      Archive Reason (Required for manual archiving)
                    </label>
                    <Input
                      placeholder="Enter detailed reason for archiving this user..."
                      value={archiveReason}
                      onChange={(e) => setArchiveReason(e.target.value)}
                      className="bg-white/80 dark:bg-slate-700/80 border-amber-200 dark:border-amber-700 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  <Button
                    onClick={() => autoArchiveMutation.mutate()}
                    disabled={autoArchiveMutation.isPending}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3"
                  >
                    {autoArchiveMutation.isPending ? (
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Archive className="h-5 w-5 mr-2" />
                    )}
                    Auto Archive Eligible
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20 transition-all duration-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Archive Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10 pb-6">
            <CardTitle className="flex items-center space-x-3 text-xl mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">User Management</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">Search, filter, and manage user lifecycle</p>
              </div>
            </CardTitle>
            
            {/* Search and Filter */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <Input
                    placeholder="Search users by email, name, or any detail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/80 dark:bg-slate-700/80 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 text-base"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-56 bg-white/80 dark:bg-slate-700/80 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300">
                    <Filter className="h-4 w-4 mr-2 text-blue-500" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="archived">Archived Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="group/item flex items-center justify-between p-6 bg-gradient-to-r from-white to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        {!user.archived && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-lg group-hover/item:text-blue-600 transition-colors duration-300">
                            {user.firstName} {user.lastName}
                          </p>
                          <Badge
                            className={
                              user.archived
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                            }
                          >
                            {user.archived ? "Archived" : "Active"}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-base mb-1">{user.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </span>
                          {user.archived && user.archivedAt && (
                            <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                              <Archive className="h-3 w-3" />
                              <span>
                                Archived: {new Date(user.archivedAt).toLocaleDateString()}
                                {user.archivedReason && ` - ${user.archivedReason}`}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {user.archived ? (
                      <Button
                        size="default"
                        onClick={() => restoreUserMutation.mutate(user.id)}
                        disabled={restoreUserMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {restoreUserMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4 mr-2" />
                        )}
                        Restore User
                      </Button>
                    ) : (
                      <Button
                        size="default"
                        onClick={() => handleArchiveUser(user.id)}
                        disabled={archiveUserMutation.isPending || !archiveReason.trim()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {archiveUserMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Archive className="h-4 w-4 mr-2" />
                        )}
                        Archive User
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                  <div className="relative inline-block">
                    <Users className="h-24 w-24 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No users found</h3>
                  <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}