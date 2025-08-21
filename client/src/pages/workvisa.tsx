import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, FileText, AlertCircle, CheckCircle, XCircle, Calendar, MapPin, Download, Plane, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WorkVisa {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected" | "interview_scheduled";
  trackingCode: string | null;
  applicationDate: string | null;
  interviewDate: string | null;
  visaType: string | null;
  embassyLocation: string | null;
  finalVisaUrl: string | null;
  notes: string | null;
  lastUpdated: string;
  createdAt: string;
}

export default function WorkVisaPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ visaType: "", embassyLocation: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/work-visa'],
  });

  const workVisa = (data as { workVisa: WorkVisa | null })?.workVisa || null;

  // Update mutation
  const updateWorkVisaMutation = useMutation({
    mutationFn: async (updateData: { visaType: string; embassyLocation: string }) => {
      const response = await fetch('/api/work-visa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update work visa');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-visa'] });
      setIsEditing(false);
      toast({
        title: "Updated Successfully",
        description: "Your work visa details have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update work visa details. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize edit data when work visa is loaded
  useEffect(() => {
    if (workVisa && !isEditing) {
      setEditData({
        visaType: workVisa.visaType || "",
        embassyLocation: workVisa.embassyLocation || "",
      });
    }
  }, [workVisa, isEditing]);

  const handleEdit = () => {
    setEditData({
      visaType: workVisa?.visaType || "",
      embassyLocation: workVisa?.embassyLocation || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editData.visaType.trim() || !editData.embassyLocation.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both visa type and embassy location.",
        variant: "destructive",
      });
      return;
    }
    updateWorkVisaMutation.mutate(editData);
  };

  const handleCancel = () => {
    setEditData({
      visaType: workVisa?.visaType || "",
      embassyLocation: workVisa?.embassyLocation || "",
    });
    setIsEditing(false);
  };

  // Predefined visa types and embassy locations for dropdowns
  const visaTypes = [
    "Critical Skills Employment Permit",
    "General Employment Permit", 
    "Intra-Company Transfer Employment Permit",
    "Seasonal/Short-term Work Permit",
    "Researcher/Academic Permit",
    "Sport and Cultural Employment Permit",
    "Exchange Agreement Employment Permit"
  ];

  const embassyLocations = [
    "Embassy of Ireland, New Delhi, India",
    "Consulate General of Ireland, Mumbai, India", 
    "Embassy of Ireland, Beijing, China",
    "Embassy of Ireland, London, UK",
    "Embassy of Ireland, Washington DC, USA",
    "Embassy of Ireland, Berlin, Germany",
    "Embassy of Ireland, Paris, France",
    "Embassy of Ireland, Rome, Italy",
    "Embassy of Ireland, Madrid, Spain",
    "Embassy of Ireland, The Hague, Netherlands"
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparation":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "applied":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "awaiting_decision":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "interview_scheduled":
        return <Calendar className="h-5 w-5 text-purple-500" />;
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
        return "Your work visa application is being prepared by our team.";
      case "applied":
        return "Your work visa application has been submitted to the embassy. Application is under review.";
      case "awaiting_decision":
        return "Your application is under review by the embassy. Please wait for their decision.";
      case "interview_scheduled":
        return "Your visa interview has been scheduled. Please prepare for your embassy interview.";
      case "approved":
        return "Congratulations! Your work visa has been approved by the embassy.";
      case "rejected":
        return "Unfortunately, your work visa application was not approved. Please contact our support team for assistance.";
      default:
        return "Your work visa application status will be updated here.";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparation":
        return "bg-gray-100 text-gray-800";
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "awaiting_decision":
        return "bg-yellow-100 text-yellow-800";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "preparation":
        return "Preparation";
      case "applied":
        return "Applied";
      case "awaiting_decision":
        return "Awaiting Embassy Decision";
      case "interview_scheduled":
        return "Interview Scheduled";
      case "approved":
        return "Embassy Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown Status";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load work visa information. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Plane className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Work Visa Status
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track your work visa application progress and important updates from the embassy.
          </p>
        </div>

        {/* Main Status Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center space-x-3">
                  {workVisa ? getStatusIcon(workVisa.status) : <Clock className="h-5 w-5" />}
                  <span>Work Visa Application</span>
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg mt-2">
                  Current Status: {workVisa ? getStatusLabel(workVisa.status) : "Not Started"}
                </CardDescription>
              </div>
              {workVisa && (
                <Badge className={`${getStatusColor(workVisa.status)} px-4 py-2 text-sm font-semibold`}>
                  {getStatusLabel(workVisa.status)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {workVisa ? (
              <>
                {/* Status Description */}
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-base">
                    {getStatusDescription(workVisa.status)}
                  </AlertDescription>
                </Alert>

                {/* Application Details with Edit Functionality */}
                <div className="space-y-6">
                  {/* Edit Control Header */}
                  {workVisa.status === "preparation" && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          Update Your Visa Details
                        </h4>
                        <p className="text-sm text-blue-600">
                          You can edit your visa type and embassy location while your application is in preparation.
                        </p>
                      </div>
                      {!isEditing && (
                        <Button
                          onClick={handleEdit}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Details
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Visa Type Section */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Visa Type</span>
                      </h4>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Label htmlFor="visaType" className="text-sm text-gray-600">
                            Select your visa type
                          </Label>
                          <Select
                            value={editData.visaType}
                            onValueChange={(value) => setEditData({ ...editData, visaType: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose visa type" />
                            </SelectTrigger>
                            <SelectContent>
                              {visaTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          {workVisa.visaType || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Embassy Location Section */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Embassy Location</span>
                      </h4>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Label htmlFor="embassyLocation" className="text-sm text-gray-600">
                            Select embassy location
                          </Label>
                          <Select
                            value={editData.embassyLocation}
                            onValueChange={(value) => setEditData({ ...editData, embassyLocation: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose embassy location" />
                            </SelectTrigger>
                            <SelectContent>
                              {embassyLocations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          {workVisa.embassyLocation || "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edit Action Buttons */}
                  {isEditing && (
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Button
                        onClick={handleSave}
                        disabled={updateWorkVisaMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateWorkVisaMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={updateWorkVisaMutation.isPending}
                        className="border-gray-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  {workVisa.trackingCode && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Tracking Code</h4>
                      <p className="text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                        {workVisa.trackingCode}
                      </p>
                    </div>
                  )}

                  {workVisa.applicationDate && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Application Date</span>
                      </h4>
                      <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        {format(new Date(workVisa.applicationDate), "PPP")}
                      </p>
                    </div>
                  )}

                  {workVisa.interviewDate && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>Interview Date</span>
                      </h4>
                      <p className="text-purple-600 font-semibold bg-purple-50 px-3 py-2 rounded-lg">
                        {format(new Date(workVisa.interviewDate), "PPP 'at' p")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {workVisa.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">Additional Notes</h4>
                    <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-4">
                      <p className="text-gray-700">{workVisa.notes}</p>
                    </div>
                  </div>
                )}

                {/* Work Visa Documents */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 text-lg flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Work Visa Documents</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'irlApplicationFormUrl', label: 'IRL Application Form' },
                      { key: 'visaAppointmentUrl', label: 'Visa Appointment' },
                      { key: 'vfsVisaPaymentUrl', label: 'VFS Visa Payment' },
                      { key: 'visaCoverLetterUrl', label: 'Visa Cover Letter' },
                      { key: 'visaInviteLetterUrl', label: 'Visa Invite Letter' },
                      { key: 'supplementaryEmploymentApplicationUrl', label: 'Supplementary Employment Application Form' },
                      { key: 'irelandVacChecklistUrl', label: 'Ireland VAC Checklist' },
                      { key: 'travelMedicalInsuranceUrl', label: 'Travel & Medical Insurance' },
                      { key: 'fullDocketVisaSubmissionUrl', label: 'Full Docket for Visa Submission' }
                    ].map((doc) => {
                      const url = (workVisa as any)?.[doc.key];
                      const isAvailable = !!url;
                      
                      return (
                        <div
                          key={doc.key}
                          className={`p-4 rounded-lg border ${
                            isAvailable 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {isAvailable ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-gray-400" />
                                )}
                                <span className={`font-medium text-sm ${
                                  isAvailable ? 'text-green-800' : 'text-gray-600'
                                }`}>
                                  {doc.label}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${
                                isAvailable ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {isAvailable ? 'Available for download' : 'Pending upload by admin'}
                              </p>
                            </div>
                            {isAvailable && (
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                              >
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Download Visa Document */}
                {workVisa.finalVisaUrl && workVisa.status === 'approved' && (
                  <div className="bg-green-50 border-green-200 border rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Your Approved Visa</span>
                    </h4>
                    <p className="text-green-700 mb-4">
                      Congratulations! Your work visa has been approved and is ready for download.
                    </p>
                    <Button 
                      asChild 
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a href={workVisa.finalVisaUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download Visa Document
                      </a>
                    </Button>
                  </div>
                )}

                {/* Last Updated */}
                <div className="text-sm text-gray-500 pt-4 border-t">
                  Last updated: {format(new Date(workVisa.lastUpdated), "PPP 'at' p")}
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-gray-50 rounded-lg p-8">
                  <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Work Visa Application Yet
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Your work visa application will appear here once our team begins the process. 
                    Please complete your docket and contract first.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Support Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Need Help with Your Visa?
                </h3>
                <p className="text-gray-600">
                  Contact our support team for assistance with your work visa application.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  asChild 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <a href="mailto:info@chefoverseas.com">
                    Email Support
                  </a>
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <a href="https://wa.me/919363234028" target="_blank" rel="noopener noreferrer">
                    WhatsApp Chat
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