import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { StatusDropdown } from "@/components/status-dropdown";

import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Phone, Mail, FileText, Calendar, Save, Upload, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { format } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

import { Link } from "wouter";

type User = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  givenName: string;
  surname: string;
};

type WorkPermit = {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected";
  trackingCode: string | null;
  applicationDate: string | null;
  finalDocketUrl: string | null;
  notes: string | null;
  lastUpdated: string;
  createdAt: string;
};

export default function AdminWorkPermitPage() {
  const params = useParams();
  const userId = params.userId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<WorkPermit['status']>("preparation");
  const [notes, setNotes] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/admin/workpermit/${userId}`],
    enabled: !!userId,
  });

  const workPermit = (data as any)?.workPermit as WorkPermit | undefined;
  const user = (data as any)?.user as User | undefined;

  // Initialize form state when data loads
  useState(() => {
    if (workPermit) {
      setStatus(workPermit.status);
      setNotes(workPermit.notes || "");
      setTrackingCode(workPermit.trackingCode || "");
    }
  });

  const updateWorkPermitMutation = useMutation({
    mutationFn: async (updateData: { status?: string; notes?: string; trackingCode?: string }) => {
      const response = await fetch(`/api/admin/workpermit/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update work permit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/workpermit/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workpermits'] });
      toast({
        title: "Success",
        description: "Work permit status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update work permit status",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateWorkPermitMutation.mutate({
      status,
      notes,
      trackingCode: trackingCode || undefined,
    });
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', files[0]);

      const response = await fetch(`/api/admin/workpermit/${userId}/upload-docket`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      queryClient.invalidateQueries({ queryKey: [`/api/admin/workpermit/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workpermits'] });
      
      toast({
        title: "Success",
        description: "Final docket uploaded successfully",
      });

      // Auto-update status to approved when file is uploaded
      setStatus("approved");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload final docket",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/30">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gradient-to-r from-orange-200 to-red-200 rounded-lg w-48"></div>
            <div className="h-4 bg-gradient-to-r from-orange-100 to-red-100 rounded w-32"></div>
            <div className="h-32 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/30 max-w-md">
          <div className="text-center">
            <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">Failed to load work permit data. Please try again later.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600">
      {/* Modern Glassmorphism Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-white/30">
                  <img 
                    src={chefOverseasLogo} 
                    alt="Chef Overseas" 
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                    Work Permit Management
                  </h1>
                  <p className="text-orange-100 mt-1 text-lg">
                    Admin Dashboard - {user?.displayName || 'User'} Work Permit
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  asChild
                  variant="outline" 
                  size="sm"
                  className="bg-white/50 hover:bg-white/80 border-white/30 backdrop-blur-sm"
                >
                  <Link href="/admin/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* User Information Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl overflow-hidden">
            <div className="relative p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">User Information</h3>
                    <p className="text-gray-600">Personal details and contact information</p>
                  </div>
                </div>
                
                {user && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">{user.displayName}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-800">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-800">{user.phone}</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent my-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">First Name:</span>
                        <p className="text-gray-600 mt-1">{user.givenName || 'Not provided'}</p>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Last Name:</span>
                        <p className="text-gray-600 mt-1">{user.surname || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Status Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl overflow-hidden">
            <div className="relative p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Current Status</h3>
                    {workPermit?.lastUpdated && (
                      <p className="text-gray-600">
                        Last updated: {format(new Date(workPermit.lastUpdated), 'PPP p')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                    <span className="font-semibold text-gray-800">Status:</span>
                    <WorkPermitStatusBadge status={workPermit?.status || "preparation"} />
                  </div>
                  
                  {workPermit?.trackingCode && (
                    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                      <span className="font-semibold text-gray-800">Tracking Code:</span>
                      <span className="bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2 rounded-lg text-sm font-mono font-semibold text-gray-700 shadow-sm">
                        {workPermit.trackingCode}
                      </span>
                    </div>
                  )}
                  
                  {workPermit?.applicationDate && (
                    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                      <span className="font-semibold text-gray-800">Application Date:</span>
                      <span className="text-gray-700 font-medium">
                        {format(new Date(workPermit.applicationDate), 'PPP')}
                      </span>
                    </div>
                  )}
                  
                  {workPermit?.notes && (
                    <div className="p-4 bg-white/60 rounded-xl">
                      <Label className="font-semibold text-gray-800 mb-2 block">Current Notes:</Label>
                      <div className="bg-amber-50/80 backdrop-blur-sm p-4 rounded-lg border border-amber-200/50">
                        <p className="text-gray-700 leading-relaxed">{workPermit.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {workPermit?.finalDocketUrl && (
                    <div className="p-4 bg-white/60 rounded-xl">
                      <Label className="font-semibold text-gray-800 mb-3 block">Final Docket:</Label>
                      <div className="flex items-center gap-3 p-3 bg-green-50/80 rounded-lg border border-green-200/50">
                        <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Final Docket Available</p>
                          <p className="text-sm text-green-700">Document ready for download</p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="bg-white/70 hover:bg-white">
                          <a href={workPermit.finalDocketUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            View PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Status Management Card */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl overflow-hidden">
          <div className="relative p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <Save className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Update Work Permit Status</h3>
                  <p className="text-gray-600">Change the status and add notes for this user's work permit application</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-800">Status</Label>
                  <div className="p-4 bg-white/60 rounded-xl">
                    <StatusDropdown 
                      value={status} 
                      onValueChange={setStatus}
                      disabled={updateWorkPermitMutation.isPending}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800">Actions</Label>
                  <div className="p-4 bg-white/60 rounded-xl">
                    <Button 
                      onClick={handleSave}
                      disabled={updateWorkPermitMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {updateWorkPermitMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tracking Code Field - Show when status is applied */}
              {(status === "applied" || workPermit?.status === "applied") && (
                <div className="space-y-3 mt-6">
                  <Label htmlFor="trackingCode" className="text-sm font-semibold text-gray-800">
                    Tracking Code <span className="text-sm text-amber-600">(Required when status is Applied)</span>
                  </Label>
                  <div className="p-4 bg-white/60 rounded-xl">
                    <Input
                      id="trackingCode"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      placeholder="Enter application tracking code (e.g., WP-2025-001234)"
                      disabled={updateWorkPermitMutation.isPending}
                      className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 mt-6">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-800">Notes (Optional)</Label>
                <div className="p-4 bg-white/60 rounded-xl">
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes or instructions for the user..."
                    rows={4}
                    disabled={updateWorkPermitMutation.isPending}
                    className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Docket Upload Card */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl overflow-hidden">
          <div className="relative p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Final Docket Upload</h3>
                  <p className="text-gray-600">Upload the final work permit document (PDF only). Available for Applied status and above.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {(status === "applied" || status === "awaiting_decision" || status === "approved") || 
                 (workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved") ? (
                  <div className="p-4 bg-green-50/80 rounded-xl border border-green-200/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-green-800 font-medium">
                        Final docket upload is available. You can upload or replace the document.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <p className="text-amber-800 font-medium">
                        Upload will be enabled when status is set to "Applied" or higher.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    isUploading || !(status === "applied" || status === "awaiting_decision" || status === "approved" || workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved") 
                      ? 'border-gray-200 bg-gray-50/50' 
                      : 'border-orange-300 bg-orange-50/50 hover:border-orange-400 hover:bg-orange-50/80'
                  }`}>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload([e.target.files[0]]);
                        }
                      }}
                      disabled={isUploading || !(status === "applied" || status === "awaiting_decision" || status === "approved" || workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved")}
                    />
                    <label htmlFor="file-upload" className={`cursor-pointer block ${isUploading || !(status === "applied" || status === "awaiting_decision" || status === "approved" || workPermit?.status === "applied" || workPermit?.status === "awaiting_decision" || workPermit?.status === "approved") ? 'opacity-50' : 'hover:opacity-80 transition-opacity'}`}>
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {isUploading ? "Uploading..." : "Click to upload PDF"}
                      </p>
                      <p className="text-sm text-gray-600">PDF files up to 10MB</p>
                    </label>
                  </div>
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="animate-spin h-6 w-6 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                        <span className="font-medium">Uploading final docket...</span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        
        </div>
      </div>
    </div>
  );
}