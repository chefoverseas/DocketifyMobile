import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileUploader from "@/components/file-uploader";
import ReferenceForm from "@/components/reference-form";
import { Check, Clock, Minus, Save, CheckCircle } from "lucide-react";
import type { Docket } from "@shared/schema";

export default function DocketPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: docketData, isLoading } = useQuery({
    queryKey: ["/api/docket"],
  });

  const docket: Docket | null = docketData?.docket || null;

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Docket>) => {
      const res = await apiRequest("PATCH", "/api/docket", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docket"] });
      toast({
        title: "Success",
        description: "Docket updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update docket",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (field: keyof Docket, fileData: any) => {
    updateMutation.mutate({ [field]: fileData });
  };

  const handleArrayFileUpload = (field: keyof Docket, files: any[]) => {
    updateMutation.mutate({ [field]: files });
  };

  const handleReferencesUpdate = (references: any[]) => {
    updateMutation.mutate({ references });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Calculate progress
  const sections = [
    { key: 'passportFrontUrl', completed: !!docket?.passportFrontUrl },
    { key: 'passportPhotoUrl', completed: !!docket?.passportPhotoUrl },
    { key: 'resumeUrl', completed: !!docket?.resumeUrl },
    { key: 'educationFiles', completed: docket?.educationFiles?.length > 0 },
    { key: 'experienceFiles', completed: docket?.experienceFiles?.length > 0 },
    { key: 'offerLetterUrl', completed: !!docket?.offerLetterUrl },
    { key: 'addressProofs', completed: !!docket?.permanentAddressUrl },
    { key: 'certifications', completed: docket?.otherCertifications?.length > 0 },
    { key: 'references', completed: docket?.references?.length >= 2 },
  ];
  
  const completedSections = sections.filter(s => s.completed).length;
  const progressPercentage = (completedSections / sections.length) * 100;

  const getSectionStatus = (isCompleted: boolean, isOptional = false) => {
    if (isCompleted) {
      return { icon: Check, color: "text-green-600", bg: "bg-green-100", badge: "Complete", badgeColor: "bg-green-100 text-green-800" };
    } else if (isOptional) {
      return { icon: Minus, color: "text-gray-400", bg: "bg-gray-100", badge: "Optional", badgeColor: "bg-gray-100 text-gray-800" };
    } else {
      return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", badge: "Pending", badgeColor: "bg-yellow-100 text-yellow-800" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Progress Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Document Docket</h1>
            <div className="text-sm text-gray-500">
              <span className="font-medium">{completedSections}</span> of{" "}
              <span>{sections.length}</span> sections completed
            </div>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Passport Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl).bg}`}>
                  {(() => {
                    const status = getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Passport Information</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload passport pages and photo</p>
                </div>
              </div>
              <Badge className={getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl).badgeColor}>
                {getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl).badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Front Page</label>
                <FileUploader
                  currentFile={docket?.passportFrontUrl}
                  onUpload={(fileData) => handleFileUpload('passportFrontUrl', fileData.url)}
                  accept="image/*,application/pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Last Page</label>
                <FileUploader
                  currentFile={docket?.passportLastUrl}
                  onUpload={(fileData) => handleFileUpload('passportLastUrl', fileData.url)}
                  accept="image/*,application/pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photo</label>
                <FileUploader
                  currentFile={docket?.passportPhotoUrl}
                  onUpload={(fileData) => handleFileUpload('passportPhotoUrl', fileData.url)}
                  accept="image/*"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.resumeUrl).bg}`}>
                  {(() => {
                    const status = getSectionStatus(!!docket?.resumeUrl);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Resume / CV</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload your current resume or curriculum vitae</p>
                </div>
              </div>
              <Badge className={getSectionStatus(!!docket?.resumeUrl).badgeColor}>
                {getSectionStatus(!!docket?.resumeUrl).badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume / CV Document</label>
              <FileUploader
                currentFile={docket?.resumeUrl}
                onUpload={(fileData) => handleFileUpload('resumeUrl', fileData.url)}
                accept=".pdf,.doc,.docx"
                description="Upload your resume in PDF, DOC, or DOCX format"
              />
            </div>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.educationFiles?.length).bg}`}>
                  {(() => {
                    const status = getSectionStatus(!!docket?.educationFiles?.length);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Education Documents</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload degrees, certificates, and transcripts</p>
                </div>
              </div>
              <Badge className={getSectionStatus(!!docket?.educationFiles?.length).badgeColor}>
                {getSectionStatus(!!docket?.educationFiles?.length).badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FileUploader
              currentFiles={docket?.educationFiles || []}
              onUpload={(files) => handleArrayFileUpload('educationFiles', files)}
              multiple={true}
              accept="image/*,application/pdf"
            />
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.experienceFiles?.length).bg}`}>
                  {(() => {
                    const status = getSectionStatus(!!docket?.experienceFiles?.length);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Experience Letters</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload employment verification letters</p>
                </div>
              </div>
              <Badge className={getSectionStatus(!!docket?.experienceFiles?.length).badgeColor}>
                {getSectionStatus(!!docket?.experienceFiles?.length).badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FileUploader
              currentFiles={docket?.experienceFiles || []}
              onUpload={(files) => handleArrayFileUpload('experienceFiles', files)}
              multiple={true}
              accept="image/*,application/pdf"
            />
          </CardContent>
        </Card>

        {/* Offer Letter Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.offerLetterUrl).bg}`}>
                  {(() => {
                    const status = getSectionStatus(!!docket?.offerLetterUrl);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Offer Letter</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload your current job offer letter</p>
                </div>
              </div>
              <Badge className={getSectionStatus(!!docket?.offerLetterUrl).badgeColor}>
                {getSectionStatus(!!docket?.offerLetterUrl).badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FileUploader
              currentFile={docket?.offerLetterUrl}
              onUpload={(fileData) => handleFileUpload('offerLetterUrl', fileData.url)}
              accept="image/*,application/pdf"
            />
          </CardContent>
        </Card>

        {/* Address Proof Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.permanentAddressUrl).bg}`}>
                  {(() => {
                    const status = getSectionStatus(!!docket?.permanentAddressUrl);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Address Proofs</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload permanent and current address proofs</p>
                </div>
              </div>
              <Badge className={getSectionStatus(!!docket?.permanentAddressUrl).badgeColor}>
                {getSectionStatus(!!docket?.permanentAddressUrl).badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address Proof</label>
                <FileUploader
                  currentFile={docket?.permanentAddressUrl}
                  onUpload={(fileData) => handleFileUpload('permanentAddressUrl', fileData.url)}
                  accept="image/*,application/pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address Proof</label>
                <FileUploader
                  currentFile={docket?.currentAddressUrl}
                  onUpload={(fileData) => handleFileUpload('currentAddressUrl', fileData.url)}
                  accept="image/*,application/pdf"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Certifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.otherCertifications?.length, true).bg}`}>
                  {(() => {
                    const status = getSectionStatus(!!docket?.otherCertifications?.length, true);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Other Certifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Professional certifications and licenses (optional)</p>
                </div>
              </div>
              <Badge className={getSectionStatus(!!docket?.otherCertifications?.length, true).badgeColor}>
                {getSectionStatus(!!docket?.otherCertifications?.length, true).badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FileUploader
              currentFiles={docket?.otherCertifications || []}
              onUpload={(files) => handleArrayFileUpload('otherCertifications', files)}
              multiple={true}
              accept="image/*,application/pdf"
            />
          </CardContent>
        </Card>

        {/* References Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus(docket?.references?.length >= 2).bg}`}>
                  {(() => {
                    const status = getSectionStatus(docket?.references?.length >= 2);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Professional References</CardTitle>
                  <p className="text-sm text-muted-foreground">Minimum 2 professional references required</p>
                </div>
              </div>
              <Badge className={getSectionStatus(docket?.references?.length >= 2).badgeColor}>
                {getSectionStatus(docket?.references?.length >= 2).badge} ({docket?.references?.length || 0}/2)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ReferenceForm
              references={docket?.references || []}
              onUpdate={handleReferencesUpdate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="outline" 
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              className="flex-1"
              disabled={updateMutation.isPending || completedSections < 6} // Require at least 6/8 sections
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Complete Docket
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
