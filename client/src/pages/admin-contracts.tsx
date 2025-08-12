import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Upload, 
  FileText, 
  Building2, 
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  Search
} from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export default function AdminContractsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!adminData?.admin,
  });

  const uploadCompanyContractMutation = useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch(`/api/admin/contracts/${userId}/company-contract`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload company contract');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Company contract uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload contract",
        variant: "destructive",
      });
    },
  });

  const uploadJobOfferMutation = useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch(`/api/admin/contracts/${userId}/job-offer`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload job offer');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Job offer uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload job offer",
        variant: "destructive",
      });
    },
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!adminData?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const users: User[] = usersData?.users || [];
  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.uid?.includes(searchTerm)
  );

  const handleCompanyContractUpload = (userId: string, file: File) => {
    uploadCompanyContractMutation.mutate({ userId, file });
  };

  const handleJobOfferUpload = (userId: string, file: File) => {
    uploadJobOfferMutation.mutate({ userId, file });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Contract Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upload and manage user contracts
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setLocation("/admin/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, phone, or UID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-6">
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>
                          {user.givenName && user.surname 
                            ? `${user.givenName} ${user.surname}`
                            : user.displayName || "Unnamed User"
                          }
                        </span>
                      </CardTitle>
                      <div className="text-sm text-gray-600 space-x-4 mt-2">
                        <span>Phone: {user.phone}</span>
                        <span>UID: {user.uid || "Not assigned"}</span>
                        <span>Email: {user.email || "No email"}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Company Contract Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Company Contract</h3>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Current Status</span>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending Upload
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`company-contract-${user.id}`}>Upload Company Contract PDF</Label>
                            <Input
                              id={`company-contract-${user.id}`}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleCompanyContractUpload(user.id, file);
                                  e.target.value = ''; // Reset file input
                                }
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job Offer Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">Job Offer Letter</h3>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Current Status</span>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending Upload
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`job-offer-${user.id}`}>Upload Job Offer PDF</Label>
                            <Input
                              id={`job-offer-${user.id}`}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleJobOfferUpload(user.id, file);
                                  e.target.value = ''; // Reset file input
                                }
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {filteredUsers.length === 0 && !usersLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No users found matching your search." : "No users found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}