import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileUploader from "@/components/file-uploader";
import ReferenceForm from "@/components/reference-form";
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { 
  Check, 
  Clock, 
  Minus, 
  Save, 
  CheckCircle, 
  Briefcase, 
  Download, 
  FileText, 
  AlertCircle, 
  XCircle, 
  CheckCircle2,
  Upload,
  File,
  GraduationCap,
  MapPin,
  Building2,
  Users,
  Award,
  Shield,
  Info,
  Star,
  Target
} from "lucide-react";
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

  const handleSaveAsDraft = () => {
    // Update user to mark as having draft
    updateMutation.mutate({}, {
      onSuccess: () => {
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved as draft",
        });
      }
    });
  };

  const handleSubmitCompleteDocket = async () => {
    try {
      // Mark docket as completed and notify user
      await apiRequest("PATCH", "/api/profile", { docketCompleted: true });
      
      toast({
        title: "Docket Submitted Successfully",
        description: "Your complete docket has been submitted for review",
      });
      
      // Refresh data to show updated status
      queryClient.invalidateQueries({ queryKey: ["/api/docket"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit docket",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Modern Header with Glassmorphism */}
      <div className="relative bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center space-x-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/30">
                <img 
                  src={chefOverseasLogo} 
                  alt="Chef Overseas" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Document Docket
                </h1>
                <p className="text-gray-700 mt-2 text-lg font-medium">
                  Secure document collection and work permit processing
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Information Banner */}
        <div className="mb-8 bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="relative p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
            <div className="relative flex items-start gap-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Document Collection</h3>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Upload your required documents for work permit processing. All files are encrypted and securely stored using advanced security protocols.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Encrypted Storage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Auto-Save Progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Real-Time Validation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Progress Overview */}
        <div className="mb-8 bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="relative p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Document Collection Progress</h3>
                    <p className="text-gray-600 mt-1">Track your document upload completion</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {progressPercentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{completedSections} of {sections.length} complete</div>
                </div>
              </div>
              
              {/* Modern Progress Bar */}
              <div className="relative">
                <div className="h-4 bg-gray-200/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${
                      progressPercentage === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                      progressPercentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 
                      progressPercentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`} 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="absolute inset-0 h-4 rounded-full bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="mt-6 text-center">
                {progressPercentage === 100 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/50 backdrop-blur-sm rounded-full border border-green-200/50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-semibold">All documents collected! Ready for processing.</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/50 backdrop-blur-sm rounded-full border border-orange-200/50">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="text-orange-700 font-medium">Upload remaining documents to complete your docket</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Work Permit Status Card */}
        <div className="mb-8 bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="relative p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      Work Permit Application
                      {workPermit?.status && getWorkPermitStatusIcon(workPermit.status)}
                    </h3>
                    <p className="text-gray-600 mt-1 text-lg">
                      {workPermit?.status 
                        ? getWorkPermitStatusDescription(workPermit.status)
                        : "Work permit application will appear here once your docket is complete."
                      }
                    </p>
                  </div>
                </div>
                {workPermit?.status && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                    <WorkPermitStatusBadge status={workPermit.status} />
                  </div>
                )}
              </div>
              
              {workPermit && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <p className="text-sm font-medium text-gray-700 mb-2">Application Date</p>
                    <p className="text-gray-900 font-semibold">
                      {format(new Date(workPermit.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <p className="text-sm font-medium text-gray-700 mb-2">Last Updated</p>
                    <p className="text-gray-900 font-semibold">
                      {format(new Date(workPermit.lastUpdated), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                    <WorkPermitStatusBadge status={workPermit.status} />
                  </div>
                </div>
              )}
              
              {workPermit?.finalDocketUrl && (workPermit.status === 'applied' || workPermit.status === 'awaiting_decision' || workPermit.status === 'approved') && (
                <div className="mt-6 bg-blue-100/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">Final Docket Available</h4>
                        <p className="text-sm text-blue-700">Your completed work permit application documents are ready for download.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => window.open(workPermit.finalDocketUrl!, '_blank')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Final Docket
                    </Button>
                  </div>
                </div>
              )}

              {workPermit?.notes && (
                <div className="mt-6 bg-amber-100/50 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2">Admin Notes</h4>
                      <p className="text-amber-800">{workPermit.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Document Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step 1: Passport Section */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg overflow-hidden">
            <div className="relative p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <File className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold bg-blue-100/70 backdrop-blur-sm text-blue-700 px-3 py-1 rounded-full border border-blue-200/50">STEP 1</span>
                        <h4 className="text-xl font-bold text-gray-900">Passport Documents</h4>
                      </div>
                      <p className="text-gray-600">Upload your passport information and photo</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      className={`${getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl).badgeColor} text-xs backdrop-blur-sm`}
                    >
                      {getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl).badge}
                    </Badge>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl).bg} shadow-sm`}>
                      {(() => {
                        const status = getSectionStatus(!!docket?.passportFrontUrl && !!docket?.passportPhotoUrl);
                        const Icon = status.icon;
                        return <Icon className={`h-5 w-5 ${status.color}`} />;
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                      Passport Front Page *
                    </label>
                    <FileUploader
                      currentFile={docket?.passportFrontUrl || undefined}
                      onUpload={(fileData) => handleFileUpload('passportFrontUrl', (fileData as any).url)}
                      accept="image/*,application/pdf"
                      description="Upload the first page of your passport (PDF or image)"
                    />
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Passport Last Page</label>
                    <FileUploader
                      currentFile={docket?.passportLastUrl || undefined}
                      onUpload={(fileData) => handleFileUpload('passportLastUrl', (fileData as any).url)}
                      accept="image/*,application/pdf"
                      description="Upload the last page of your passport"
                    />
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                      Passport Photo *
                    </label>
                    <FileUploader
                      currentFile={docket?.passportPhotoUrl || undefined}
                      onUpload={(fileData) => handleFileUpload('passportPhotoUrl', (fileData as any).url)}
                      accept="image/*"
                      description="Upload a clear passport-style photo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Resume Section */}
          <Card className="h-fit">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">STEP 2</span>
                      <CardTitle className="text-lg">Resume / CV</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Upload your professional resume or curriculum vitae</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getSectionStatus(!!docket?.resumeUrl).badgeColor} text-xs`}>
                    {getSectionStatus(!!docket?.resumeUrl).badge}
                  </Badge>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.resumeUrl).bg}`}>
                    {(() => {
                      const status = getSectionStatus(!!docket?.resumeUrl);
                      const Icon = status.icon;
                      return <Icon className={`h-4 w-4 ${status.color}`} />;
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Resume / CV Document *</label>
                <FileUploader
                  currentFile={docket?.resumeUrl || undefined}
                  onUpload={(fileData) => handleFileUpload('resumeUrl', (fileData as any).url)}
                  accept=".pdf,.doc,.docx"
                  description="Upload your resume in PDF, DOC, or DOCX format"
                />
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Step 3: Education Section */}
          <Card className="h-fit">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">STEP 3</span>
                      <CardTitle className="text-lg">Education Documents</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Upload degrees, certificates, and transcripts</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getSectionStatus(!!docket?.educationFiles?.length).badgeColor} text-xs`}>
                    {getSectionStatus(!!docket?.educationFiles?.length).badge}
                  </Badge>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.educationFiles?.length).bg}`}>
                    {(() => {
                      const status = getSectionStatus(!!docket?.educationFiles?.length);
                      const Icon = status.icon;
                      return <Icon className={`h-4 w-4 ${status.color}`} />;
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Education Documents *
                  <span className="text-xs text-gray-500 ml-2">({(docket?.educationFiles as any)?.length || 0} files uploaded)</span>
                </label>
                <FileUploader
                  currentFiles={(docket?.educationFiles as any) || []}
                  onUpload={(files) => handleArrayFileUpload('educationFiles', files as any)}
                  multiple={true}
                  accept="image/*,application/pdf"
                  description="Upload diplomas, degrees, transcripts, and certificates"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Experience Section */}
          <Card className="h-fit">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">STEP 4</span>
                      <CardTitle className="text-lg">Experience Letters</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Upload employment verification letters</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getSectionStatus(!!docket?.experienceFiles?.length).badgeColor} text-xs`}>
                    {getSectionStatus(!!docket?.experienceFiles?.length).badge}
                  </Badge>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.experienceFiles?.length).bg}`}>
                    {(() => {
                      const status = getSectionStatus(!!docket?.experienceFiles?.length);
                      const Icon = status.icon;
                      return <Icon className={`h-4 w-4 ${status.color}`} />;
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Experience Letters *
                  <span className="text-xs text-gray-500 ml-2">({(docket?.experienceFiles as any)?.length || 0} files uploaded)</span>
                </label>
                <FileUploader
                  currentFiles={(docket?.experienceFiles as any) || []}
                  onUpload={(files) => handleArrayFileUpload('experienceFiles', files as any)}
                  multiple={true}
                  accept="image/*,application/pdf"
                  description="Upload letters from previous employers and references"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Step 5: Offer Letter Section */}
          <Card className="h-fit">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">STEP 5</span>
                      <CardTitle className="text-lg">Job Offer Letter</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Upload your current job offer letter</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getSectionStatus(!!docket?.offerLetterUrl).badgeColor} text-xs`}>
                    {getSectionStatus(!!docket?.offerLetterUrl).badge}
                  </Badge>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.offerLetterUrl).bg}`}>
                    {(() => {
                      const status = getSectionStatus(!!docket?.offerLetterUrl);
                      const Icon = status.icon;
                      return <Icon className={`h-4 w-4 ${status.color}`} />;
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Job Offer Letter *</label>
                <FileUploader
                  currentFile={docket?.offerLetterUrl || undefined}
                  onUpload={(fileData) => handleFileUpload('offerLetterUrl', (fileData as any).url)}
                  accept="image/*,application/pdf"
                  description="Upload your signed job offer from the employer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 6: Address Proof Section */}
          <Card className="h-fit">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-1 rounded-full">STEP 6</span>
                      <CardTitle className="text-lg">Address Proofs</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Upload permanent and current address documents</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getSectionStatus(!!docket?.permanentAddressUrl).badgeColor} text-xs`}>
                    {getSectionStatus(!!docket?.permanentAddressUrl).badge}
                  </Badge>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.permanentAddressUrl).bg}`}>
                    {(() => {
                      const status = getSectionStatus(!!docket?.permanentAddressUrl);
                      const Icon = status.icon;
                      return <Icon className={`h-4 w-4 ${status.color}`} />;
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Permanent Address Proof *</label>
                  <FileUploader
                    currentFile={docket?.permanentAddressUrl || undefined}
                    onUpload={(fileData) => handleFileUpload('permanentAddressUrl', (fileData as any).url)}
                    accept="image/*,application/pdf"
                    description="Utility bill, bank statement, or lease agreement"
                  />
                </div>
                <Separator />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Current Address Proof</label>
                  <FileUploader
                    currentFile={docket?.currentAddressUrl || undefined}
                    onUpload={(fileData) => handleFileUpload('currentAddressUrl', (fileData as any).url)}
                    accept="image/*,application/pdf"
                    description="Current utility bill or rental agreement"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Step 7: Other Certifications Section */}
          <Card className="h-fit">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">STEP 7</span>
                      <CardTitle className="text-lg">Additional Certifications</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Professional certifications and licenses (optional)</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getSectionStatus(!!docket?.otherCertifications?.length, true).badgeColor} text-xs`}>
                    {getSectionStatus(!!docket?.otherCertifications?.length, true).badge}
                  </Badge>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSectionStatus(!!docket?.otherCertifications?.length, true).bg}`}>
                    {(() => {
                      const status = getSectionStatus(!!docket?.otherCertifications?.length, true);
                      const Icon = status.icon;
                      return <Icon className={`h-4 w-4 ${status.color}`} />;
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Professional Certifications
                  <span className="text-xs text-gray-500 ml-2">({(docket?.otherCertifications as any)?.length || 0} files uploaded)</span>
                </label>
                <FileUploader
                  currentFiles={(docket?.otherCertifications as any) || []}
                  onUpload={(files) => handleArrayFileUpload('otherCertifications', files as any)}
                  multiple={true}
                  accept="image/*,application/pdf"
                  description="Trade licenses, professional certifications, language certificates"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 8: References Section */}
          <Card className="h-fit">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">STEP 8</span>
                      <CardTitle className="text-lg">Professional References</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Minimum 2 professional references required</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getSectionStatus((docket?.references as any)?.length >= 2).badgeColor} text-xs`}>
                    {getSectionStatus((docket?.references as any)?.length >= 2).badge} ({(docket?.references as any)?.length || 0}/2)
                  </Badge>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSectionStatus((docket?.references as any)?.length >= 2).bg}`}>
                    {(() => {
                      const status = getSectionStatus((docket?.references as any)?.length >= 2);
                      const Icon = status.icon;
                      return <Icon className={`h-4 w-4 ${status.color}`} />;
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ReferenceForm
                references={(docket?.references as any) || []}
                onUpdate={handleReferencesUpdate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="mt-12 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Submit?</h3>
              <p className="text-gray-600">
                {progressPercentage === 100 
                  ? "All sections completed! Submit your docket for review." 
                  : `Complete ${Math.ceil((sections.length - completedSections) * 100 / sections.length)}% more to submit your docket.`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 h-12 border-2 hover:bg-gray-50"
                disabled={updateMutation.isPending}
                onClick={handleSaveAsDraft}
              >
                <Save className="w-5 h-5 mr-2" />
                Save Progress
              </Button>
              <Button 
                size="lg"
                className={`flex-1 h-12 ${
                  completedSections >= 6 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={updateMutation.isPending || completedSections < 6}
                onClick={handleSubmitCompleteDocket}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Docket ({completedSections}/{sections.length})
              </Button>
            </div>

            {completedSections < 6 && (
              <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 text-sm">
                  <Info className="h-4 w-4" />
                  <span>Complete at least 6 sections to submit your docket for review.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
