import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
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
  Clock,
  User,
  ExternalLink,
  Calendar,
  TrendingUp,
  Users
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

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

export default function AdminEmbassyTrackingPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [embassyFilter, setEmbassyFilter] = useState("all");

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
  
  // Transform work visa data for embassy tracking
  const embassyApplications: EmbassyTrackingData[] = useMemo(() => {
    return allWorkVisas
      .filter((item: any) => item.workVisa?.embassyLocation || item.workVisa?.trackingCode)
      .map((item: any) => ({
        id: item.workVisa.id,
        userId: item.user.id,
        status: item.workVisa.status,
        trackingCode: item.workVisa.trackingCode,
        applicationDate: item.workVisa.applicationDate,
        interviewDate: item.workVisa.interviewDate,
        interviewTime: item.workVisa.interviewTime,
        visaType: item.workVisa.visaType,
        embassyLocation: item.workVisa.embassyLocation,
        notes: item.workVisa.notes,
        lastUpdated: item.workVisa.lastUpdated,
        user: item.user
      }));
  }, [allWorkVisas]);

  // Filter and search applications
  const filteredApplications = useMemo(() => {
    return embassyApplications.filter(application => {
      const matchesSearch = !searchTerm || 
        application.user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.user.phone?.includes(searchTerm) ||
        application.embassyLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.visaType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const matchesEmbassy = embassyFilter === "all" || application.embassyLocation === embassyFilter;

      return matchesSearch && matchesStatus && matchesEmbassy;
    }).sort((a, b) => {
      // Sort by last updated, most recent first
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });
  }, [embassyApplications, searchTerm, statusFilter, embassyFilter]);

  // Get unique embassies for filter
  const uniqueEmbassies = Array.from(new Set(embassyApplications.map(a => a.embassyLocation).filter(Boolean)));

  // Calculate embassy statistics
  const embassyStats = useMemo(() => {
    const stats: Record<string, any> = {};
    
    uniqueEmbassies.forEach(embassy => {
      if (!embassy) return;
      const embassyApps = embassyApplications.filter(a => a.embassyLocation === embassy);
      stats[embassy] = {
        total: embassyApps.length,
        applied: embassyApps.filter(a => a.status === "applied").length,
        awaiting: embassyApps.filter(a => a.status === "awaiting_decision").length,
        interview: embassyApps.filter(a => a.status === "interview_scheduled").length,
        approved: embassyApps.filter(a => a.status === "approved").length,
        rejected: embassyApps.filter(a => a.status === "rejected").length,
      };
    });
    
    return stats;
  }, [embassyApplications, uniqueEmbassies]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const total = embassyApplications.length;
    const withTracking = embassyApplications.filter(a => a.trackingCode).length;
    const applied = embassyApplications.filter(a => a.status === "applied").length;
    const awaiting = embassyApplications.filter(a => a.status === "awaiting_decision").length;
    const approved = embassyApplications.filter(a => a.status === "approved").length;
    const rejected = embassyApplications.filter(a => a.status === "rejected").length;

    return {
      total,
      withTracking,
      applied,
      awaiting,
      approved,
      rejected,
      successRate: total > 0 ? Math.round((approved / total) * 100) : 0
    };
  }, [embassyApplications]);

  // Early returns after all hooks are called
  if (adminLoading || workVisasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">Loading Embassy Tracking...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Preparing embassy analytics</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparation":
        return <Clock className="h-4 w-4 text-slate-500" />;
      case "applied":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "awaiting_decision":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      preparation: { bg: "bg-gradient-to-r from-slate-400 to-slate-500", label: "Preparation" },
      applied: { bg: "bg-gradient-to-r from-blue-500 to-cyan-500", label: "Applied" },
      awaiting_decision: { bg: "bg-gradient-to-r from-yellow-500 to-orange-500", label: "Awaiting Decision" },
      interview_scheduled: { bg: "bg-gradient-to-r from-purple-500 to-pink-500", label: "Interview Scheduled" },
      approved: { bg: "bg-gradient-to-r from-green-500 to-emerald-500", label: "Approved" },
      rejected: { bg: "bg-gradient-to-r from-red-500 to-rose-500", label: "Rejected" }
    };

    const statusConfig = config[status as keyof typeof config] || config.preparation;

    return (
      <Badge className={`${statusConfig.bg} text-white border-0 shadow-lg`}>
        {getStatusIcon(status)}
        <span className="ml-1">{statusConfig.label}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/admin/dashboard")}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Command Center
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-auto brightness-0 invert" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Embassy Tracking Center
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Advanced embassy application monitoring and analytics
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                <Building2 className="h-3 w-3 mr-1" />
                {uniqueEmbassies.length} Embassies
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold">{overallStats.total}</p>
                  <p className="text-blue-100 text-xs mt-1">Embassy submitted</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">With Tracking</p>
                  <p className="text-3xl font-bold">{overallStats.withTracking}</p>
                  <p className="text-purple-100 text-xs mt-1">Tracking codes</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <ExternalLink className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">Applied</p>
                  <p className="text-3xl font-bold">{overallStats.applied}</p>
                  <p className="text-cyan-100 text-xs mt-1">Submitted</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{overallStats.awaiting}</p>
                  <p className="text-yellow-100 text-xs mt-1">Awaiting decision</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold">{overallStats.approved}</p>
                  <p className="text-green-100 text-xs mt-1">Successful</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">{overallStats.successRate}%</p>
                  <p className="text-indigo-100 text-xs mt-1">Approval rate</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embassy Performance Overview */}
        {uniqueEmbassies.length > 0 && (
          <Card className="mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Embassy Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueEmbassies.map(embassy => {
                  const stats = embassyStats[embassy];
                  const successRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
                  
                  return (
                    <div 
                      key={embassy || 'unknown'}
                      className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{embassy || 'Unknown Embassy'}</h3>
                        <Badge variant="outline" className="text-xs">
                          {successRate}% success
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="font-bold text-blue-600">{stats.applied}</p>
                          <p className="text-slate-500">Applied</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">{stats.approved}</p>
                          <p className="text-slate-500">Approved</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-yellow-600">{stats.awaiting}</p>
                          <p className="text-slate-500">Pending</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter Controls */}
        <Card className="mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, embassy, tracking code, or visa type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="applied">Applied</option>
                    <option value="awaiting_decision">Awaiting Decision</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <select
                    value={embassyFilter}
                    onChange={(e) => setEmbassyFilter(e.target.value)}
                    className="px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="all">All Embassies</option>
                    {uniqueEmbassies.map(embassy => (
                      <option key={embassy || 'unknown'} value={embassy || ''}>{embassy || 'Unknown Embassy'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <Card 
              key={application.id} 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {application.user.displayName}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        ID: {application.user.uid}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{application.user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{application.user.phone}</span>
                  </div>
                  {application.embassyLocation && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{application.embassyLocation}</span>
                    </div>
                  )}
                  {application.visaType && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{application.visaType}</span>
                    </div>
                  )}
                </div>

                {application.trackingCode && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Tracking Code
                        </p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {application.trackingCode}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Last updated: {format(parseISO(application.lastUpdated), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <ExternalLink className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    {application.applicationDate && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Applied {format(parseISO(application.applicationDate), "MMM dd")}
                      </span>
                    )}
                  </div>
                  
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/admin/workvisas`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No embassy applications found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || statusFilter !== "all" || embassyFilter !== "all"
                  ? "Try adjusting your search or filter criteria." 
                  : "There are no embassy applications to track at this time."}
              </p>
              {(searchTerm || statusFilter !== "all" || embassyFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setEmbassyFilter("all");
                  }}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}