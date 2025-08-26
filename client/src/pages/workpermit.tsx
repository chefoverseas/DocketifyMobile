import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { ArrowLeft, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Building, MapPin } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

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
    const iconClass = "h-6 w-6";
    switch (status) {
      case "preparation":
        return <Clock className={`${iconClass} text-orange-500`} />;
      case "applied":
        return <FileText className={`${iconClass} text-blue-500`} />;
      case "awaiting_decision":
        return <AlertCircle className={`${iconClass} text-amber-500`} />;
      case "approved":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "rejected":
        return <XCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Clock className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "preparation":
        return {
          title: "Application in Preparation",
          description: "Our team is preparing your work permit application with all necessary documentation.",
          color: "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50",
          badgeColor: "bg-orange-100 text-orange-800 border-orange-200"
        };
      case "applied":
        return {
          title: "Application Submitted",
          description: "Your work permit application has been successfully submitted to the embassy. Final documents are available for download.",
          color: "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case "awaiting_decision":
        return {
          title: "Under Embassy Review",
          description: "Your application is currently under review by the embassy officials. We'll notify you once a decision is made.",
          color: "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
        };
      case "approved":
        return {
          title: "Work Permit Approved",
          description: "Congratulations! Your work permit has been approved by the embassy. You can proceed with your travel plans.",
          color: "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50",
          badgeColor: "bg-green-100 text-green-800 border-green-200"
        };
      case "rejected":
        return {
          title: "Application Not Approved",
          description: "Unfortunately, your work permit application was not approved. Please contact our support team for assistance and next steps.",
          color: "border-red-200 bg-gradient-to-r from-red-50 to-pink-50",
          badgeColor: "bg-red-100 text-red-800 border-red-200"
        };
      default:
        return {
          title: "Status Pending",
          description: "Your work permit application status will be updated here as it progresses.",
          color: "border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50",
          badgeColor: "bg-gray-100 text-gray-800 border-gray-200"
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading work permit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load work permit information. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(workPermit?.status || "preparation");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Work Permit Status</h1>
                <p className="text-gray-600 mt-1">Track your work authorization application progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Status Overview Card */}
          <Card className={`${statusInfo.color} border-2 hover:shadow-lg transition-all duration-300`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(workPermit?.status || "preparation")}
                  <div>
                    <CardTitle className="text-2xl text-gray-900">{statusInfo.title}</CardTitle>
                    <CardDescription className="text-gray-700 mt-2 text-base">
                      {statusInfo.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={`${statusInfo.badgeColor} px-4 py-2 text-sm font-medium`}>
                  {workPermit?.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Application Details */}
          <Card className="border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-6 w-6 mr-3 text-purple-500" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Application Created</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {workPermit?.createdAt ? format(new Date(workPermit.createdAt), 'PPP') : "Not available"}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {workPermit?.lastUpdated ? format(new Date(workPermit.lastUpdated), 'PPP') : "Not available"}
                  </p>
                </div>
              </div>

              {workPermit?.notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Additional Notes</span>
                  </div>
                  <p className="text-blue-800">{workPermit.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download Section */}
          {workPermit?.finalDocketUrl && (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Download className="h-6 w-6 mr-3 text-green-500" />
                  Final Documents Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Final Work Permit Documentation</h3>
                      <p className="text-gray-600 text-sm">Complete application package ready for download</p>
                    </div>
                  </div>
                  <Button 
                    asChild 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                  >
                    <a href={workPermit.finalDocketUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Building className="h-6 w-6 mr-3 text-amber-500" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workPermit?.status === "preparation" && (
                  <p className="text-gray-700 leading-relaxed">
                    Our team is currently preparing your work permit application. Once completed, it will be submitted to the embassy for review.
                  </p>
                )}
                {workPermit?.status === "applied" && (
                  <p className="text-gray-700 leading-relaxed">
                    Your application has been submitted to the embassy. You can download the final documents above. The embassy will review your application and provide a decision.
                  </p>
                )}
                {workPermit?.status === "awaiting_decision" && (
                  <p className="text-gray-700 leading-relaxed">
                    The embassy is currently reviewing your application. This process typically takes 2-4 weeks. We'll notify you immediately once a decision is made.
                  </p>
                )}
                {workPermit?.status === "approved" && (
                  <p className="text-gray-700 leading-relaxed">
                    Congratulations! Your work permit has been approved. You can now proceed with your visa application and travel preparations.
                  </p>
                )}
                {workPermit?.status === "rejected" && (
                  <p className="text-gray-700 leading-relaxed">
                    Please contact our support team at info@chefoverseas.com or +91 9363234028 to discuss next steps and possible reapplication options.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}