import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
});

// Country codes with their display names
const countryCodes = [
  { code: "+1", name: "United States/Canada", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
];

type CreateUserData = z.infer<typeof createUserSchema>;

export default function AdminUserCreatePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91"); // Default to India

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      countryCode: "+91"
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const userData = {
        name: data.name,
        surname: data.surname,
        email: data.email,
        countryCode: data.countryCode,
        phone: data.phone, // Send phone without country code, backend will combine
      };
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `User ${data.user.displayName} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      reset();
      setSelectedCountryCode("+91");
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserData) => {
    createUserMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Create New User
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add a new user with passport details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name (as per passport) <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter first name"
                    disabled={createUserMutation.isPending}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">Surname (as per passport) <span className="text-red-500">*</span></Label>
                  <Input
                    id="surname"
                    {...register("surname")}
                    placeholder="Enter surname"
                    disabled={createUserMutation.isPending}
                    required
                  />
                  {errors.surname && (
                    <p className="text-sm text-red-600">{errors.surname.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                  disabled={createUserMutation.isPending}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedCountryCode} 
                    onValueChange={(value) => {
                      setSelectedCountryCode(value);
                      setValue("countryCode", value);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="Enter mobile number (e.g., 9876543210)"
                    disabled={createUserMutation.isPending}
                    className="flex-1"
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
                {errors.countryCode && (
                  <p className="text-sm text-red-600">{errors.countryCode.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Select country code and enter mobile number. User will receive OTP verification codes on this number for login.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                  Required Fields
                </h3>
                <p className="text-sm text-red-700 dark:text-red-200">
                  All fields marked with <span className="text-red-500">*</span> are mandatory and must be completed before creating the user.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  What happens after creation?
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• User will receive a unique 8-digit ID</li>
                  <li>• They can login using their mobile number + OTP verification</li>
                  <li>• They can start uploading their docket documents immediately</li>
                  <li>• You can track their progress from the admin dashboard</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Link href="/admin/dashboard">
                  <Button variant="outline" disabled={createUserMutation.isPending}>
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  className="min-w-[120px]"
                >
                  {createUserMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}