import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Check, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ContractUploaderProps {
  userId: string;
  userDisplayName?: string;
  onUploadComplete?: () => void;
}

export function ContractUploader({ userId, userDisplayName, onUploadComplete }: ContractUploaderProps) {
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [jobOfferFile, setJobOfferFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'contract' | 'jobOffer') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'contract') {
        setContractFile(file);
      } else {
        setJobOfferFile(file);
      }
    }
  };

  const uploadContracts = async () => {
    if (!contractFile && !jobOfferFile) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      if (contractFile) {
        formData.append('contract', contractFile);
      }
      
      if (jobOfferFile) {
        formData.append('jobOffer', jobOfferFile);
      }

      const response = await fetch(`/api/admin/contracts/${userId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      toast({
        title: "Upload successful",
        description: "Contract files have been uploaded successfully",
      });

      // Reset form
      setContractFile(null);
      setJobOfferFile(null);
      
      // Reset file inputs
      const contractInput = document.getElementById('contract-file') as HTMLInputElement;
      const jobOfferInput = document.getElementById('job-offer-file') as HTMLInputElement;
      if (contractInput) contractInput.value = '';
      if (jobOfferInput) jobOfferInput.value = '';

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contracts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/contract/${userId}`] });
      
      onUploadComplete?.();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload contract files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Contract Documents
          {userDisplayName && <span className="text-sm text-gray-500">for {userDisplayName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="contract-file" className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              Company Contract
            </Label>
            <Input
              id="contract-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'contract')}
              disabled={isUploading}
            />
            {contractFile && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {contractFile.name} ({(contractFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="job-offer-file" className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              Job Offer Letter
            </Label>
            <Input
              id="job-offer-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'jobOffer')}
              disabled={isUploading}
            />
            {jobOfferFile && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {jobOfferFile.name} ({(jobOfferFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={uploadContracts}
            disabled={isUploading || (!contractFile && !jobOfferFile)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Upload Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Supported formats: PDF, DOC, DOCX</li>
                <li>Maximum file size: 10MB per file</li>
                <li>Files will be available for user to download and sign</li>
                <li>User can upload signed versions back to the system</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}