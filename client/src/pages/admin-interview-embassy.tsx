import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Video,
  Building,
  Building2,
  ExternalLink,
  TrendingUp,
  Users,
  CalendarDays,
  Timer,
  MapIcon,
  FileCheck,
  Eye
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface InterviewData {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected" | "interview_scheduled";
  interviewDate: string | null;
  interviewTime: string | null;
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

export default function AdminInterviewEmbassyPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [embassyFilter, setEmbassyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("interviews");

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

      const matchesDateFilter = (() => {
        if (dateFilter === "all") return true;
        if (!interview.interviewDate) return false;
        
        const interviewDate = parseISO(interview.interviewDate);
        switch (dateFilter) {
          case "today": return isToday(interviewDate);
          case "tomorrow": return isTomorrow(interviewDate);
          case "week": return isThisWeek(interviewDate);
          default: return true;
        }
      })();

      const matchesEmbassy = embassyFilter === "all" || interview.embassyLocation === embassyFilter;

      return matchesSearch && matchesDateFilter && matchesEmbassy;
    });
  }, [interviews, searchTerm, dateFilter, embassyFilter]);

  // Filter embassy applications
  const filteredEmbassyApplications = useMemo(() => {
    return embassyApplications.filter(app => {
      const matchesSearch = 
        app.user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.trackingCode && app.trackingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.embassyLocation && app.embassyLocation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesEmbassy = embassyFilter === "all" || app.embassyLocation === embassyFilter;

      return matchesSearch && matchesStatus && matchesEmbassy;
    });
  }, [embassyApplications, searchTerm, statusFilter, embassyFilter]);

  // Get unique embassy locations
  const embassyLocations = useMemo(() => {
    const locations = new Set<string>();
    allWorkVisas.forEach((item: any) => {
      if (item.workVisa?.embassyLocation) {
        locations.add(item.workVisa.embassyLocation);
      }
    });
    return Array.from(locations);
  }, [allWorkVisas]);

  const getStatusColor = (status: string) => {
    const colors = {
      'preparation': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'applied': 'bg-blue-100 text-blue-800 border-blue-200',
      'awaiting_decision': 'bg-purple-100 text-purple-800 border-purple-200',
      'interview_scheduled': 'bg-orange-100 text-orange-800 border-orange-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyBadge = (interviewDate: string | null) => {
    if (!interviewDate) return null;
    
    const date = parseISO(interviewDate);
    if (isToday(date)) return <Badge className="bg-red-500 text-white">Today</Badge>;
    if (isTomorrow(date)) return <Badge className="bg-orange-500 text-white">Tomorrow</Badge>;
    if (isThisWeek(date)) return <Badge className="bg-yellow-500 text-white">This Week</Badge>;
    return null;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin")}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Visa & Immigration Services</h1>
                  <p className="text-sm text-slate-600">Unified management for interviews and embassy applications</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={workVisasLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${workVisasLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Scheduled Interviews</p>
                  <p className="text-2xl font-bold text-slate-900">{interviews.length}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="interviews" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Interviews ({filteredInterviews.length})</span>
            </TabsTrigger>
            <TabsTrigger value="embassy" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Embassy Tracking ({filteredEmbassyApplications.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <div className="space-y-4">
              {workVisasLoading ? (
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Loading interviews...</p>
                  </CardContent>
                </Card>
              ) : filteredInterviews.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Scheduled Interviews</h3>
                    <p className="text-slate-600">No interviews match your current filters.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredInterviews.map((interview) => (
                  <Card key={interview.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-slate-600" />
                              <span className="font-semibold text-slate-900">{interview.user.displayName}</span>
                            </div>
                            <Badge className={getStatusColor(interview.status)}>
                              {interview.status.replace('_', ' ')}
                            </Badge>
                            {getUrgencyBadge(interview.interviewDate)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span>{interview.interviewDate ? format(parseISO(interview.interviewDate), 'MMM dd, yyyy') : 'Not scheduled'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <span>{interview.interviewTime || 'No time set'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span>{interview.embassyLocation || 'Location TBD'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <span>{interview.visaType || 'Standard Visa'}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{interview.user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{interview.user.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/admin/workvisas/${interview.userId}`)}
                            className="flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Embassy Tracking Tab */}
          <TabsContent value="embassy">
            <div className="space-y-4">
              {workVisasLoading ? (
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Loading embassy applications...</p>
                  </CardContent>
                </Card>
              ) : filteredEmbassyApplications.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Embassy Applications</h3>
                    <p className="text-slate-600">No applications match your current filters.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredEmbassyApplications.map((application) => (
                  <Card key={application.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-slate-600" />
                              <span className="font-semibold text-slate-900">{application.user.displayName}</span>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace('_', ' ')}
                            </Badge>
                            {application.trackingCode && (
                              <Badge variant="outline" className="text-xs">
                                {application.trackingCode}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-slate-500" />
                              <span>{application.embassyLocation || 'No embassy assigned'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileCheck className="h-4 w-4 text-slate-500" />
                              <span>{application.visaType || 'Standard Visa'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span>
                                {application.applicationDate ? format(parseISO(application.applicationDate), 'MMM dd, yyyy') : 'Not applied'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <span>
                                Updated {application.lastUpdated ? format(parseISO(application.lastUpdated), 'MMM dd') : 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{application.user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{application.user.phone}</span>
                            </div>
                          </div>
                          {application.interviewDate && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                              <div className="flex items-center space-x-2 text-sm">
                                <Video className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-900">
                                  Interview: {format(parseISO(application.interviewDate), 'MMM dd, yyyy')}
                                  {application.interviewTime && ` at ${application.interviewTime}`}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col lg:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/admin/workvisas/${application.userId}`)}
                            className="flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}