import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { Download, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
    queryKey: ['/api/workpermit'],
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
        return "Your work permit application has been submitted to the embassy.";
      case "awaiting_decision":
        return "Your application is under review by the embassy. Please wait for their decision.";
      case "approved":
        return "Congratulations! Your work permit has been approved. You can download your final documents below.";
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Work Permit Status</h1>
        <p className="text-gray-600 mt-2">
          Track your work permit application progress and download approved documents
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon(workPermit?.status || "preparation")}
              Current Status
            </CardTitle>
            <CardDescription>
              Last updated: {workPermit?.lastUpdated ? format(new Date(workPermit.lastUpdated), 'PPP p') : 'Not available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <WorkPermitStatusBadge status={workPermit?.status || "preparation"} />
              </div>
            </div>
            <Separator />
            <p className="text-gray-700">
              {getStatusDescription(workPermit?.status || "preparation")}
            </p>
            {workPermit?.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-gray-700">{workPermit.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>Track your work permit application progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${workPermit?.status === "preparation" || workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved" || workPermit?.status === "rejected" ? "bg-green-500" : "bg-gray-300"}`}></div>
                <div>
                  <p className="font-medium">Preparation</p>
                  <p className="text-sm text-gray-600">Application documents are being prepared</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved" ? "bg-green-500" : "bg-gray-300"}`}></div>
                <div>
                  <p className="font-medium">Applied</p>
                  <p className="text-sm text-gray-600">Application submitted to embassy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${workPermit?.status === "awaiting_decision" || workPermit?.status === "approved" ? "bg-yellow-500" : workPermit?.status === "rejected" ? "bg-red-500" : "bg-gray-300"}`}></div>
                <div>
                  <p className="font-medium">Embassy Review</p>
                  <p className="text-sm text-gray-600">Application under embassy evaluation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${workPermit?.status === "approved" ? "bg-green-500" : workPermit?.status === "rejected" ? "bg-red-500" : "bg-gray-300"}`}></div>
                <div>
                  <p className="font-medium">Decision</p>
                  <p className="text-sm text-gray-600">
                    {workPermit?.status === "approved" ? "Application approved!" : 
                     workPermit?.status === "rejected" ? "Application rejected" : 
                     "Awaiting embassy decision"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        {workPermit?.status === "approved" && workPermit?.finalDocketUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                Final Documents
              </CardTitle>
              <CardDescription>
                Your approved work permit documents are ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Final Work Permit Docket</p>
                      <p className="text-sm text-green-700">Approved work permit and supporting documents</p>
                    </div>
                  </div>
                  <Button asChild>
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

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact our support team for assistance with your work permit application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" asChild>
                <a href="mailto:support@chefoverseas.com">
                  Email Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+1234567890">
                  Call Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}