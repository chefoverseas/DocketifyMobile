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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-8 rounded-lg" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Archive Management</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">User lifecycle management</p>
                </div>
              </div>
            </div>
            <Badge className="bg-amber-500 text-white">
              <Archive className="h-3 w-3 mr-1" />
              Archive Center
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Archive className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Archived Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.archivedUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Eligible for Archive</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.eligibleForArchive || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recently Archived</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.recentlyArchived || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-amber-600" />
              <span>Archive Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => autoArchiveMutation.mutate()}
                disabled={autoArchiveMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {autoArchiveMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4 mr-2" />
                )}
                Auto Archive Eligible Users
              </Button>
              <Input
                placeholder="Enter reason for manual archiving..."
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>User Management</span>
            </CardTitle>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="archived">Archived Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        {user.archived && user.archivedAt && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Archived: {new Date(user.archivedAt).toLocaleDateString()}
                            {user.archivedReason && ` - ${user.archivedReason}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        user.archived
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }
                    >
                      {user.archived ? "Archived" : "Active"}
                    </Badge>
                    {user.archived ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreUserMutation.mutate(user.id)}
                        disabled={restoreUserMutation.isPending}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchiveUser(user.id)}
                        disabled={archiveUserMutation.isPending || !archiveReason.trim()}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No users found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}