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
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Check, Clock, Minus, Save, CheckCircle, Briefcase, Download, FileText, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { Docket } from "@shared/schema";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

type WorkPermit = {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected";
  finalDocketUrl: string | null;
  notes: string | null;
  lastUpdated: string;
  createdAt: string;
};

export default function DocketPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: docketData, isLoading } = useQuery({
    queryKey: ["/api/docket"],
  });

  const { data: workPermitData, isLoading: workPermitLoading } = useQuery({
    queryKey: ["/api/workpermit"],
  });

  const docket: Docket | null = (docketData as any)?.docket || null;
  const workPermit: WorkPermit | null = (workPermitData as any)?.workPermit || null;

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

  if (isLoading || workPermitLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Calculate progress
  const sections = [
    { key: 'passportFrontUrl', completed: !!docket?.passportFrontUrl },
    { key: 'passportPhotoUrl', completed: !!docket?.passportPhotoUrl },
    { key: 'resumeUrl', completed: !!docket?.resumeUrl },
    { key: 'educationFiles', completed: (docket?.educationFiles as any)?.length > 0 },
    { key: 'experienceFiles', completed: (docket?.experienceFiles as any)?.length > 0 },
    { key: 'offerLetterUrl', completed: !!docket?.offerLetterUrl },
    { key: 'addressProofs', completed: !!docket?.permanentAddressUrl },
    { key: 'certifications', completed: (docket?.otherCertifications as any)?.length > 0 },
    { key: 'references', completed: (docket?.references as any)?.length >= 2 },
  ];
  
  const completedSections = sections.filter(s => s.completed).length;
  const progressPercentage = (completedSections / sections.length) * 100;

  const getWorkPermitStatusIcon = (status: string) => {
    switch (status) {
      case "preparation":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "applied":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "awaiting_decision":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getWorkPermitStatusDescription = (status: string) => {
    switch (status) {
      case "preparation":
        return "Your work permit application is being prepared by our team.";
      case "applied":
        return "Your work permit application has been submitted to the embassy. Final documents available for download.";
      case "awaiting_decision":
        return "Your application is under review by the embassy.";
      case "approved":
        return "Congratulations! Your work permit has been approved by the embassy.";
      case "rejected":
        return "Unfortunately, your work permit application was not approved.";
      default:
        return "Work permit status will be updated here.";
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <img src={chefOverseasLogo} alt="Chef Overseas" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Docket</h1>
                <p className="text-sm text-gray-600">Upload and manage your required documents</p>
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
                <h2 className="text-xl font-semibold text-gray-900">Document Upload Progress</h2>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{completedSections}</span> of{" "}
                  <span>{sections.length}</span> sections completed
                </div>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </CardContent>
          </Card>

      {/* Work Permit Status Card */}
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Work Permit Application</span>
                  {workPermit?.status && getWorkPermitStatusIcon(workPermit.status)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {workPermit?.status 
                    ? getWorkPermitStatusDescription(workPermit.status)
                    : "Work permit application will appear here once your docket is complete."
                  }
                </p>
              </div>
            </div>
            {workPermit?.status && (
              <WorkPermitStatusBadge status={workPermit.status} />
            )}
          </div>
        </CardHeader>
        {workPermit && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Application Date</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(workPermit.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(workPermit.lastUpdated), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Status</p>
                <WorkPermitStatusBadge status={workPermit.status} />
              </div>
            </div>
            
            {workPermit.finalDocketUrl && (workPermit.status === 'applied' || workPermit.status === 'awaiting_decision' || workPermit.status === 'approved') && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">Final Docket Available</h4>
                      <p className="text-sm text-blue-700">Your completed work permit application documents are ready for download.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.open(workPermit.finalDocketUrl!, '_blank')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Final Docket
                  </Button>
                </div>
              </div>
            )}

            {workPermit.notes && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Admin Notes</h4>
                <p className="text-sm text-blue-800">{workPermit.notes}</p>
              </div>
            )}
          </CardContent>
        )}
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
                  currentFile={docket?.passportFrontUrl || undefined}
                  onUpload={(fileData) => handleFileUpload('passportFrontUrl', (fileData as any).url)}
                  accept="image/*,application/pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Last Page</label>
                <FileUploader
                  currentFile={docket?.passportLastUrl || undefined}
                  onUpload={(fileData) => handleFileUpload('passportLastUrl', (fileData as any).url)}
                  accept="image/*,application/pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photo</label>
                <FileUploader
                  currentFile={docket?.passportPhotoUrl || undefined}
                  onUpload={(fileData) => handleFileUpload('passportPhotoUrl', (fileData as any).url)}
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
                currentFile={docket?.resumeUrl || undefined}
                onUpload={(fileData) => handleFileUpload('resumeUrl', (fileData as any).url)}
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
              currentFiles={(docket?.educationFiles as any) || []}
              onUpload={(files) => handleArrayFileUpload('educationFiles', files as any)}
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
              currentFiles={(docket?.experienceFiles as any) || []}
              onUpload={(files) => handleArrayFileUpload('experienceFiles', files as any)}
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
              currentFile={docket?.offerLetterUrl || undefined}
              onUpload={(fileData) => handleFileUpload('offerLetterUrl', (fileData as any).url)}
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
                  currentFile={docket?.permanentAddressUrl || undefined}
                  onUpload={(fileData) => handleFileUpload('permanentAddressUrl', (fileData as any).url)}
                  accept="image/*,application/pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address Proof</label>
                <FileUploader
                  currentFile={docket?.currentAddressUrl || undefined}
                  onUpload={(fileData) => handleFileUpload('currentAddressUrl', (fileData as any).url)}
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
              currentFiles={(docket?.otherCertifications as any) || []}
              onUpload={(files) => handleArrayFileUpload('otherCertifications', files as any)}
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionStatus((docket?.references as any)?.length >= 2).bg}`}>
                  {(() => {
                    const status = getSectionStatus((docket?.references as any)?.length >= 2);
                    const Icon = status.icon;
                    return <Icon className={`h-4 w-4 ${status.color}`} />;
                  })()}
                </div>
                <div>
                  <CardTitle>Professional References</CardTitle>
                  <p className="text-sm text-muted-foreground">Minimum 2 professional references required</p>
                </div>
              </div>
              <Badge className={getSectionStatus((docket?.references as any)?.length >= 2).badgeColor}>
                {getSectionStatus((docket?.references as any)?.length >= 2).badge} ({(docket?.references as any)?.length || 0}/2)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ReferenceForm
              references={(docket?.references as any) || []}
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
      </div>
    </div>
  );
}
