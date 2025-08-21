import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, FileText, AlertCircle, CheckCircle, XCircle, Search, Users, Calendar, MapPin, Plane, Edit } from "lucide-react";
import { format } from "date-fns";
import { WorkVisaDetailsModal } from "@/components/WorkVisaDetailsModal";

type User = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
};

type WorkVisa = {
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
  user: User;
};

export default function AdminWorkVisasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch all users instead of just work visas
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Fetch existing work visas
  const { data: workVisasData, isLoading: workVisasLoading, error: workVisasError } = useQuery({
    queryKey: ['/api/admin/workvisas'],
  });

  const isLoading = usersLoading || workVisasLoading;
  const error = usersError || workVisasError;

  // Get all users
  const allUsers = ((usersData as any)?.users || []);
  
  // Get existing work visas
  const existingWorkVisas = ((workVisasData as any)?.workVisas || []);
  
  // Create work visa object for each user (with existing data if available)
  const workVisas = allUsers.map((user: any) => {
    const existingVisa = existingWorkVisas.find((visa: any) => visa.user?.id === user.id);
    
    return {
      id: existingVisa?.workVisa?.id || user.id,
      userId: user.id,
      status: existingVisa?.workVisa?.status || "preparation",
      trackingCode: existingVisa?.workVisa?.trackingCode || null,
      applicationDate: existingVisa?.workVisa?.applicationDate || null,
      interviewDate: existingVisa?.workVisa?.interviewDate || null,
      visaType: existingVisa?.workVisa?.visaType || null,
      embassyLocation: existingVisa?.workVisa?.embassyLocation || null,
      finalVisaUrl: existingVisa?.workVisa?.finalVisaUrl || null,
      notes: existingVisa?.workVisa?.notes || null,
      lastUpdated: existingVisa?.workVisa?.lastUpdated || user.createdAt,
      createdAt: existingVisa?.workVisa?.createdAt || user.createdAt,
      user: user,
      hasWorkVisa: !!existingVisa?.workVisa
    };
  }) as (WorkVisa & { hasWorkVisa: boolean })[];

  // Filter work visas based on search term
  const filteredWorkVisas = workVisas.filter((visa) =>
    visa.user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visa.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visa.user.phone?.includes(searchTerm) ||
    visa.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visa.visaType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visa.embassyLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: workVisas.length,
    preparation: workVisas.filter(v => v.status === "preparation").length,
    applied: workVisas.filter(v => v.status === "applied").length,
    awaiting_decision: workVisas.filter(v => v.status === "awaiting_decision").length,
    interview_scheduled: workVisas.filter(v => v.status === "interview_scheduled").length,
    approved: workVisas.filter(v => v.status === "approved").length,
    rejected: workVisas.filter(v => v.status === "rejected").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparation":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "applied":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "awaiting_decision":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
        return "Awaiting Decision";
      case "interview_scheduled":
        return "Interview Scheduled";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown Status";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load work visas data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Plane className="h-8 w-8 text-blue-600" />
              <span>Work Visa Management</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage all user work visa applications from the embassy.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.preparation}</div>
              <div className="text-sm text-gray-600">Preparation</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{stats.applied}</div>
              <div className="text-sm text-blue-600">Applied</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">{stats.awaiting_decision}</div>
              <div className="text-sm text-yellow-600">Awaiting</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{stats.interview_scheduled}</div>
              <div className="text-sm text-purple-600">Interview</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
              <div className="text-sm text-green-600">Approved</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
              <div className="text-sm text-red-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, status, visa type, or embassy location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Visas Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5" />
              <span>Work Visa Applications ({filteredWorkVisas.length})</span>
            </CardTitle>
            <CardDescription>
              Click on any visa to view detailed information and manage the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredWorkVisas.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Work Visas Found
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? "No work visas match your search criteria." : "No work visa applications have been created yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User Profile
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Visa Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Timeline
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Quick Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredWorkVisas.map((visa, index) => (
                        <tr key={visa.id} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                  <span className="text-lg font-bold text-white">
                                    {visa.user.displayName ? visa.user.displayName[0] : "U"}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {visa.user.displayName || "Unnamed User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {visa.user.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900">
                                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{visa.visaType || "Type not specified"}</span>
                              </div>
                              {visa.embassyLocation && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{visa.embassyLocation}</span>
                                </div>
                              )}
                              {visa.trackingCode && (
                                <div className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                  {visa.trackingCode}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${getStatusColor(visa.status)} flex items-center space-x-1 w-fit`}>
                              {getStatusIcon(visa.status)}
                              <span>{getStatusLabel(visa.status)}</span>
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm">
                              {visa.applicationDate && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Applied:</span> {format(new Date(visa.applicationDate), "MMM dd, yyyy")}
                                </div>
                              )}
                              {visa.interviewDate && (
                                <div className="text-purple-600 font-medium">
                                  <span>Interview:</span> {format(new Date(visa.interviewDate), "MMM dd, yyyy")}
                                </div>
                              )}
                              <div className="text-gray-500 text-xs">
                                Updated: {format(new Date(visa.lastUpdated), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUserId(visa.userId)}
                                className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Manage Documents
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="text-xs"
                              >
                                <a href={`/admin/user/${visa.userId}`}>
                                  View Profile
                                </a>
                              </Button>
                              {visa.finalVisaUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="text-xs text-green-600 border-green-300"
                                >
                                  <a href={visa.finalVisaUrl} download>
                                    Download Visa
                                  </a>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Work Visa Details Modal */}
      {selectedUserId && (
        <WorkVisaDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}