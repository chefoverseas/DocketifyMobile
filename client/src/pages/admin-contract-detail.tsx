import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Upload, CheckCircle, Clock, AlertTriangle, User, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface AdminContractDetailProps {
  userId?: string;
}

export default function AdminContractDetail({ userId: propUserId }: AdminContractDetailProps) {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/admin/contract/${userId}`],
    enabled: !!userId,
  });

  const user = (data as any)?.user;
  const contract = (data as any)?.contract;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <Link href="/admin/users">
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "rejected": return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 mr-3">
                <img 
                  src={chefOverseasLogo} 
                  alt="Chef Overseas" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
                <p className="text-sm text-gray-600">Admin Dashboard - Contract Details</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href={`/admin/user/${userId}`}>
                <Button variant="outline">User Details</Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
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
        {/* User Info Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-lg font-semibold text-gray-900">{user.displayName}</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{user.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">User ID</p>
                  <p className="text-sm text-gray-900 font-mono">{user.uid}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Status Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Contract Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!contract ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Contracts Yet</h3>
                <p className="text-gray-600">No contract documents have been uploaded for this user.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Contract */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Company Contract</h3>
                    <Badge className={getStatusColor(contract.companyContractStatus || 'not-started')}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(contract.companyContractStatus || 'not-started')}
                        <span className="capitalize">{contract.companyContractStatus || 'Not Started'}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {contract.companyContractOriginalUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Original Document</p>
                        <a href={contract.companyContractOriginalUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            View Original
                          </Button>
                        </a>
                      </div>
                    )}

                    {contract.companyContractSignedUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Signed Document</p>
                        <a href={contract.companyContractSignedUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            View Signed
                          </Button>
                        </a>
                      </div>
                    )}

                    {contract.companyContractSignatureValid !== null && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Signature Valid:</span>
                        <Badge className={contract.companyContractSignatureValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {contract.companyContractSignatureValid ? "Yes" : "No"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Offer */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Job Offer Letter</h3>
                    <Badge className={getStatusColor(contract.jobOfferStatus || 'not-started')}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(contract.jobOfferStatus || 'not-started')}
                        <span className="capitalize">{contract.jobOfferStatus || 'Not Started'}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {contract.jobOfferOriginalUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Original Document</p>
                        <a href={contract.jobOfferOriginalUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            View Original
                          </Button>
                        </a>
                      </div>
                    )}

                    {contract.jobOfferSignedUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Signed Document</p>
                        <a href={contract.jobOfferSignedUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            View Signed
                          </Button>
                        </a>
                      </div>
                    )}

                    {contract.jobOfferSignatureValid !== null && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Signature Valid:</span>
                        <Badge className={contract.jobOfferSignatureValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {contract.jobOfferSignatureValid ? "Yes" : "No"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Metadata */}
        {contract && (
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Created Date</p>
                  <p className="text-sm text-gray-900">
                    {contract.createdAt ? format(new Date(contract.createdAt), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {contract.lastUpdated ? format(new Date(contract.lastUpdated), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>

              {contract.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{contract.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link href={`/admin/docket/${userId}`}>
            <Button variant="outline">View Docket</Button>
          </Link>
          <Link href={`/admin/workpermit/${userId}`}>
            <Button variant="outline">View Work Permit</Button>
          </Link>
          <Link href={`/admin/user/${userId}`}>
            <Button variant="outline">User Overview</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}