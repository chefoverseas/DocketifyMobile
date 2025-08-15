import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContractUploader } from "@/components/contract-uploader";
import { ArrowLeft, User, FileText, Building2, Calendar } from "lucide-react";

interface Contract {
  id: number;
  userId: string;
  companyContractOriginalUrl?: string;
  companyContractSignedUrl?: string;
  companyContractStatus: string;
  jobOfferOriginalUrl?: string;
  jobOfferSignedUrl?: string;
  jobOfferStatus: string;
  notes?: string;
  lastUpdated: string;
  createdAt: string;
}

interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminContractUpload() {
  const { userId } = useParams();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: [`/api/admin/user/${userId}`],
  });

  const { data: contractData, isLoading: contractLoading } = useQuery({
    queryKey: [`/api/admin/contract/${userId}`],
  });

  const user = userData as User | undefined;
  const contract = (contractData as any)?.contract as Contract | undefined;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Pending Signature</Badge>;
      case 'signed':
        return <Badge variant="outline" className="text-green-600 border-green-300">Signed</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Not Available</Badge>;
    }
  };

  if (userLoading || contractLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-500">User not found</p>
              <Link href="/admin/users">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{user.phone || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Contract Status */}
      {contract && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Current Contract Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Company Contract</span>
                  {getStatusBadge(contract.companyContractStatus)}
                </div>
                {contract.companyContractOriginalUrl && (
                  <p className="text-sm text-gray-500">Original uploaded</p>
                )}
                {contract.companyContractSignedUrl && (
                  <p className="text-sm text-green-600">Signed version received</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Job Offer Letter</span>
                  {getStatusBadge(contract.jobOfferStatus)}
                </div>
                {contract.jobOfferOriginalUrl && (
                  <p className="text-sm text-gray-500">Original uploaded</p>
                )}
                {contract.jobOfferSignedUrl && (
                  <p className="text-sm text-green-600">Signed version received</p>
                )}
              </div>
            </div>
            
            {contract.lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                <Calendar className="h-4 w-4" />
                Last updated: {new Date(contract.lastUpdated).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contract Uploader */}
      <ContractUploader 
        userId={userId!} 
        userDisplayName={user.displayName}
        onUploadComplete={() => {
          // Refresh contract data after upload
          window.location.reload();
        }}
      />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Contract Management Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium">Upload Original Documents</p>
                <p className="text-gray-600">Upload company contract and job offer letter for the user</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium">User Downloads & Signs</p>
                <p className="text-gray-600">User will download documents, sign them digitally or physically, and scan</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium">User Uploads Signed Versions</p>
                <p className="text-gray-600">User uploads the signed documents back to the system</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <p className="font-medium">Admin Review</p>
                <p className="text-gray-600">Admin can review and validate the signed documents</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}