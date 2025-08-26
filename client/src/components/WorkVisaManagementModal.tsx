import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  User, Mail, Phone, Calendar, MapPin, FileText, 
  Clock, CheckCircle, XCircle, AlertCircle, Plane, Edit,
  Upload, Download, Eye, Settings
} from "lucide-react";
import { WorkVisaDocumentUploader } from "./WorkVisaDocumentUploader";

interface WorkVisaManagementModalProps {
  userId: string;
  onUpdate: () => void;
}

export function WorkVisaManagementModal({ userId, onUpdate }: WorkVisaManagementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    enabled: isOpen && !!userId,
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
      onUpdate();
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

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="admin-primary-btn" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Work Visa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Visa Details</TabsTrigger>
              <TabsTrigger value="documents">Document Management</TabsTrigger>
              <TabsTrigger value="status">Status & Tracking</TabsTrigger>
            </TabsList>

            {/* Visa Details Tab */}
            <TabsContent value="details" className="space-y-6">
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
                      {isEditing ? "Cancel" : <><Edit className="h-4 w-4 mr-2" />Edit</>}
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
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes or comments"
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end space-x-2">
                        <Button onClick={() => setIsEditing(false)} variant="outline">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSave} 
                          disabled={updateMutation.isPending}
                          className="admin-primary-btn"
                        >
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon((workVisaData as any)?.workVisa?.status)}
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <Badge className={getStatusColor((workVisaData as any)?.workVisa?.status || "preparation")}>
                            {formatStatus((workVisaData as any)?.workVisa?.status || "preparation")}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Tracking Code</p>
                          <p className="font-medium">{(workVisaData as any)?.workVisa?.trackingCode || "Not assigned"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Plane className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Visa Type</p>
                          <p className="font-medium">{(workVisaData as any)?.workVisa?.visaType || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Embassy Location</p>
                          <p className="font-medium">{(workVisaData as any)?.workVisa?.embassyLocation || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Interview Date</p>
                          <p className="font-medium">
                            {(workVisaData as any)?.workVisa?.interviewDate 
                              ? format(new Date((workVisaData as any).workVisa.interviewDate), "PPP")
                              : "Not scheduled"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Interview Time</p>
                          <p className="font-medium">{(workVisaData as any)?.workVisa?.interviewTime || "Not specified"}</p>
                        </div>
                      </div>
                      {(workVisaData as any)?.workVisa?.notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Notes</p>
                          <p className="font-medium bg-gray-50 p-3 rounded-md">{(workVisaData as any).workVisa.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Document Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkVisaDocumentUploader 
                    userId={userId}
                    workVisa={(workVisaData as any)?.workVisa}
                    onUploadSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: [`/api/admin/workvisa/${userId}`] });
                      onUpdate();
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Status & Tracking Tab */}
            <TabsContent value="status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Status & Tracking Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Application Status</h4>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon((workVisaData as any)?.workVisa?.status || "preparation")}
                        <div>
                          <Badge className={getStatusColor((workVisaData as any)?.workVisa?.status || "preparation")}>
                            {formatStatus((workVisaData as any)?.workVisa?.status || "preparation")}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">Current application status</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Tracking Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Tracking Code:</span>
                          <span className="text-sm font-medium">{(workVisaData as any)?.workVisa?.trackingCode || "Not assigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Application Date:</span>
                          <span className="text-sm font-medium">
                            {(workVisaData as any)?.workVisa?.applicationDate 
                              ? format(new Date((workVisaData as any).workVisa.applicationDate), "PPP")
                              : "Not submitted"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Last Updated:</span>
                          <span className="text-sm font-medium">
                            {(workVisaData as any)?.workVisa?.lastUpdated 
                              ? format(new Date((workVisaData as any).workVisa.lastUpdated), "PPP")
                              : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Timeline */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Application Timeline</h4>
                    <div className="space-y-3">
                      {["preparation", "applied", "awaiting_decision", "interview_scheduled", "approved"].map((status, index) => {
                        const currentStatus = (workVisaData as any)?.workVisa?.status || "preparation";
                        const isActive = status === currentStatus;
                        const isCompleted = ["preparation", "applied", "awaiting_decision", "interview_scheduled", "approved"].indexOf(currentStatus) > index;
                        
                        return (
                          <div key={status} className={`flex items-center space-x-3 p-3 rounded-lg ${
                            isActive ? "bg-blue-50 border border-blue-200" :
                            isCompleted ? "bg-green-50 border border-green-200" :
                            "bg-gray-50 border border-gray-200"
                          }`}>
                            <div className={`w-3 h-3 rounded-full ${
                              isActive ? "bg-blue-500" :
                              isCompleted ? "bg-green-500" :
                              "bg-gray-300"
                            }`} />
                            <span className={`font-medium ${
                              isActive ? "text-blue-700" :
                              isCompleted ? "text-green-700" :
                              "text-gray-500"
                            }`}>
                              {formatStatus(status)}
                            </span>
                            {isActive && <Badge variant="default" className="text-xs">Current</Badge>}
                            {isCompleted && <Badge variant="secondary" className="text-xs">Completed</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}