import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Upload, 
  Check, 
  Clock, 
  AlertCircle,
  FileSignature,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Info,
  Shield,
  Users,
  Building2
} from "lucide-react";

interface Contract {
  id: number;
  userId: string;
  companyContractOriginalUrl?: string;
  companyContractSignedUrl?: string;
  companyContractStatus: string;
  companyContractSignatureValid: boolean;
  jobOfferOriginalUrl?: string;
  jobOfferSignedUrl?: string;
  jobOfferStatus: string;
  jobOfferSignatureValid: boolean;
  notes?: string;
  lastUpdated: string;
  createdAt: string;
}

export function ContractManagement() {
  const [signedContractFile, setSignedContractFile] = useState<File | null>(null);
  const [signedJobOfferFile, setSignedJobOfferFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contractData, isLoading } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const contract = (contractData as any)?.contract as Contract | undefined;

  const uploadSignedDocumentsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/contracts/upload-signed', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Signed documents have been uploaded successfully",
      });
      
      // Reset form
      setSignedContractFile(null);
      setSignedJobOfferFile(null);
      
      // Reset file inputs
      const contractInput = document.getElementById('signed-contract-file') as HTMLInputElement;
      const jobOfferInput = document.getElementById('signed-job-offer-file') as HTMLInputElement;
      if (contractInput) contractInput.value = '';
      if (jobOfferInput) jobOfferInput.value = '';

      // Refresh contract data
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload signed documents. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'contract' | 'jobOffer') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'contract') {
        setSignedContractFile(file);
      } else {
        setSignedJobOfferFile(file);
      }
    }
  };

  const uploadSignedDocuments = async () => {
    if (!signedContractFile && !signedJobOfferFile) {
      toast({
        title: "No files selected",
        description: "Please select at least one signed document to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    
    if (signedContractFile) {
      formData.append('signedContract', signedContractFile);
    }
    
    if (signedJobOfferFile) {
      formData.append('signedJobOffer', signedJobOfferFile);
    }

    uploadSignedDocumentsMutation.mutate(formData);
    setIsUploading(false);
  };

  const getStatusBadge = (status: string, signatureValid?: boolean) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
            <Clock className="h-3 w-3 mr-1" />
            Awaiting Signature
          </Badge>
        );
      case 'signed':
        return (
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {signatureValid ? 'Verified' : 'Signed'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Available
          </Badge>
        );
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = 0;
    
    if (contract?.companyContractOriginalUrl) {
      total++;
      if (contract.companyContractStatus === 'signed') completed++;
    }
    
    if (contract?.jobOfferOriginalUrl) {
      total++;
      if (contract.jobOfferStatus === 'signed') completed++;
    }
    
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded w-full mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const hasDocuments = contract?.companyContractOriginalUrl || contract?.jobOfferOriginalUrl;

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      {hasDocuments && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Contract Completion Progress</h3>
                <p className="text-sm text-gray-600">Track your document signing progress</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{progress.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div 
                className={`absolute inset-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Download */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">Step 1</div>
                <div className="text-sm font-normal text-gray-600">Download Documents</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Download your contract documents to review and sign them.
            </p>
            <div className="space-y-3">
              {contract?.companyContractOriginalUrl ? (
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Company Contract</p>
                      <p className="text-xs text-gray-500">Employment agreement</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(contract.companyContractOriginalUrl!, 'company-contract.pdf')}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              ) : (
                <div className="p-3 border border-dashed rounded-lg text-center text-gray-400">
                  <Building2 className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs">Company contract pending</p>
                </div>
              )}

              {contract?.jobOfferOriginalUrl ? (
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Job Offer Letter</p>
                      <p className="text-xs text-gray-500">Position details</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(contract.jobOfferOriginalUrl!, 'job-offer.pdf')}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              ) : (
                <div className="p-3 border border-dashed rounded-lg text-center text-gray-400">
                  <Users className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs">Job offer pending</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Sign */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <FileSignature className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold">Step 2</div>
                <div className="text-sm font-normal text-gray-600">Sign Documents</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Review and sign your documents using digital signature or print & scan.
            </p>
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium mb-1">Signing Options:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      <li>Digital signature tools</li>
                      <li>Print, sign, and scan</li>
                      <li>Electronic signature apps</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {contract && (
                <div className="space-y-2">
                  {contract.companyContractOriginalUrl && (
                    <div className="flex items-center justify-between text-xs">
                      <span>Company Contract</span>
                      {getStatusBadge(contract.companyContractStatus, contract.companyContractSignatureValid)}
                    </div>
                  )}
                  {contract.jobOfferOriginalUrl && (
                    <div className="flex items-center justify-between text-xs">
                      <span>Job Offer Letter</span>
                      {getStatusBadge(contract.jobOfferStatus, contract.jobOfferSignatureValid)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Upload */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Step 3</div>
                <div className="text-sm font-normal text-gray-600">Upload Signed</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Upload your signed documents for review and processing.
            </p>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-800">
                    <p className="font-medium mb-1">Secure Upload:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      <li>PDF, DOC, DOCX (max 10MB)</li>
                      <li>Encrypted transmission</li>
                      <li>Automatic verification</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {(contract?.companyContractSignedUrl || contract?.jobOfferSignedUrl) && (
                <div className="space-y-2">
                  {contract.companyContractSignedUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Company contract submitted</span>
                    </div>
                  )}
                  {contract.jobOfferSignedUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Job offer submitted</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      {hasDocuments && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Upload Center</div>
                  <div className="text-sm font-normal text-gray-600">Submit your signed documents</div>
                </div>
              </div>
              {(contract?.companyContractSignedUrl || contract?.jobOfferSignedUrl) && (
                <Badge className="bg-green-100 text-green-800 text-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Documents Submitted
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Forms */}
            {((contract?.companyContractOriginalUrl && contract.companyContractStatus === 'pending') || 
              (contract?.jobOfferOriginalUrl && contract.jobOfferStatus === 'pending')) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Contract Upload */}
                {contract?.companyContractOriginalUrl && contract.companyContractStatus === 'pending' && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Company Contract</h4>
                        <p className="text-sm text-gray-500">Upload signed employment agreement</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signed-contract-file" className="text-sm font-medium text-gray-700">
                        Select signed document
                      </Label>
                      <Input
                        id="signed-contract-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'contract')}
                        disabled={isUploading}
                        className="cursor-pointer"
                      />
                      {signedContractFile && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{signedContractFile.name}</p>
                              <p className="text-xs text-green-600">{(signedContractFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Job Offer Upload */}
                {contract?.jobOfferOriginalUrl && contract.jobOfferStatus === 'pending' && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Job Offer Letter</h4>
                        <p className="text-sm text-gray-500">Upload signed position details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signed-job-offer-file" className="text-sm font-medium text-gray-700">
                        Select signed document
                      </Label>
                      <Input
                        id="signed-job-offer-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'jobOffer')}
                        disabled={isUploading}
                        className="cursor-pointer"
                      />
                      {signedJobOfferFile && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{signedJobOfferFile.name}</p>
                              <p className="text-xs text-green-600">{(signedJobOfferFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Action */}
            {((contract?.companyContractOriginalUrl && contract.companyContractStatus === 'pending') || 
              (contract?.jobOfferOriginalUrl && contract.jobOfferStatus === 'pending')) && (
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t">
                <Button 
                  onClick={uploadSignedDocuments}
                  disabled={isUploading || (!signedContractFile && !signedJobOfferFile)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-medium w-full sm:w-auto"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-5 w-5 mr-2 animate-spin" />
                      Uploading Documents...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Submit Signed Documents
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  <p>Files will be securely encrypted and processed</p>
                  <p className="text-xs">Maximum file size: 10MB each</p>
                </div>
              </div>
            )}

            {/* Submitted Documents Summary */}
            {(contract?.companyContractSignedUrl || contract?.jobOfferSignedUrl) && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Submitted Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contract?.companyContractSignedUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Company Contract</p>
                          <p className="text-sm text-green-600">✓ Submitted for review</p>
                        </div>
                        <Badge className="bg-green-200 text-green-800 text-xs">
                          Complete
                        </Badge>
                      </div>
                    </div>
                  )}

                  {contract?.jobOfferSignedUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Job Offer Letter</p>
                          <p className="text-sm text-green-600">✓ Submitted for review</p>
                        </div>
                        <Badge className="bg-green-200 text-green-800 text-xs">
                          Complete
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Documents Available State */}
      {!hasDocuments && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Documents Available</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                  Your contract documents haven't been uploaded by the admin yet. 
                  Please contact support if you're expecting documents to be available.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>Waiting for admin upload</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}