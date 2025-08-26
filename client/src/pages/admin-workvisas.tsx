import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText, AlertCircle, CheckCircle, XCircle, Search, Users, Calendar, MapPin, Plane, Edit, Filter, Download, RefreshCw, Eye, UserCheck, Globe, Building2, TrendingUp, ArrowLeft, CalendarDays, Timer, MapIcon } from "lucide-react";
import { Link } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";
import { format, isToday, parseISO, isTomorrow, isThisWeek } from "date-fns";
import { WorkVisaManagementModal } from "../components/WorkVisaManagementModal";

interface InterviewData {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected" | "interview_scheduled";
  interviewDate: string;
  interviewTime: string;
  visaType: string | null;
  embassyLocation: string | null;
  trackingCode: string | null;
  notes: string | null;
  user: {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    phone: string;
  };
}

interface EmbassyTrackingData {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected" | "interview_scheduled";
  trackingCode: string | null;
  applicationDate: string | null;
  interviewDate: string | null;
  interviewTime: string | null;
  visaType: string | null;
  embassyLocation: string | null;
  notes: string | null;
  lastUpdated: string;
  user: {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    phone: string;
  };
}

export default function AdminWorkVisasPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [embassyFilter, setEmbassyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: workVisasData, isLoading: workVisasLoading, refetch } = useQuery({
    queryKey: ["/api/admin/workvisas"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
  });

  // Process data unconditionally to ensure hooks are called in the same order
  const allWorkVisas = ((workVisasData as any)?.workVisas || []);
  
  // Filter interviews that are scheduled
  const interviews: InterviewData[] = useMemo(() => {
    return allWorkVisas
      .filter((item: any) => item.workVisa?.interviewDate && item.workVisa?.interviewTime)
      .map((item: any) => ({
        id: item.workVisa.id,
        userId: item.user.id,
        status: item.workVisa.status,
        interviewDate: item.workVisa.interviewDate,
        interviewTime: item.workVisa.interviewTime,
        visaType: item.workVisa.visaType,
        embassyLocation: item.workVisa.embassyLocation,
        trackingCode: item.workVisa.trackingCode,
        notes: item.workVisa.notes,
        user: item.user,
      }));
  }, [allWorkVisas]);

  // Transform work visa data for embassy tracking
  const embassyApplications: EmbassyTrackingData[] = useMemo(() => {
    return allWorkVisas
      .filter((item: any) => item.workVisa?.embassyLocation || item.workVisa?.trackingCode)
      .map((item: any) => ({
        id: item.workVisa.id,
        userId: item.user.id,
        status: item.workVisa.status,
        trackingCode: item.workVisa.trackingCode,
        applicationDate: item.workVisa.createdAt,
        interviewDate: item.workVisa.interviewDate,
        interviewTime: item.workVisa.interviewTime,
        visaType: item.workVisa.visaType,
        embassyLocation: item.workVisa.embassyLocation,
        notes: item.workVisa.notes,
        lastUpdated: item.workVisa.updatedAt,
        user: item.user,
      }));
  }, [allWorkVisas]);

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const matchesSearch = 
        interview.user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (interview.embassyLocation && interview.embassyLocation.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
      const matchesEmbassy = embassyFilter === "all" || interview.embassyLocation === embassyFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all" && interview.interviewDate) {
        const interviewDate = parseISO(interview.interviewDate);
        switch (dateFilter) {
          case "today":
            matchesDate = isToday(interviewDate);
            break;
          case "tomorrow":
            matchesDate = isTomorrow(interviewDate);
            break;
          case "week":
            matchesDate = isThisWeek(interviewDate);
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesEmbassy && matchesDate;
    });
  }, [interviews, searchTerm, statusFilter, embassyFilter, dateFilter]);

  // Filter embassy applications
  const filteredEmbassyApplications = useMemo(() => {
    return embassyApplications.filter(application => {
      const matchesSearch = 
        application.user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (application.embassyLocation && application.embassyLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (application.trackingCode && application.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const matchesEmbassy = embassyFilter === "all" || application.embassyLocation === embassyFilter;
      
      return matchesSearch && matchesStatus && matchesEmbassy;
    });
  }, [embassyApplications, searchTerm, statusFilter, embassyFilter]);

  // Get unique embassy locations for filter
  const embassyLocations = useMemo(() => {
    const locations = new Set<string>();
    [...interviews, ...embassyApplications].forEach(item => {
      if (item.embassyLocation) {
        locations.add(item.embassyLocation);
      }
    });
    return Array.from(locations).sort();
  }, [interviews, embassyApplications]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparation": return "bg-yellow-100 text-yellow-800";
      case "applied": return "bg-blue-100 text-blue-800";
      case "awaiting_decision": return "bg-orange-100 text-orange-800";
      case "interview_scheduled": return "bg-purple-100 text-purple-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Loading and error states
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
            <Button onClick={() => setLocation("/admin/login")}>
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-gradient-bg min-h-screen">
      {/* Header */}
      <div className="admin-header-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-0.5">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <img src={chefOverseasLogo} alt="Chef Overseas" className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Visa & Immigration Services
                </h1>
                <p className="text-sm text-purple-600/70">Unified Interview & Embassy Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>Unified System</span>
              </div>
              <Button
                onClick={() => refetch()}
                disabled={workVisasLoading}
                className="admin-secondary-btn rounded-full px-4 py-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${workVisasLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setLocation("/admin/dashboard")}
                className="admin-primary-btn rounded-full px-6 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600/70 mb-1">Scheduled Interviews</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {interviews.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Embassy Applications</p>
                  <p className="text-2xl font-bold text-slate-900">{embassyApplications.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Today's Interviews</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {interviews.filter(i => i.interviewDate && isToday(parseISO(i.interviewDate))).length}
                  </p>
                </div>
                <Timer className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Embassies</p>
                  <p className="text-2xl font-bold text-slate-900">{embassyLocations.length}</p>
                </div>
                <MapIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="preparation">Preparation</option>
                  <option value="applied">Applied</option>
                  <option value="awaiting_decision">Awaiting Decision</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={embassyFilter}
                  onChange={(e) => setEmbassyFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="all">All Embassies</option>
                  {embassyLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Work Visa Management Functions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="admin-glass admin-card-hover border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Work Visa Applications</CardTitle>
                  <CardDescription>Manage all work visa applications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Applications</span>
                  <Badge className="bg-blue-100 text-blue-800">{allWorkVisas.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Approved</span>
                  <Badge className="bg-green-100 text-green-800">
                    {allWorkVisas.filter((v: any) => v.workVisa?.status === 'approved').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Pending</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {allWorkVisas.filter((v: any) => v.workVisa?.status === 'awaiting_decision').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Interview Scheduling</CardTitle>
                  <CardDescription>Schedule and manage interviews</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Scheduled Interviews</span>
                  <Badge className="bg-purple-100 text-purple-800">{interviews.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Today's Interviews</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {interviews.filter(i => i.interviewDate && isToday(parseISO(i.interviewDate))).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">This Week</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {interviews.filter(i => i.interviewDate && isThisWeek(parseISO(i.interviewDate))).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-glass admin-card-hover border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Embassy Tracking</CardTitle>
                  <CardDescription>Track embassy applications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Embassy Applications</span>
                  <Badge className="bg-green-100 text-green-800">{embassyApplications.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Embassies</span>
                  <Badge className="bg-indigo-100 text-indigo-800">{embassyLocations.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">With Tracking Code</span>
                  <Badge className="bg-cyan-100 text-cyan-800">
                    {embassyApplications.filter(e => e.trackingCode).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Plane className="h-4 w-4 mr-2" />
              All Work Visas ({allWorkVisas.length})
            </TabsTrigger>
            <TabsTrigger 
              value="interviews" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Interviews ({filteredInterviews.length})
            </TabsTrigger>
            <TabsTrigger 
              value="embassy" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Embassy Tracking ({filteredEmbassyApplications.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - All Work Visas */}
          <TabsContent value="overview" className="space-y-6">
            {allWorkVisas.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                <CardContent className="p-12 text-center">
                  <Plane className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Work Visas Found</h3>
                  <p className="text-slate-600">No work visa applications in the system.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {allWorkVisas.map((item: any) => (
                  <Card key={item.workVisa?.id || item.user.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{item.user.displayName}</h3>
                            <p className="text-sm text-slate-600">{item.user.email}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.workVisa?.status || 'preparation')}>
                          {formatStatus(item.workVisa?.status || 'preparation')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Visa Type</p>
                            <p className="text-sm font-medium">{item.workVisa?.visaType || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Embassy</p>
                            <p className="text-sm font-medium">{item.workVisa?.embassyLocation || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Interview Date</p>
                            <p className="text-sm font-medium">
                              {item.workVisa?.interviewDate 
                                ? format(parseISO(item.workVisa.interviewDate), 'MMM dd, yyyy')
                                : 'Not scheduled'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Tracking Code</p>
                            <p className="text-sm font-medium">{item.workVisa?.trackingCode || 'Not assigned'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <WorkVisaManagementModal 
                          userId={item.user.id}
                          onUpdate={() => refetch()}
                        />
                        <Button
                          onClick={() => setLocation(`/admin/user/${item.user.id}`)}
                          className="admin-secondary-btn"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6">
            {filteredInterviews.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                <CardContent className="p-12 text-center">
                  <CalendarDays className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Interviews Found</h3>
                  <p className="text-slate-600">No interviews match your current search criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredInterviews.map((interview) => (
                  <Card key={interview.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{interview.user.displayName}</h3>
                            <p className="text-sm text-slate-600">{interview.user.email}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(interview.status)}>
                          {formatStatus(interview.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">
                            {interview.interviewDate ? format(parseISO(interview.interviewDate), 'MMM dd, yyyy') : 'Not scheduled'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{interview.interviewTime || 'Time TBD'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{interview.embassyLocation || 'Location TBD'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Plane className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{interview.visaType || 'Type TBD'}</span>
                        </div>
                      </div>
                      
                      {interview.notes && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-700">{interview.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Embassy Tracking Tab */}
          <TabsContent value="embassy" className="space-y-6">
            {filteredEmbassyApplications.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                <CardContent className="p-12 text-center">
                  <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Embassy Applications Found</h3>
                  <p className="text-slate-600">No embassy applications match your current search criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredEmbassyApplications.map((application) => (
                  <Card key={application.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{application.user.displayName}</h3>
                            <p className="text-sm text-slate-600">{application.user.email}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {formatStatus(application.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{application.trackingCode || 'No tracking code'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">
                            {application.applicationDate ? format(parseISO(application.applicationDate), 'MMM dd, yyyy') : 'Date unknown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{application.embassyLocation || 'Location unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Plane className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{application.visaType || 'Type unknown'}</span>
                        </div>
                      </div>

                      {application.interviewDate && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CalendarDays className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Interview: {format(parseISO(application.interviewDate), 'MMM dd, yyyy')} at {application.interviewTime}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {application.notes && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-700">{application.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}