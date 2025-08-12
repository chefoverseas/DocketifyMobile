import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import FileUploader from "@/components/file-uploader";
import ContractUploader from "@/components/contract-uploader";
import { 
  FileText, 
  Building2, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  XCircle,
  Shield,
  AlertTriangle
} from "lucide-react";
import type { Contract } from "@shared/schema";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function ContractsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contractData, isLoading } = useQuery({
    queryKey: ["/api/contracts"],
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const contract: Contract | null = (contractData as any)?.contract || null;

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Contract>) => {
      const res = await apiRequest("PATCH", "/api/contracts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Success",
        description: "Contract updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contract",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (field: keyof Contract, fileData: any) => {
    updateMutation.mutate({ [field]: fileData });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Calculate progress
  const sections = [
    { key: 'companyContract', completed: !!contract?.companyContractSignedUrl },
    { key: 'jobOffer', completed: !!contract?.jobOfferSignedUrl },
  ];
  
  const completedSections = sections.filter(s => s.completed).length;
  const progressPercentage = (completedSections / sections.length) * 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
  };

  const getStatusIcon = (status: string, signatureValid?: boolean) => {
    if (status === 'signed' || status === 'accepted') {
      return signatureValid ? 
        <CheckCircle className="h-5 w-5 text-green-600" /> : 
        <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
    if (status === 'rejected') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <img src={chefOverseasLogo} alt="Chef Overseas" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
                <p className="text-sm text-gray-600">View and sign your employment contracts</p>
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

        <div className="max-w-6xl mx-auto">
          {/* Progress Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Contract Status</h2>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{completedSections}</span> of{" "}
                  <span>{sections.length}</span> documents signed
                </div>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Company Contract Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      contract?.companyContractOriginalUrl ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Building2 className={`h-4 w-4 ${
                        contract?.companyContractOriginalUrl ? "text-green-600" : "text-gray-400"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Company Contract</span>
                        {contract?.companyContractOriginalUrl && (
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(contract.companyContractStatus || 'pending', contract.companyContractSignatureValid ?? undefined)}
                            {contract.companyContractSignatureValid && (
                              <Shield className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Upload your official company employment contract
                      </p>
                    </div>
                  </div>
                  {contract?.companyContractOriginalUrl && getStatusBadge(contract.companyContractStatus || 'pending')}
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  {!contract?.companyContractOriginalUrl ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for Admin</h3>
                      <p className="text-gray-600">
                        Your admin will upload the company contract for you to review and sign.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Original Contract</h4>
                          <p className="text-sm text-gray-600">Review and download the contract from admin</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={contract.companyContractOriginalUrl} target="_blank">
                            <Building2 className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>

                      {!contract?.companyContractSignedUrl ? (
                        <div className="border-2 border-dashed border-orange-300 rounded-lg p-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-2 text-center">
                            Sign Your Company Contract
                          </h4>
                          <p className="text-center text-gray-600 mb-4">
                            Please review, print, sign, and upload the signed contract
                          </p>
                          <ContractUploader
                            onUpload={(fileData) => handleFileUpload('companyContractSignedUrl', fileData)}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                Signed Contract Submitted
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Status: {contract.companyContractStatus || 'pending'}
                              </p>
                              {contract.companyContractSignatureValid !== undefined && (
                                <p className="text-sm text-gray-600">
                                  Signature: {contract.companyContractSignatureValid ? 'Valid' : 'Invalid/Missing'}
                                </p>
                              )}
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={contract.companyContractSignedUrl} target="_blank">
                                <FileText className="h-4 w-4 mr-2" />
                                View Signed
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Offer Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      contract?.jobOfferOriginalUrl ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Briefcase className={`h-4 w-4 ${
                        contract?.jobOfferOriginalUrl ? "text-green-600" : "text-gray-400"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Job Offer Letter</span>
                        {contract?.jobOfferOriginalUrl && (
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(contract.jobOfferStatus || 'pending', contract.jobOfferSignatureValid ?? undefined)}
                            {contract.jobOfferSignatureValid && (
                              <Shield className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Upload your official job offer letter
                      </p>
                    </div>
                  </div>
                  {contract?.jobOfferOriginalUrl && getStatusBadge(contract.jobOfferStatus || 'pending')}
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  {!contract?.jobOfferOriginalUrl ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for Admin</h3>
                      <p className="text-gray-600">
                        Your admin will upload the job offer for you to review and sign.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Original Job Offer</h4>
                          <p className="text-sm text-gray-600">Review and download the job offer from admin</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={contract.jobOfferOriginalUrl} target="_blank">
                            <FileText className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>

                      {!contract?.jobOfferSignedUrl ? (
                        <div className="border-2 border-dashed border-orange-300 rounded-lg p-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-2 text-center">
                            Sign Your Job Offer
                          </h4>
                          <p className="text-center text-gray-600 mb-4">
                            Please review, print, sign, and upload the signed job offer
                          </p>
                          <ContractUploader
                            onUpload={(fileData) => handleFileUpload('jobOfferSignedUrl', fileData)}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                Signed Job Offer Submitted
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Status: {contract.jobOfferStatus || 'pending'}
                              </p>
                              {contract.jobOfferSignatureValid !== undefined && (
                                <p className="text-sm text-gray-600">
                                  Signature: {contract.jobOfferSignatureValid ? 'Valid' : 'Invalid/Missing'}
                                </p>
                              )}
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={contract.jobOfferSignedUrl} target="_blank">
                                <FileText className="h-4 w-4 mr-2" />
                                View Signed
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            {contract?.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{contract.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>Document Requirements:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>All documents must be in PDF format</li>
                    <li>Maximum file size: 10MB per document</li>
                    <li>Documents should be clear and legible</li>
                    <li>Signatures must be visible and valid</li>
                  </ul>
                  
                  <p className="mt-4"><strong>Processing Time:</strong></p>
                  <p className="ml-4">Documents are typically reviewed within 2-3 business days after upload.</p>
                  
                  <p className="mt-4"><strong>Questions?</strong></p>
                  <p className="ml-4">Contact your HR representative for assistance with document requirements.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}