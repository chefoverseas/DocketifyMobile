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
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
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

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
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

  const onSubmit = (data: UpdateProfileData) => {
    updateMutation.mutate(data);
  };

  if (!user) {
    return <div>Loading...</div>;
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
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-600">Update your personal information</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
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
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your personal information and contact details.
            </p>
          </CardHeader>
          <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback className="text-lg">
                    {user.displayName?.charAt(0) || user.phone?.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
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
