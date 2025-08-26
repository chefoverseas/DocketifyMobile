import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { Archive, RotateCcw, Users, AlertCircle, CheckCircle, Clock, Trash2, User } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface ArchiveStats {
  totalUsers: number;
  activeUsers: number;
  archivedUsers: number;
  usersEligibleForArchive: number;
  oldestUserAge: number;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  uid: string;
  createdAt: string;
  archived: boolean;
  archivedAt: string | null;
  archivedReason: string | null;
}

interface ArchiveResult {
  archived: number;
  errors: string[];
  summary: string;
}

export default function AdminArchiveManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch archive statistics
  const { data: stats, isLoading: statsLoading } = useQuery<ArchiveStats>({
    queryKey: ['/api/admin/archive/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch archived users
  const { data: archivedUsers, isLoading: archivedLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/archive/users'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch users eligible for archiving
  const { data: eligibleUsers, isLoading: eligibleLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/archive/eligible'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Run automatic archive mutation
  const runArchiveMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/archive/run', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/eligible'] });
    },
  });

  // Manual archive mutation
  const archiveUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => 
      apiRequest(`/api/admin/archive/user/${userId}`, { 
        method: 'POST', 
        body: { reason }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/eligible'] });
      setIsArchiveDialogOpen(false);
      setSelectedUser(null);
      setArchiveReason("");
    },
  });

  // Restore user mutation
  const restoreUserMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest(`/api/admin/archive/restore/${userId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archive/eligible'] });
      setIsRestoreDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const calculateUserAge = (createdAt: string) => {
    return differenceInDays(new Date(), new Date(createdAt));
  };

  const handleArchiveUser = (user: User) => {
    setSelectedUser(user);
    setArchiveReason("");
    setIsArchiveDialogOpen(true);
  };

  const handleRestoreUser = (user: User) => {
    setSelectedUser(user);
    setIsRestoreDialogOpen(true);
  };

  const confirmArchive = () => {
    if (selectedUser) {
      archiveUserMutation.mutate({ 
        userId: selectedUser.id, 
        reason: archiveReason || "manual_archive" 
      });
    }
  };

  const confirmRestore = () => {
    if (selectedUser) {
      restoreUserMutation.mutate(selectedUser.id);
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading archive statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-orange-200/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                User Archive Management
              </h1>
              <p className="text-muted-foreground">
                Manage inactive users and archive users older than 1 year
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="backdrop-blur-sm bg-white/70 border-orange-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">All users in system</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-green-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived Users</CardTitle>
              <Archive className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{stats?.archivedUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Moved to archive</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-amber-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eligible for Archive</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{stats?.usersEligibleForArchive || 0}</div>
              <p className="text-xs text-muted-foreground">Older than 1 year</p>
            </CardContent>
          </Card>
        </div>

        {/* Archive Actions */}
        <Card className="backdrop-blur-sm bg-white/70 border-orange-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-orange-600" />
              <span>Archive Actions</span>
            </CardTitle>
            <CardDescription>
              Run automatic archiving or manage individual users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.usersEligibleForArchive && stats.usersEligibleForArchive > 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Archive Recommended</AlertTitle>
                <AlertDescription className="text-amber-700">
                  {stats.usersEligibleForArchive} users are older than 1 year and can be archived.
                  Oldest user is {stats.oldestUserAge} days old.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => runArchiveMutation.mutate()}
                disabled={runArchiveMutation.isPending || (stats?.usersEligibleForArchive || 0) === 0}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                data-testid="button-run-archive"
              >
                {runArchiveMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Archive className="h-4 w-4 mr-2" />
                )}
                Run Automatic Archive
              </Button>
            </div>

            {runArchiveMutation.data && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Archive Complete</AlertTitle>
                <AlertDescription className="text-green-700">
                  {(runArchiveMutation.data as ArchiveResult).summary}
                  {(runArchiveMutation.data as ArchiveResult).errors.length > 0 && (
                    <div className="mt-2">
                      <strong>Errors:</strong>
                      <ul className="list-disc list-inside">
                        {(runArchiveMutation.data as ArchiveResult).errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="eligible" className="space-y-4">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-orange-200/50">
            <TabsTrigger value="eligible" className="data-[state=active]:bg-orange-100">
              Users Eligible for Archive ({eligibleUsers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-gray-100">
              Archived Users ({archivedUsers?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eligible" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/70 border-orange-200/50">
              <CardHeader>
                <CardTitle>Users Eligible for Archive</CardTitle>
                <CardDescription>
                  Users older than 1 year who can be automatically archived
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eligibleLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading eligible users...</p>
                  </div>
                ) : eligibleUsers && eligibleUsers.length > 0 ? (
                  <div className="space-y-3">
                    {eligibleUsers.map((user) => {
                      const age = calculateUserAge(user.createdAt);
                      return (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-4 rounded-lg border border-orange-200/50 bg-white/50"
                          data-testid={`user-eligible-${user.id}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-full bg-amber-100">
                              <User className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-medium">{user.displayName}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                              <div className="text-xs text-muted-foreground">
                                Created: {format(new Date(user.createdAt), 'MMM dd, yyyy')} ({age} days old)
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              {age} days old
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => handleArchiveUser(user)}
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              data-testid={`button-archive-${user.id}`}
                            >
                              <Archive className="h-3 w-3 mr-1" />
                              Archive
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Eligible</h3>
                    <p className="text-muted-foreground">All users are less than 1 year old.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archived" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/70 border-gray-200/50">
              <CardHeader>
                <CardTitle>Archived Users</CardTitle>
                <CardDescription>
                  Users who have been moved to the archive
                </CardDescription>
              </CardHeader>
              <CardContent>
                {archivedLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading archived users...</p>
                  </div>
                ) : archivedUsers && archivedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {archivedUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200/50 bg-gray-50/50"
                        data-testid={`user-archived-${user.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-gray-100">
                            <Archive className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">{user.displayName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <div className="text-xs text-muted-foreground">
                              Archived: {user.archivedAt ? format(new Date(user.archivedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                              {user.archivedReason && ` • Reason: ${user.archivedReason}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                            Archived
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreUser(user)}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            data-testid={`button-restore-${user.id}`}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Archived Users</h3>
                    <p className="text-muted-foreground">No users have been archived yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Archive User Dialog */}
        <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive User</DialogTitle>
              <DialogDescription>
                Are you sure you want to archive {selectedUser?.displayName}? This action can be undone later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="archive-reason">Archive Reason (Optional)</Label>
                <Textarea
                  id="archive-reason"
                  placeholder="Enter reason for archiving this user..."
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  data-testid="input-archive-reason"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmArchive}
                  disabled={archiveUserMutation.isPending}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  data-testid="button-confirm-archive"
                >
                  {archiveUserMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Archive className="h-4 w-4 mr-2" />
                  )}
                  Archive User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Restore User Dialog */}
        <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restore User</DialogTitle>
              <DialogDescription>
                Are you sure you want to restore {selectedUser?.displayName} from the archive?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmRestore}
                disabled={restoreUserMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                data-testid="button-confirm-restore"
              >
                {restoreUserMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Restore User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}