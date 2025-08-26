import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Building, MapPin, Plane } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

type WorkVisa = {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected";
  interviewDate: string | null;
  interviewTime: string | null;
  notes: string | null;
  lastUpdated: string;
  createdAt: string;
};

export default function WorkVisaPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/work-visa'],
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const workVisa = (data as any)?.workVisa as WorkVisa | undefined;

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
          title: "Visa Application in Preparation",
          description: "Our team is preparing your work visa application documents and scheduling embassy appointments.",
          color: "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50",
          badgeColor: "bg-orange-100 text-orange-800 border-orange-200"
        };
      case "applied":
        return {
          title: "Application Submitted",
          description: "Your work visa application has been submitted to the embassy. Please attend your scheduled interview.",
          color: "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case "awaiting_decision":
        return {
          title: "Under Embassy Review",
          description: "Your interview has been completed and the embassy is processing your visa application.",
          color: "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
        };
      case "approved":
        return {
          title: "Work Visa Approved",
          description: "Congratulations! Your work visa has been approved. You're now authorized to travel and work.",
          color: "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50",
          badgeColor: "bg-green-100 text-green-800 border-green-200"
        };
      case "rejected":
        return {
          title: "Visa Application Declined",
          description: "Your work visa application was not approved. Please contact our support team for guidance on next steps.",
          color: "border-red-200 bg-gradient-to-r from-red-50 to-pink-50",
          badgeColor: "bg-red-100 text-red-800 border-red-200"
        };
      default:
        return {
          title: "Status Pending",
          description: "Your work visa application status will be updated here as it progresses.",
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
          <p className="text-gray-600 font-medium">Loading work visa details...</p>
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
              Failed to load work visa information. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(workVisa?.status || "preparation");

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
                <h1 className="text-3xl font-bold text-gray-900">Work Visa Application</h1>
                <p className="text-gray-600 mt-1">Track your visa processing and interview schedule</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-2">
              <Plane className="h-4 w-4 mr-2" />
              Travel Authorization
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Status Overview Card */}
          <Card className={`${statusInfo.color} border-2 hover:shadow-lg transition-all duration-300`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(workVisa?.status || "preparation")}
                  <div>
                    <CardTitle className="text-2xl text-gray-900">{statusInfo.title}</CardTitle>
                    <CardDescription className="text-gray-700 mt-2 text-base">
                      {statusInfo.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={`${statusInfo.badgeColor} px-4 py-2 text-sm font-medium`}>
                  {workVisa?.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Interview Schedule */}
          {(workVisa?.interviewDate || workVisa?.interviewTime) && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="h-6 w-6 mr-3 text-blue-500" />
                  Embassy Interview Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {workVisa.interviewDate && (
                    <div className="p-4 bg-white/60 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700">Interview Date</span>
                      </div>
                      <p className="text-blue-900 font-semibold text-lg">
                        {format(new Date(workVisa.interviewDate), 'EEEE, MMMM do, yyyy')}
                      </p>
                    </div>
                  )}
                  {workVisa.interviewTime && (
                    <div className="p-4 bg-white/60 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700">Interview Time</span>
                      </div>
                      <p className="text-blue-900 font-semibold text-lg">
                        {workVisa.interviewTime}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-4 bg-blue-100/60 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Important Reminder</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Please arrive at the embassy 30 minutes before your scheduled interview time. Bring all required documents and your passport.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                    {workVisa?.createdAt ? format(new Date(workVisa.createdAt), 'PPP') : "Not available"}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {workVisa?.lastUpdated ? format(new Date(workVisa.lastUpdated), 'PPP') : "Not available"}
                  </p>
                </div>
              </div>

              {workVisa?.notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Additional Notes</span>
                  </div>
                  <p className="text-blue-800">{workVisa.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Plane className="h-6 w-6 mr-3 text-amber-500" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workVisa?.status === "preparation" && (
                  <p className="text-gray-700 leading-relaxed">
                    Our team is preparing your work visa application and will schedule an embassy interview appointment. You'll be notified once the interview date is confirmed.
                  </p>
                )}
                {workVisa?.status === "applied" && (workVisa.interviewDate || workVisa.interviewTime) && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Your visa application has been submitted. Please attend your scheduled embassy interview on the date and time shown above.
                    </p>
                    <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 font-medium text-sm">
                        📋 Bring required documents: Passport, work permit, job offer letter, and any additional documents requested by the embassy.
                      </p>
                    </div>
                  </div>
                )}
                {workVisa?.status === "awaiting_decision" && (
                  <p className="text-gray-700 leading-relaxed">
                    Your interview has been completed and the embassy is processing your visa application. This typically takes 1-2 weeks. We'll notify you immediately once a decision is made.
                  </p>
                )}
                {workVisa?.status === "approved" && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      🎉 Congratulations! Your work visa has been approved. You can now travel and begin working in your destination country.
                    </p>
                    <div className="p-3 bg-green-100 rounded-lg border border-green-200">
                      <p className="text-green-800 font-medium text-sm">
                        ✈️ Your visa is now ready for travel. Please check your passport for the visa stamp and note the validity dates.
                      </p>
                    </div>
                  </div>
                )}
                {workVisa?.status === "rejected" && (
                  <p className="text-gray-700 leading-relaxed">
                    Please contact our support team at info@chefoverseas.com or +91 9363234028 to discuss the reasons for rejection and explore reapplication options.
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