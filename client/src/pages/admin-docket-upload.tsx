import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";
import DocketForm from "@/components/docket-form";
import type { Docket } from "@shared/schema";

interface AdminDocketUploadProps {
  userId?: string;
}

export default function AdminDocketUpload({ userId: propUserId }: AdminDocketUploadProps) {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Get user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: [`/api/admin/user/${userId}`],
    enabled: !!userId,
  });

  // Get existing docket data
  const { data: docketData } = useQuery({
    queryKey: [`/api/admin/docket/${userId}`],
    enabled: !!userId,
  });

  const user = userData as any;
  const docket = (docketData as any)?.docket;

  // Mutation for saving docket data
  const saveDocketMutation = useMutation({
    mutationFn: async (data: Partial<Docket>) => {
      return apiRequest('PUT', `/api/admin/docket/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Saved",
        description: "Docket documents saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/docket/${userId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Error",
        description: error.message || "Failed to save docket documents",
        variant: "destructive",
      });
    }
  });

  // Mutation for completing docket upload
  const completeDocketMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);
      return apiRequest('POST', `/api/admin/docket/${userId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Docket completed successfully for ${user?.displayName || user?.phone}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/user/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/docket/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      // Redirect back to user detail page
      setTimeout(() => {
        setLocation(`/admin/user/${userId}`);
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Completion Error",
        description: error.message || "Failed to complete docket. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Check if all required documents are uploaded
  const isCompletionAllowed = () => {
    if (!docket) return false;
    
    const requiredFields = [
      'passportFrontUrl',
      'passportLastUrl', 
      'passportPhotoUrl',
      'offerLetterUrl',
      'permanentAddressUrl',
      'currentAddressUrl'
    ];
    
    return requiredFields.every(field => docket[field]);
  };

  const getMissingDocuments = () => {
    if (!docket) return ['All documents'];
    
    const requiredDocs = [
      { field: 'passportFrontUrl', name: 'Passport Front Page' },
      { field: 'passportLastUrl', name: 'Passport Last Page' },
      { field: 'passportPhotoUrl', name: 'Passport Photo Page' },
      { field: 'offerLetterUrl', name: 'Current Employer Offer Letter' },
      { field: 'permanentAddressUrl', name: 'Permanent Address Proof' },
      { field: 'currentAddressUrl', name: 'Current Address Proof' }
    ];
    
    return requiredDocs.filter(doc => !docket[doc.field]).map(doc => doc.name);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            User not found. Please check the user ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <img src={chefOverseasLogo} alt="Chef Overseas" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Docket Upload</h1>
                <p className="text-sm text-gray-600">Upload documents on behalf of user</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href={`/admin/user/${userId}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to User Details
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline">
                  All Users
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.displayName || "No Name Set"}
                  </h2>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500">{user?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  className={
                    user?.docketCompleted 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }
                >
                  {user?.docketCompleted ? "Docket Complete" : "Docket Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Alert className="mb-8">
          <Upload className="h-4 w-4" />
          <AlertDescription>
            <strong>Admin Docket Upload:</strong> Upload all required documents for this user. 
            Once you click "Complete User's Docket", their status will be marked as complete and they will be notified.
          </AlertDescription>
        </Alert>

        {/* Docket Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              Upload Documents for {user?.displayName || user?.phone}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocketForm 
              docket={docket}
              userId={userId} 
              isAdminMode={true}
              isLoading={isUploading || completeDocketMutation.isPending || saveDocketMutation.isPending}
              onSubmit={(data) => {
                console.log("Admin saving docket data:", data);
                saveDocketMutation.mutate(data);
              }}
              onComplete={() => {
                const missingDocs = getMissingDocuments();
                if (missingDocs.length > 0) {
                  toast({
                    title: "Cannot Complete Docket",
                    description: `Missing required documents: ${missingDocs.join(', ')}`,
                    variant: "destructive",
                  });
                  return;
                }
                completeDocketMutation.mutate();
              }}
            />
            
            {/* Validation Warning */}
            {!isCompletionAllowed() && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Documents:</strong> The following documents are required before completing the docket:
                  <ul className="list-disc list-inside mt-2">
                    {getMissingDocuments().map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}