import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  User, Mail, Phone, Calendar, MapPin, FileText, 
  Clock, CheckCircle, XCircle, AlertCircle, Plane 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { WorkVisaDocumentUploader } from "./WorkVisaDocumentUploader";

interface WorkVisaDetailsModalProps {
  userId: string | null;
  onClose: () => void;
}

export function WorkVisaDetailsModal({ userId, onClose }: WorkVisaDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    trackingCode: "",
    visaType: "",
    embassyLocation: "",
    interviewDate: "",
    interviewTime: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workVisaData, isLoading } = useQuery({
    queryKey: [`/api/admin/workvisa/${userId}`],
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/admin/workvisa/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Work visa updated successfully",
        description: "The work visa information has been updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workvisas'] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/workvisa/${userId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update work visa",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if ((workVisaData as any)?.workVisa) {
      const visa = (workVisaData as any).workVisa;
      setFormData({
        status: visa.status || "",
        trackingCode: visa.trackingCode || "",
        visaType: visa.visaType || "",
        embassyLocation: visa.embassyLocation || "",
        interviewDate: visa.interviewDate ? 
          format(new Date(visa.interviewDate), "yyyy-MM-dd") : "",
        interviewTime: visa.interviewTime || "",
        notes: visa.notes || ""
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    const updates: any = { ...formData };
    if (updates.interviewDate) {
      updates.interviewDate = new Date(updates.interviewDate).toISOString();
    }
    updateMutation.mutate(updates);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparation":
        return <Clock className="h-5 w-5 text-gray-600" />;
      case "applied":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "awaiting_decision":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "interview_scheduled":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparation":
        return "bg-gray-100 text-gray-700";
      case "applied":
        return "bg-blue-100 text-blue-700";
      case "awaiting_decision":
        return "bg-yellow-100 text-yellow-700";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!userId) return null;

  return (
    <Dialog open={!!userId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-blue-600" />
            <span>Work Visa Management</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{(workVisaData as any)?.user?.displayName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{(workVisaData as any)?.user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{(workVisaData as any)?.user?.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Visa Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span>Work Visa Details</span>
                  </div>
                  <Button 
                    variant={isEditing ? "secondary" : "outline"}
                    onClick={isEditing ? () => setIsEditing(false) : handleEdit}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="preparation">Preparation</option>
                        <option value="applied">Applied</option>
                        <option value="awaiting_decision">Awaiting Decision</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="trackingCode">Tracking Code</Label>
                      <Input
                        id="trackingCode"
                        value={formData.trackingCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, trackingCode: e.target.value }))}
                        placeholder="Enter tracking code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="visaType">Visa Type</Label>
                      <Input
                        id="visaType"
                        value={formData.visaType}
                        onChange={(e) => setFormData(prev => ({ ...prev, visaType: e.target.value }))}
                        placeholder="e.g., Work Permit, Critical Skills, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="embassyLocation">Embassy Location</Label>
                      <Input
                        id="embassyLocation"
                        value={formData.embassyLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, embassyLocation: e.target.value }))}
                        placeholder="Embassy or consulate location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interviewDate">Interview Date</Label>
                      <Input
                        id="interviewDate"
                        type="date"
                        value={formData.interviewDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, interviewDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="interviewTime">Interview Time</Label>
                      <Input
                        id="interviewTime"
                        type="time"
                        value={formData.interviewTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, interviewTime: e.target.value }))}
                        placeholder="Select interview time"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon((workVisaData as any)?.workVisa?.status || "preparation")}
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor((workVisaData as any)?.workVisa?.status || "preparation")}>
                        {(workVisaData as any)?.workVisa?.status || "Preparation"}
                      </Badge>
                    </div>
                    {(workVisaData as any)?.workVisa?.trackingCode && (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Tracking:</span>
                        <span>{(workVisaData as any).workVisa.trackingCode}</span>
                      </div>
                    )}
                    {(workVisaData as any)?.workVisa?.visaType && (
                      <div className="flex items-center space-x-2">
                        <Plane className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Visa Type:</span>
                        <span>{(workVisaData as any).workVisa.visaType}</span>
                      </div>
                    )}
                    {(workVisaData as any)?.workVisa?.embassyLocation && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Embassy:</span>
                        <span>{(workVisaData as any).workVisa.embassyLocation}</span>
                      </div>
                    )}
                    {(workVisaData as any)?.workVisa?.interviewDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Interview:</span>
                        <div className="flex flex-col">
                          <span>{format(new Date((workVisaData as any).workVisa.interviewDate), "PPP")}</span>
                          {(workVisaData as any)?.workVisa?.interviewTime && (
                            <span className="text-sm text-gray-600">at {(workVisaData as any).workVisa.interviewTime}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {(workVisaData as any)?.workVisa?.applicationDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Applied:</span>
                        <span>{format(new Date((workVisaData as any).workVisa.applicationDate), "PPP")}</span>
                      </div>
                    )}
                    {(workVisaData as any)?.workVisa?.notes && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Notes:</span>
                        <p className="text-gray-700 mt-1">{(workVisaData as any).workVisa.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Upload Section */}
            <WorkVisaDocumentUploader 
              userId={userId}
              workVisa={(workVisaData as any)?.workVisa}
              onUploadSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/admin/workvisa/${userId}`] });
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}