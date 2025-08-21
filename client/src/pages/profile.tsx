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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { ArrowLeft, Camera, Upload, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { useState, useRef } from "react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

const updateProfileSchema = insertUserSchema.pick({
  displayName: true,
  email: true,
}).extend({
  displayName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional(),
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
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
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
      
      // Update profile with new image URL
      const profileRes = await apiRequest("PATCH", "/api/profile", {
        profileImageUrl: uploadData.file.url
      });
      
      return profileRes.json();
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
        description: error.message || "Failed to update profile photo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileData) => {
    updateMutation.mutate(data);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, or GIF image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);
    photoUploadMutation.mutate(file);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <img 
                src={chefOverseasLogo} 
                alt="Chef Overseas" 
                className="h-12 w-12 rounded-xl shadow-lg" 
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-sm text-gray-600">Update your personal information and preferences</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="hover:bg-orange-50 border-orange-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Hub */}
        <div className="mb-8">
          <UserNavigationHub />
        </div>

        {/* Profile Form */}
        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-gray-900">Profile Information</CardTitle>
            <p className="text-sm text-gray-600">
              Update your personal information and contact details.
            </p>
          </CardHeader>
          <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage src={user.profileImageUrl || ""} className="object-cover" />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-orange-400 to-red-500 text-white">
                      {user.displayName?.charAt(0) || user.phone?.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-orange-600 transition-colors" onClick={handlePhotoClick}>
                    <Camera className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePhotoClick}
                    disabled={isUploadingPhoto}
                    className="min-w-[120px]"
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
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Phone Number</FormLabel>
                  <Input 
                    value={user.phone || ""} 
                    disabled 
                    className="bg-muted text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Phone number cannot be changed
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Member Since</FormLabel>
                  <Input 
                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""} 
                    disabled 
                    className="bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
