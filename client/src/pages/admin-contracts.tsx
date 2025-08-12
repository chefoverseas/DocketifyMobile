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
  Search,
  ArrowLeft,
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export default function AdminContractsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!(adminData as any)?.admin,
  });

  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/admin/contracts"],
    enabled: !!(adminData as any)?.admin,
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contracts"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contracts"] });
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

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const users: User[] = (usersData as any)?.users || [];
  const contracts: any[] = (contractsData as any)?.contracts || [];
  
  // Create users list from contracts if users API fails
  const contractUsersMap = new Map();
  contracts.forEach(contract => {
    if (contract.userId) {
      contractUsersMap.set(contract.userId, contract);
    }
  });

  // If users data is unavailable, create user list from contracts
  const allUsers = users.length > 0 ? users : Array.from(contractUsersMap.keys()).map(userId => ({
    id: userId,
    displayName: `User ${userId.slice(-6)}`,
    phone: 'Loading...',
    email: null,
    uid: userId.slice(-8).toUpperCase()
  }));
  
  // Create a combined data structure with user and contract info
  const usersWithContracts = allUsers.map(user => {
    const userContract = contracts.find(contract => contract.userId === user.id);
    return {
      ...user,
      contract: userContract || null
    };
  });

  const filteredUsers = usersWithContracts.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
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
        {/* Contract Statistics */}
        {!contractsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Contracts</p>
                    <p className="text-2xl font-bold text-blue-900">{contracts.length}</p>
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
                    <p className="text-sm font-medium text-green-600">Signed Contracts</p>
                    <p className="text-2xl font-bold text-green-900">
                      {contracts.filter(c => c.companyContractStatus === "signed" || c.jobOfferStatus === "signed").length}
                    </p>
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
                    <p className="text-sm font-medium text-yellow-600">Pending Signature</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {contracts.filter(c => c.companyContractStatus === "pending" || c.jobOfferStatus === "pending").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-600">Missing Documents</p>
                    <p className="text-2xl font-bold text-red-900">
                      {usersWithContracts.filter(u => !u.contract?.companyContractOriginalUrl || !u.contract?.jobOfferOriginalUrl).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
          {usersLoading || contractsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading contracts...</p>
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
                          {(user as any).firstName && (user as any).lastName 
                            ? `${(user as any).firstName} ${(user as any).lastName}`
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
                          {(() => {
                            const contract = user.contract;
                            if (!contract || !contract.companyContractOriginalUrl) {
                              return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                            } else if (contract.companyContractStatus === "signed") {
                              return <Badge className="bg-green-100 text-green-800">Signed</Badge>;
                            } else if (contract.companyContractStatus === "pending") {
                              return <Badge className="bg-blue-100 text-blue-800">Awaiting Signature</Badge>;
                            } else if (contract.companyContractStatus === "rejected") {
                              return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
                            }
                            return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                          })()}
                        </div>

                        {/* Show uploaded documents */}
                        {user.contract?.companyContractOriginalUrl && (
                          <div className="mb-3 p-2 bg-blue-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-blue-700">Original Contract</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={user.contract.companyContractOriginalUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {user.contract?.companyContractSignedUrl && (
                          <div className="mb-3 p-2 bg-green-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-green-700">Signed Contract</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={user.contract.companyContractSignedUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        
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
                          {(() => {
                            const contract = user.contract;
                            if (!contract || !contract.jobOfferOriginalUrl) {
                              return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                            } else if (contract.jobOfferStatus === "signed") {
                              return <Badge className="bg-green-100 text-green-800">Signed</Badge>;
                            } else if (contract.jobOfferStatus === "pending") {
                              return <Badge className="bg-blue-100 text-blue-800">Awaiting Signature</Badge>;
                            } else if (contract.jobOfferStatus === "rejected") {
                              return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
                            }
                            return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                          })()}
                        </div>

                        {/* Show uploaded documents */}
                        {user.contract?.jobOfferOriginalUrl && (
                          <div className="mb-3 p-2 bg-blue-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-blue-700">Original Job Offer</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={user.contract.jobOfferOriginalUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {user.contract?.jobOfferSignedUrl && (
                          <div className="mb-3 p-2 bg-green-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-green-700">Signed Job Offer</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={user.contract.jobOfferSignedUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user as User);
                        setShowUserDetails(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Contracts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {filteredUsers.length === 0 && !usersLoading && !contractsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No users found matching your search." : "No users found"}
              </p>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => setShowUserDetails(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle className="text-xl">
                    Contract Management - {selectedUser?.displayName || selectedUser?.givenName + " " + selectedUser?.surname || "User"}
                  </DialogTitle>
                  <DialogDescription>
                    Manage company contracts and job offers for this user
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6 p-4">
                {/* User Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>User Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedUser.displayName || `${selectedUser.givenName} ${selectedUser.surname}` || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedUser.phone || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedUser.email || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">UID:</span> {selectedUser.uid || "N/A"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contract Management */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Company Contract */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span>Company Contract</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Status:</span>
                        {(() => {
                          const contract = usersWithContracts.find(u => u.id === selectedUser.id)?.contract;
                          if (!contract || !contract.companyContractOriginalUrl) {
                            return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                          } else if (contract.companyContractStatus === "signed") {
                            return <Badge className="bg-green-100 text-green-800">Signed</Badge>;
                          } else if (contract.companyContractStatus === "pending") {
                            return <Badge className="bg-blue-100 text-blue-800">Awaiting Signature</Badge>;
                          }
                          return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                        })()}
                      </div>

                      {/* Documents */}
                      <div className="space-y-2">
                        {usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.companyContractOriginalUrl && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-700">Original Contract</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.companyContractOriginalUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.companyContractSignedUrl && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-700">Signed Contract</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.companyContractSignedUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Upload */}
                      <div>
                        <Label htmlFor={`modal-company-contract-${selectedUser.id}`}>Upload Company Contract PDF</Label>
                        <Input
                          id={`modal-company-contract-${selectedUser.id}`}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCompanyContractUpload(selectedUser.id, file);
                              e.target.value = '';
                            }
                          }}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Offer */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        <span>Job Offer Letter</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Status:</span>
                        {(() => {
                          const contract = usersWithContracts.find(u => u.id === selectedUser.id)?.contract;
                          if (!contract || !contract.jobOfferOriginalUrl) {
                            return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                          } else if (contract.jobOfferStatus === "signed") {
                            return <Badge className="bg-green-100 text-green-800">Signed</Badge>;
                          } else if (contract.jobOfferStatus === "pending") {
                            return <Badge className="bg-blue-100 text-blue-800">Awaiting Signature</Badge>;
                          }
                          return <Badge className="bg-yellow-100 text-yellow-800">Pending Upload</Badge>;
                        })()}
                      </div>

                      {/* Documents */}
                      <div className="space-y-2">
                        {usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.jobOfferOriginalUrl && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-700">Original Job Offer</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.jobOfferOriginalUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.jobOfferSignedUrl && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-700">Signed Job Offer</span>
                              <Button asChild variant="ghost" size="sm">
                                <a href={usersWithContracts.find(u => u.id === selectedUser.id)?.contract?.jobOfferSignedUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Upload */}
                      <div>
                        <Label htmlFor={`modal-job-offer-${selectedUser.id}`}>Upload Job Offer PDF</Label>
                        <Input
                          id={`modal-job-offer-${selectedUser.id}`}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleJobOfferUpload(selectedUser.id, file);
                              e.target.value = '';
                            }
                          }}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}