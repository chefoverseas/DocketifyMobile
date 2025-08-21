import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Download, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
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

export default function WorkPermitPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/work-permit'],
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const workPermit = (data as any)?.workPermit as WorkPermit | undefined;

  const getStatusIcon = (status: string) => {
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "preparation":
        return "Your work permit application is being prepared by our team.";
      case "applied":
        return "Your work permit application has been submitted to the embassy. Final documents available for download.";
      case "awaiting_decision":
        return "Your application is under review by the embassy. Please wait for their decision.";
      case "approved":
        return "Congratulations! Your work permit has been approved by the embassy.";
      case "rejected":
        return "Unfortunately, your work permit application was not approved. Please contact our support team for assistance.";
      default:
        return "Your work permit application status will be updated here.";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load work permit status. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <img src={chefOverseasLogo} alt="Chef Overseas" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Work Permit Status</h1>
                <p className="text-sm text-gray-600">Track your application progress and download documents</p>
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

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                {getStatusIcon(workPermit?.status || "preparation")}
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">Current Status</p>
                  <div className="mt-1">
                    <WorkPermitStatusBadge status={workPermit?.status || "preparation"} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Application ID</p>
                  <p className="text-lg font-bold text-green-900">
                    {workPermit?.id ? `WP-${workPermit.id.toString().padStart(6, '0')}` : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-800">Last Updated</p>
                  <p className="text-lg font-bold text-purple-900">
                    {workPermit?.lastUpdated ? format(new Date(workPermit.lastUpdated), 'MMM dd, yyyy') : 'Not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Status Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              {getStatusIcon(workPermit?.status || "preparation")}
              Work Permit Application Status
            </CardTitle>
            <CardDescription className="text-orange-100">
              Track your application progress through each stage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Current Status Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {getStatusDescription(workPermit?.status || "preparation")}
                </p>
              </div>
              
              {workPermit?.notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Additional Notes</h4>
                  <p className="text-blue-800">{workPermit.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Application Timeline
            </CardTitle>
            <CardDescription>Follow your work permit application through each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 h-full w-px bg-gray-200"></div>
              
              <div className="space-y-8">
                {/* Step 1: Preparation */}
                <div className="relative flex items-start space-x-4">
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 ${
                    workPermit?.status ? "bg-green-500 border-green-500" : "bg-gray-300 border-gray-300"
                  }`}>
                    <FileText className={`h-5 w-5 ${workPermit?.status ? "text-white" : "text-gray-500"}`} />
                  </div>
                  <div className="min-h-[3rem] flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-900">Document Preparation</h4>
                    <p className="text-sm text-gray-600">Your documents are being prepared and reviewed by our team</p>
                    <p className="text-xs text-gray-400 mt-1">Status: {workPermit?.status ? "Complete" : "In Progress"}</p>
                  </div>
                </div>
                
                {/* Step 2: Application Submission */}
                <div className="relative flex items-start space-x-4">
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 ${
                    workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved" 
                    ? "bg-blue-500 border-blue-500" : "bg-gray-300 border-gray-300"
                  }`}>
                    <CheckCircle className={`h-5 w-5 ${
                      workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved"
                      ? "text-white" : "text-gray-500"
                    }`} />
                  </div>
                  <div className="min-h-[3rem] flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-900">Application Submitted</h4>
                    <p className="text-sm text-gray-600">Application submitted to the relevant embassy or authority</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Status: {workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved" ? "Complete" : "Pending"}
                    </p>
                  </div>
                </div>
                
                {/* Step 3: Embassy Review */}
                <div className="relative flex items-start space-x-4">
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 ${
                    workPermit?.status === "awaiting_decision" || workPermit?.status === "approved" 
                    ? "bg-yellow-500 border-yellow-500" 
                    : workPermit?.status === "rejected" 
                    ? "bg-red-500 border-red-500"
                    : "bg-gray-300 border-gray-300"
                  }`}>
                    <AlertCircle className={`h-5 w-5 ${
                      workPermit?.status === "awaiting_decision" || workPermit?.status === "approved" 
                      ? "text-white" 
                      : workPermit?.status === "rejected"
                      ? "text-white"
                      : "text-gray-500"
                    }`} />
                  </div>
                  <div className="min-h-[3rem] flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-900">Embassy Review</h4>
                    <p className="text-sm text-gray-600">Your application is under review by embassy officials</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Status: {
                        workPermit?.status === "awaiting_decision" ? "Under Review" : 
                        workPermit?.status === "approved" ? "Complete" :
                        workPermit?.status === "rejected" ? "Reviewed" :
                        "Pending"
                      }
                    </p>
                  </div>
                </div>
                
                {/* Step 4: Final Decision */}
                <div className="relative flex items-start space-x-4">
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 ${
                    workPermit?.status === "approved" 
                    ? "bg-green-500 border-green-500" 
                    : workPermit?.status === "rejected" 
                    ? "bg-red-500 border-red-500"
                    : "bg-gray-300 border-gray-300"
                  }`}>
                    {workPermit?.status === "approved" ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : workPermit?.status === "rejected" ? (
                      <XCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="min-h-[3rem] flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-900">Final Decision</h4>
                    <p className="text-sm text-gray-600">
                      {workPermit?.status === "approved" ? "Congratulations! Your work permit has been approved" : 
                       workPermit?.status === "rejected" ? "Application was not approved - contact support for assistance" : 
                       "Awaiting final decision from embassy"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Status: {
                        workPermit?.status === "approved" ? "Approved ✓" :
                        workPermit?.status === "rejected" ? "Rejected" :
                        "Awaiting Decision"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Download Section */}
        {workPermit?.finalDocketUrl && (workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved") && (
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <Download className="h-5 w-5" />
                Download Documents
              </CardTitle>
              <CardDescription className="text-green-100">
                Your work permit application documents are ready
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Final Work Permit Docket</p>
                      <p className="text-sm text-green-700">Complete application package with all supporting documents</p>
                      <p className="text-xs text-green-600 mt-1">Ready for embassy submission</p>
                    </div>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700" asChild>
                    <a href={workPermit.finalDocketUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Need Assistance?
            </CardTitle>
            <CardDescription>
              Our support team is here to help with your work permit application
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Email Support</h4>
                <p className="text-sm text-blue-700 mb-3">Get help via email with detailed responses</p>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
                  <a href="mailto:info@chefoverseas.com">
                    Email Us
                  </a>
                </Button>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">Phone Support</h4>
                <p className="text-sm text-orange-700 mb-3">Speak directly with our support team</p>
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
                  <a href="tel:+1234567890">
                    Call Now
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}