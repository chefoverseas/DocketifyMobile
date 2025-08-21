import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Users, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  User,
  Plus,
  ArrowLeft,
  Settings,
  UserCheck,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

const updateUserSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type UpdateUserData = z.infer<typeof updateUserSchema>;

type User = {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  isAdmin: boolean;
  docketCompleted: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const users = ((data as { users?: User[] })?.users || []) as User[];

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema),
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserData & { userId: string }) => {
      const { userId, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, updateData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `User ${data.user.displayName} updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditingUser(null);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setValue("displayName", user.displayName || "");
    setValue("email", user.email || "");
    setValue("phone", user.phone || "");
  };

  const onSubmit = (data: UpdateUserData) => {
    if (editingUser) {
      updateUserMutation.mutate({
        ...data,
        userId: editingUser.id,
      });
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertDescription>
              Failed to load users data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header Section */}
        <Card className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white border-none shadow-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                    <img 
                      src={chefOverseasLogo} 
                      alt="Chef Overseas Logo" 
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">User Management</h1>
                    <p className="text-orange-100 text-lg mt-1">
                      Manage user accounts, profiles, and permissions across the platform
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-orange-100">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{users.length} Total Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>{users.filter(u => u.docketCompleted).length} Completed Dockets</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>{users.filter(u => u.isAdmin).length} Admin Users</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  asChild
                  variant="outline" 
                  size="sm"
                  className="bg-white/50 hover:bg-white/80 border-white/30"
                >
                  <Link to="/admin/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Dashboard
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="secondary"
                  size="sm"
                  className="bg-white text-orange-600 hover:bg-white/90"
                >
                  <Link to="/admin/user/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New User
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, phone, or UID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Admin Users</p>
                  <p className="text-2xl font-bold text-purple-900">{users.filter(u => u.isAdmin).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Completed Dockets</p>
                  <p className="text-2xl font-bold text-green-900">{users.filter(u => u.docketCompleted).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Pending Dockets</p>
                  <p className="text-2xl font-bold text-orange-900">{users.filter(u => !u.docketCompleted).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-16 w-16 flex-shrink-0">
                        {(user as any).photoUrl ? (
                          <img
                            src={(user as any).photoUrl}
                            alt={user.displayName || 'User'}
                            className="h-16 w-16 rounded-full object-cover border-3 border-orange-200 shadow-lg"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center shadow-lg">
                            <User className="h-8 w-8 text-orange-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {user.displayName || "No Name Set"}
                          </h3>
                          {user.isAdmin && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              <Settings className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          <Badge 
                            className={
                              user.docketCompleted 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-orange-100 text-orange-800 border-orange-200"
                            }
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            {user.docketCompleted ? "Docket Complete" : "Docket Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          UID: {user.uid}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{user.email || "No email"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Created {format(new Date(user.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button 
                      asChild
                      size="sm" 
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Link to={`/admin/user/${user.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button 
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      <Link to={`/admin/user/${user.id}/upload-docket`}>
                        <FileText className="h-4 w-4 mr-2" />
                        {user.docketCompleted ? "View Docket" : "Upload Docket"}
                      </Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-2xl">
                        <DialogHeader className="pb-6">
                          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Edit User Details
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="displayName">Full Name <span className="text-red-500">*</span></Label>
                            <Input
                              id="displayName"
                              {...register("displayName")}
                              placeholder="Enter full name"
                              disabled={updateUserMutation.isPending}
                            />
                            {errors.displayName && (
                              <p className="text-sm text-red-600">{errors.displayName.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              {...register("email")}
                              placeholder="Enter email address"
                              disabled={updateUserMutation.isPending}
                            />
                            {errors.email && (
                              <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
                            <Input
                              id="phone"
                              type="tel"
                              {...register("phone")}
                              placeholder="Enter mobile number"
                              disabled={updateUserMutation.isPending}
                            />
                            {errors.phone && (
                              <p className="text-sm text-red-600">{errors.phone.message}</p>
                            )}
                          </div>

                          <DialogFooter className="pt-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setEditingUser(null)}
                              disabled={updateUserMutation.isPending}
                              className="border-gray-300 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={updateUserMutation.isPending}
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white min-w-[120px]"
                            >
                              {updateUserMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Saving...
                                </div>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {!user.isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.displayName || user.phone)}
                        disabled={deleteUserMutation.isPending}
                        className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                    <Users className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? "No users match your search criteria." : "No users have been created yet."}
                  </p>
                  <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                    <Link to="/admin/user/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First User
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}