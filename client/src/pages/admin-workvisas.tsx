import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText, AlertCircle, CheckCircle, XCircle, Search, Users, Calendar, MapPin, Plane, Edit, Filter, Download, RefreshCw, Eye, UserCheck, Globe, Building2, TrendingUp, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState<string>("all");
  const [embassyFilter, setEmbassyFilter] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  // Enhanced filtering with multiple criteria
  const filteredWorkVisas = workVisas.filter((visa) => {
    const matchesSearch = !searchTerm || 
      visa.user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.user.phone?.includes(searchTerm) ||
      visa.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.visaType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.embassyLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || visa.status === statusFilter;
    const matchesVisaType = visaTypeFilter === "all" || visa.visaType === visaTypeFilter;
    const matchesEmbassy = embassyFilter === "all" || visa.embassyLocation === embassyFilter;

    return matchesSearch && matchesStatus && matchesVisaType && matchesEmbassy;
  });

  // Get unique values for filter dropdowns
  const uniqueVisaTypes = Array.from(new Set(workVisas.map(v => v.visaType).filter(Boolean))) as string[];
  const uniqueEmbassies = Array.from(new Set(workVisas.map(v => v.embassyLocation).filter(Boolean))) as string[];

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Header with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Work Visa Management
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Comprehensive visa application tracking and embassy coordination
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="bg-white/50 hover:bg-white/80 border-white/30"
              >
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="bg-white/50 hover:bg-white/80 border-white/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/50 hover:bg-white/80 border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-500 rounded-xl w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm text-blue-700 font-medium">Total Applications</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gray-500 rounded-xl w-fit mx-auto mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.preparation}</div>
              <div className="text-sm text-gray-700 font-medium">In Preparation</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-500 rounded-xl w-fit mx-auto mb-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-900">{stats.applied}</div>
              <div className="text-sm text-blue-700 font-medium">Applied</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-yellow-500 rounded-xl w-fit mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-yellow-900">{stats.awaiting_decision}</div>
              <div className="text-sm text-yellow-700 font-medium">Awaiting Decision</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-500 rounded-xl w-fit mx-auto mb-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-900">{stats.interview_scheduled}</div>
              <div className="text-sm text-purple-700 font-medium">Interview Scheduled</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-500 rounded-xl w-fit mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-900">{stats.approved}</div>
              <div className="text-sm text-green-700 font-medium">Approved</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-red-500 rounded-xl w-fit mx-auto mb-3">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-900">{stats.rejected}</div>
              <div className="text-sm text-red-700 font-medium">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-orange-600" />
              <span>Search & Filters</span>
            </CardTitle>
            <CardDescription>
              Use advanced filters to find specific visa applications quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by name, email, tracking code, visa type, or embassy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/50 border-white/30 placeholder:text-gray-500 text-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/50 border-white/30">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="preparation">In Preparation</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="awaiting_decision">Awaiting Decision</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Visa Type</label>
                <Select value={visaTypeFilter} onValueChange={setVisaTypeFilter}>
                  <SelectTrigger className="bg-white/50 border-white/30">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueVisaTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Embassy</label>
                <Select value={embassyFilter} onValueChange={setEmbassyFilter}>
                  <SelectTrigger className="bg-white/50 border-white/30">
                    <SelectValue placeholder="All Embassies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Embassies</SelectItem>
                    {uniqueEmbassies.map((embassy) => (
                      <SelectItem key={embassy} value={embassy}>
                        {embassy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setVisaTypeFilter("all");
                    setEmbassyFilter("all");
                  }}
                  className="w-full bg-white/50 hover:bg-white/80 border-white/30"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Work Visas Dashboard */}
        <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <Plane className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold">Work Visa Applications</span>
                    <div className="text-sm text-gray-600 font-normal">
                      {filteredWorkVisas.length} of {workVisas.length} applications
                    </div>
                  </div>
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-base">
              Comprehensive visa tracking with embassy coordination and document management
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredWorkVisas.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl w-fit mx-auto mb-6">
                  <Plane className="h-16 w-16 text-orange-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Work Visas Found
                </h3>
                <p className="text-gray-500 text-lg">
                  {searchTerm || statusFilter !== "all" || visaTypeFilter !== "all" || embassyFilter !== "all"
                    ? "No work visas match your current filter criteria. Try adjusting your filters."
                    : "No work visa applications have been created yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkVisas.map((visa) => (
                  <Card 
                    key={visa.id} 
                    className="bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedUserId(visa.userId)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {visa.user.displayName ? visa.user.displayName[0] : "U"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                              {visa.user.displayName || "Unnamed User"}
                            </h3>
                            <p className="text-sm text-gray-600">{visa.user.email}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(visa.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(visa.status)}
                            <span className="text-xs font-medium">{getStatusLabel(visa.status)}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {visa.visaType && (
                          <div className="flex items-center text-sm text-gray-700">
                            <FileText className="h-4 w-4 mr-2 text-orange-500" />
                            <span className="font-medium">{visa.visaType}</span>
                          </div>
                        )}
                        
                        {visa.embassyLocation && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Building2 className="h-4 w-4 mr-2 text-orange-500" />
                            <span>{visa.embassyLocation}</span>
                          </div>
                        )}
                        
                        {visa.trackingCode && (
                          <div className="bg-gray-100 rounded-lg p-2">
                            <div className="text-xs text-gray-600 mb-1">Tracking Code</div>
                            <div className="font-mono text-sm text-gray-900">{visa.trackingCode}</div>
                          </div>
                        )}
                        
                        {visa.applicationDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                            <span>Applied: {format(new Date(visa.applicationDate), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        
                        {visa.interviewDate && (
                          <div className="flex items-center text-sm text-purple-700 bg-purple-50 rounded p-2">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium">Interview: {format(new Date(visa.interviewDate), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(visa.userId);
                          }}
                          className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Manage Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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