import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Upload, 
  Check, 
  Clock, 
  AlertCircle,
  FileSignature,
  ExternalLink
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-300"><Clock className="h-3 w-3 mr-1" />Pending Signature</Badge>;
      case 'signed':
        return <Badge variant="outline" className="text-green-600 border-green-300"><Check className="h-3 w-3 mr-1" />Signed</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600"><AlertCircle className="h-3 w-3 mr-1" />Not Available</Badge>;
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Contract Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contract?.companyContractOriginalUrl ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Company Contract</p>
                  <p className="text-sm text-gray-500">Original document for signing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(contract.companyContractStatus)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(contract.companyContractOriginalUrl!, 'company-contract.pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No company contract available</p>
            </div>
          )}

          {contract?.jobOfferOriginalUrl ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Job Offer Letter</p>
                  <p className="text-sm text-gray-500">Original document for signing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(contract.jobOfferStatus)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(contract.jobOfferOriginalUrl!, 'job-offer.pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No job offer letter available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Signed Documents */}
      {(contract?.companyContractOriginalUrl || contract?.jobOfferOriginalUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Upload Signed Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {contract?.companyContractOriginalUrl && contract.companyContractStatus === 'pending' && (
                <div>
                  <Label htmlFor="signed-contract-file" className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Signed Company Contract
                  </Label>
                  <Input
                    id="signed-contract-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'contract')}
                    disabled={isUploading}
                  />
                  {signedContractFile && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      {signedContractFile.name} ({(signedContractFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              )}

              {contract?.jobOfferOriginalUrl && contract.jobOfferStatus === 'pending' && (
                <div>
                  <Label htmlFor="signed-job-offer-file" className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Signed Job Offer Letter
                  </Label>
                  <Input
                    id="signed-job-offer-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'jobOffer')}
                    disabled={isUploading}
                  />
                  {signedJobOfferFile && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      {signedJobOfferFile.name} ({(signedJobOfferFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button 
              onClick={uploadSignedDocuments}
              disabled={isUploading || (!signedContractFile && !signedJobOfferFile)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Signed Documents
                </>
              )}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Digital Signature Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Download the original documents above</li>
                    <li>Sign the documents digitally or print, sign, and scan</li>
                    <li>Upload the signed versions here</li>
                    <li>Supported formats: PDF, DOC, DOCX (max 10MB each)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signed Documents Status */}
      {(contract?.companyContractSignedUrl || contract?.jobOfferSignedUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Submitted Signed Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contract?.companyContractSignedUrl && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Signed Company Contract</p>
                    <p className="text-sm text-gray-500">Submitted for review</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Submitted
                </Badge>
              </div>
            )}

            {contract?.jobOfferSignedUrl && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Signed Job Offer Letter</p>
                    <p className="text-sm text-gray-500">Submitted for review</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Submitted
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}