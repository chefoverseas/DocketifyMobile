import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Settings,
  Save,
  Edit3,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { useState, useRef } from "react";
import { format } from "date-fns";

const updateProfileSchema = z.object({
  // Schema for profile updates - currently no editable fields except photo
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {},
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const photoUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }
      
      const uploadData = await uploadRes.json();
      
      // Update user profile with new photo URL
      const updateRes = await apiRequest("PATCH", "/api/profile", {
        photoUrl: uploadData.url
      });
      
      return updateRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsUploadingPhoto(false);
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    },
    onError: (error: any) => {
      setIsUploadingPhoto(false);
      toast({
        title: "Error", 
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);
    photoUploadMutation.mutate(file);
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const getUserDisplayName = () => {
    const firstName = user.firstName || user.givenName;
    const lastName = user.lastName || user.surname;
    const displayName = user.displayName;
    
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (displayName) return displayName;
    return user.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const firstName = user.firstName || user.givenName || '';
    const lastName = user.lastName || user.surname || '';
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (user.displayName) return user.displayName[0].toUpperCase();
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
            <Card className="border-orange-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Camera className="h-5 w-5 mr-2 text-orange-500" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="relative inline-block">
                  <Avatar className="h-32 w-32 ring-4 ring-orange-100 shadow-lg">
                    <AvatarImage src={user.profileImageUrl || user.photoUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={triggerPhotoUpload}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 h-10 w-10 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{getUserDisplayName()}</h3>
                  <p className="text-gray-600">{user.email || 'No email provided'}</p>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified Account
                  </Badge>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  onClick={triggerPhotoUpload}
                  disabled={isUploadingPhoto}
                  variant="outline"
                  className="w-full border-orange-200 hover:bg-orange-50"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">First Name</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {user.firstName || user.givenName || "Not provided"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Last Name</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {user.lastName || user.surname || "Not provided"}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Email Address</span>
                  </div>
                  <p className="text-gray-900 font-medium">{user.email || 'No email provided'}</p>
                </div>

                {user.phone && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Phone Number</span>
                    </div>
                    <p className="text-gray-900 font-medium">{user.phone}</p>
                  </div>
                )}

                {user.uid && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Settings className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">User ID</span>
                    </div>
                    <p className="text-gray-900 font-medium font-mono">{user.uid}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="h-5 w-5 mr-2 text-purple-500" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Account Created</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {user.createdAt ? format(new Date(user.createdAt), 'PPP') : "Not available"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Information */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Need to update your information?</h3>
                  <p className="text-gray-600 mb-4">
                    Contact our support team to make changes to your personal details or account settings.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                      <Mail className="h-4 w-4 mr-2" />
                      info@chefoverseas.com
                    </Button>
                    <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                      <Phone className="h-4 w-4 mr-2" />
                      +91 9363234028
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}