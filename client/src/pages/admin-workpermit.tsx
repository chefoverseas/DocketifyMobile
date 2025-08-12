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
import { ArrowLeft, User, Phone, Mail, FileText, Calendar, Save, Upload } from "lucide-react";
import { format } from "date-fns";

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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Failed to load work permit data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Work Permit</h1>
          <p className="text-gray-600 mt-2">
            Update work permit status and manage documents for {user?.displayName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{user.displayName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{user.phone}</span>
                </div>
                <Separator />
                <div className="text-sm text-gray-600">
                  <strong>First Name:</strong> {user.givenName || 'Not provided'}
                  <br />
                  <strong>Last Name:</strong> {user.surname || 'Not provided'}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>
              {workPermit?.lastUpdated && (
                <>Last updated: {format(new Date(workPermit.lastUpdated), 'PPP p')}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <WorkPermitStatusBadge status={workPermit?.status || "preparation"} />
            </div>
            {workPermit?.trackingCode && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Tracking Code:</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {workPermit.trackingCode}
                </span>
              </div>
            )}
            {workPermit?.applicationDate && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Application Date:</span>
                <span className="text-sm text-gray-600">
                  {format(new Date(workPermit.applicationDate), 'PPP')}
                </span>
              </div>
            )}
            {workPermit?.notes && (
              <div>
                <Label className="font-medium">Current Notes:</Label>
                <div className="bg-gray-50 p-3 rounded-md mt-1 text-sm">
                  {workPermit.notes}
                </div>
              </div>
            )}
            {workPermit?.finalDocketUrl && (
              <div>
                <Label className="font-medium">Final Docket:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="h-4 w-4 text-green-600" />
                  <Button variant="link" size="sm" asChild className="p-0 h-auto">
                    <a href={workPermit.finalDocketUrl} target="_blank" rel="noopener noreferrer">
                      View Final Docket PDF
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Update Work Permit Status</CardTitle>
            <CardDescription>
              Change the status and add notes for this user's work permit application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <StatusDropdown 
                  value={status} 
                  onValueChange={setStatus}
                  disabled={updateWorkPermitMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Actions</Label>
                <Button 
                  onClick={handleSave}
                  disabled={updateWorkPermitMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateWorkPermitMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Tracking Code Field - Show when status is applied */}
            {(status === "applied" || workPermit?.status === "applied") && (
              <div className="space-y-2">
                <Label htmlFor="trackingCode">
                  Tracking Code <span className="text-sm text-gray-500">(Required when status is Applied)</span>
                </Label>
                <Input
                  id="trackingCode"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Enter application tracking code (e.g., WP-2025-001234)"
                  disabled={updateWorkPermitMutation.isPending}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or instructions for the user..."
                rows={4}
                disabled={updateWorkPermitMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Final Docket Upload */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Upload className="h-5 w-5" />
              Final Docket Upload
            </CardTitle>
            <CardDescription>
              Upload the final approved work permit document (PDF only). This will automatically set the status to "Approved".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status === "approved" || workPermit?.status === "approved" ? (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Status is set to "Approved". You can upload or replace the final docket document.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertDescription>
                    Upload will be enabled when status is set to "Approved" or when you upload a document.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {isUploading ? "Uploading..." : "Click to upload PDF"}
                  </p>
                  <p className="text-xs text-gray-500">PDF files up to 10MB</p>
                </label>
              </div>
              
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  Uploading final docket...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}