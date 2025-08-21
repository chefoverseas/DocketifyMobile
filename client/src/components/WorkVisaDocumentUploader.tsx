import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Check, X, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type DocumentType = {
  key: string;
  label: string;
  description: string;
};

const DOCUMENT_TYPES: DocumentType[] = [
  {
    key: "irlApplicationForm",
    label: "IRL Application Form",
    description: "Ireland residence permit application form"
  },
  {
    key: "visaAppointment",
    label: "Visa Appointment",
    description: "Visa appointment confirmation"
  },
  {
    key: "vfsVisaPayment",
    label: "VFS Visa Payment",
    description: "VFS visa application payment receipt"
  },
  {
    key: "visaCoverLetter",
    label: "Visa Cover Letter",
    description: "Cover letter for visa application"
  },
  {
    key: "visaInviteLetter",
    label: "Visa Invite Letter",
    description: "Invitation letter for visa application"
  },
  {
    key: "supplementaryEmploymentApplication",
    label: "Supplementary Employment Application Form",
    description: "Additional employment application documents"
  },
  {
    key: "irelandVacChecklist",
    label: "Ireland VAC Checklist",
    description: "Ireland Visa Application Center checklist"
  },
  {
    key: "travelMedicalInsurance",
    label: "Travel & Medical Insurance",
    description: "Travel and medical insurance documentation"
  },
  {
    key: "fullDocketVisaSubmission",
    label: "Full Docket for Visa Submission",
    description: "Complete docket package for visa submission"
  }
];

interface WorkVisaDocumentUploaderProps {
  userId: string;
  workVisa: any;
  onUploadSuccess?: () => void;
}

export function WorkVisaDocumentUploader({ userId, workVisa, onUploadSuccess }: WorkVisaDocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const response = await fetch(`/api/admin/workvisa/${userId}/upload-documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Document uploaded successfully",
        description: `${data.documentType} has been uploaded.`,
      });
      setSelectedFile(null);
      setSelectedDocumentType("");
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workvisas'] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/workvisa/${userId}`] });
      onUploadSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedDocumentType) {
      toast({
        title: "Missing information",
        description: "Please select both a file and document type",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ file: selectedFile, documentType: selectedDocumentType });
  };

  const getDocumentUrl = (documentType: string) => {
    if (!workVisa) return null;
    
    const urlMap: Record<string, string> = {
      irlApplicationForm: workVisa.irlApplicationFormUrl,
      visaAppointment: workVisa.visaAppointmentUrl,
      vfsVisaPayment: workVisa.vfsVisaPaymentUrl,
      visaCoverLetter: workVisa.visaCoverLetterUrl,
      visaInviteLetter: workVisa.visaInviteLetterUrl,
      supplementaryEmploymentApplication: workVisa.supplementaryEmploymentApplicationUrl,
      irelandVacChecklist: workVisa.irelandVacChecklistUrl,
      travelMedicalInsurance: workVisa.travelMedicalInsuranceUrl,
      fullDocketVisaSubmission: workVisa.fullDocketVisaSubmissionUrl,
    };

    return urlMap[documentType];
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Work Visa Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <select
              id="documentType"
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select document type...</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="file">Choose File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="mt-1"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !selectedDocumentType || uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
          </Button>
        </CardContent>
      </Card>

      {/* Document Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_TYPES.map((docType) => {
              const url = getDocumentUrl(docType.key);
              const isUploaded = !!url;

              return (
                <div
                  key={docType.key}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {isUploaded ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="font-medium text-sm">{docType.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{docType.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isUploaded ? "default" : "secondary"}>
                      {isUploaded ? "Uploaded" : "Pending"}
                    </Badge>
                    {isUploaded && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}