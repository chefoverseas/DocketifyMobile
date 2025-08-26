import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CheckCircle, Clock, AlertTriangle, Download, Search, Plus, FileText, Settings, Database, Archive, Calendar, BarChart3, Shield, Sparkles, TrendingUp, Activity, Globe, Star } from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation("/docket");
    }
  }, [user, setLocation]);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const handleExportCSV = () => {
    window.open("/api/admin/export-csv", "_blank");
  };

  if (!user?.isAdmin) {
    return <div>Access denied</div>;
  }

  if (usersLoading || statsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const users = (usersData as any)?.users || [];
  const stats = (statsData as any)?.stats || {
    totalUsers: 0,
    completedDockets: 0,
    pendingDockets: 0,
    issues: 0,
  };

  return (
    <div className="admin-gradient-bg min-h-screen">
      {/* Header */}
      <div className="admin-header-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
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
                <p className="text-sm text-purple-600/70">Elegant management with unified tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Online</span>
              </div>
              <Button 
                onClick={handleExportCSV} 
                className="admin-primary-btn rounded-full px-6 shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600/70 mb-1">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.totalUsers}
                  </p>
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
                  <p className="text-sm font-medium text-blue-600/70 mb-1">Completed</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {stats.completedDockets}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600/70 mb-1">Pending</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    {stats.pendingDockets}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600/70 mb-1">System Health</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.systemHealth || 100}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="admin-glass admin-card-hover border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild className="admin-secondary-btn h-auto p-4 flex-col items-center space-y-2">
                <Link href="/admin/user/new">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Add User</span>
                </Link>
              </Button>

              <Button asChild className="admin-secondary-btn h-auto p-4 flex-col items-center space-y-2">
                <Link href="/admin/reports">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Reports</span>
                </Link>
              </Button>

              <Button asChild className="admin-secondary-btn h-auto p-4 flex-col items-center space-y-2">
                <Link href="/admin/settings">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </Button>

              <Button asChild className="admin-secondary-btn h-auto p-4 flex-col items-center space-y-2">
                <Link href="/admin/audit">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Audit</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Management Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Work Permits */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden group">
            <Link href="/admin/workpermits">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Active</Badge>
                </div>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Work Permits</h3>
                <p className="text-sm text-blue-600/70 mb-4">Manage and track work permit applications</p>
                <div className="flex items-center text-xs text-blue-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Latest activity
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Visa & Immigration Services - Featured */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden group relative">
            <div className="absolute top-3 right-3">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium">
                <Star className="h-3 w-3" />
                <span>Unified</span>
              </div>
            </div>
            <Link href="/admin/workvisas">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Visa & Immigration Services
                </h3>
                <p className="text-sm text-purple-600/70 mb-4">Unified interviews & embassy tracking</p>
                <div className="flex items-center text-xs text-purple-600">
                  <Globe className="h-3 w-3 mr-1" />
                  Enhanced management
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Contracts */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden group">
            <Link href="/admin/contracts">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Tracking</Badge>
                </div>
                <h3 className="text-lg font-semibold text-orange-700 mb-2">Contracts</h3>
                <p className="text-sm text-orange-600/70 mb-4">Contract management and tracking</p>
                <div className="flex items-center text-xs text-orange-600">
                  <Activity className="h-3 w-3 mr-1" />
                  Document flow
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Data Synchronization */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden group">
            <Link href="/admin/sync">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Automated</Badge>
                </div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Data Sync</h3>
                <p className="text-sm text-green-600/70 mb-4">Real-time data synchronization</p>
                <div className="flex items-center text-xs text-green-600">
                  <Activity className="h-3 w-3 mr-1" />
                  Every 5 minutes
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Archive Management */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden group">
            <Link href="/admin/archive">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Archive className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Secure</Badge>
                </div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Archive</h3>
                <p className="text-sm text-indigo-600/70 mb-4">User archiving and management</p>
                <div className="flex items-center text-xs text-indigo-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Data retention
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Users Management */}
          <Card className="admin-glass admin-card-hover border-0 overflow-hidden group">
            <Link href="/admin/users">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
                    {stats.totalUsers}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-pink-700 mb-2">Users</h3>
                <p className="text-sm text-pink-600/70 mb-4">User management and profiles</p>
                <div className="flex items-center text-xs text-pink-600">
                  <Users className="h-3 w-3 mr-1" />
                  Active management
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Users Table */}
        <Card className="admin-glass border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-500" />
                Recent Users
              </CardTitle>
              <Button asChild className="admin-secondary-btn">
                <Link href="/admin/users">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-200/50">
                    <TableHead className="text-purple-700 font-semibold">User</TableHead>
                    <TableHead className="text-purple-700 font-semibold">Email</TableHead>
                    <TableHead className="text-purple-700 font-semibold">Status</TableHead>
                    <TableHead className="text-purple-700 font-semibold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.slice(0, 5).map((user: any) => (
                    <TableRow key={user.id} className="border-purple-200/30 hover:bg-purple-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs">
                              {user.displayName?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-purple-900">{user.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-purple-700">{user.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </TableCell>
                      <TableCell className="text-purple-600/70">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}