import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CheckCircle, Clock, AlertTriangle, Download, Search, Plus, FileText, Settings, Database } from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";

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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Admin Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground">Manage users and export data</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/workpermits">
                  <FileText className="w-4 h-4 mr-2" />
                  Work Permits
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/workvisas">
                  <FileText className="w-4 h-4 mr-2" />
                  Work Visas
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/contracts">
                  <Settings className="w-4 h-4 mr-2" />
                  Contracts
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/sync">
                  <Database className="w-4 h-4 mr-2" />
                  Data Sync
                </Link>
              </Button>
              <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button asChild>
                <Link href="/admin/user/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Access Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/workpermits">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Work Permits</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/workvisas">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Work Visas</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/contracts">
            <CardContent className="p-4 text-center">
              <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Contracts</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <Link href="/admin/sync">
            <CardContent className="p-4 text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium text-green-800">Data Sync</p>
              <p className="text-xs text-green-600 mt-1">NEW</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/users">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-medium">Users</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/user/new">
            <CardContent className="p-4 text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <p className="text-sm font-medium">Add User</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Completed Dockets</p>
                <p className="text-2xl font-bold text-green-900">{stats.completedDockets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pending Dockets</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingDockets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Issues</p>
                <p className="text-2xl font-bold text-red-900">{stats.issues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <div className="flex items-center space-x-2">
              <Input placeholder="Search users..." className="w-64" />
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Docket Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePhotoUrl || ""} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0) || user.phone?.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || "No Name"}
                        </div>
                        <div className="text-sm text-gray-500">{user.email || "No Email"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        user.docketCompleted 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {user.docketCompleted ? "Complete" : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
