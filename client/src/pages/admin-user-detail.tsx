import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import DocketForm from "@/components/docket-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Upload, FileText } from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface AdminUserDetailProps {
  userId?: string;
}

export default function AdminUserDetail({ userId: propUserId }: AdminUserDetailProps) {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Get user data to show name in upload dialog
  const { data: userData } = useQuery({
    queryKey: [`/api/admin/user/${userId}`],
    enabled: !!userId,
  });

  const user = userData as any;

  // Mutation for completing docket upload
  const completeDocketMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/admin/docket/${userId}/complete`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Docket Completed",
        description: "User docket has been marked as complete successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/user/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/docket/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsUploadDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete docket. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <img src={chefOverseasLogo} alt="Chef Overseas" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Admin Dashboard - User Details</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Docket for User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" />
                      Upload Docket for {user?.displayName || user?.phone || 'User'}
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      Upload documents and complete the docket on behalf of this user. Once completed, their status will be marked as "Docket Complete".
                    </p>
                  </DialogHeader>
                  <div className="mt-4">
                    <DocketForm 
                      userId={userId} 
                      isAdminMode={true}
                      isLoading={completeDocketMutation.isPending}
                      onComplete={() => {
                        completeDocketMutation.mutate();
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              
              <Link href="/admin/users">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center">
            <User className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">User Details & Module Access</h2>
          </div>
          <p className="text-gray-600 mt-1">
            Complete overview of user information and all associated modules
          </p>
        </div>

        {/* User Navigation Hub with User Info */}
        <UserNavigationHub userId={userId} showUserInfo={true} />
      </div>
    </div>
  );
}