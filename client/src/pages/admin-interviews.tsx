import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Building
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

export default function AdminInterviewsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
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

  // Early returns for loading and authentication
  if (adminLoading || workVisasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">Loading Interview Management...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Preparing interview schedules</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const allWorkVisas = ((workVisasData as any)?.workVisas || []);
  
  // Filter only interviews that are scheduled
  const interviews: InterviewData[] = allWorkVisas
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
      user: item.user
    }));

  // Filter and search interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const matchesSearch = !searchTerm || 
        interview.user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.user.phone?.includes(searchTerm) ||
        interview.embassyLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.visaType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase());

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
          case "this-week":
            matchesDate = isThisWeek(interviewDate);
            break;
        }
      }

      return matchesSearch && matchesEmbassy && matchesDate;
    }).sort((a, b) => {
      // Sort by interview date, earliest first
      if (!a.interviewDate) return 1;
      if (!b.interviewDate) return -1;
      return new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime();
    });
  }, [interviews, searchTerm, dateFilter, embassyFilter]);

  // Get unique embassies for filter
  const uniqueEmbassies = Array.from(new Set(interviews.map(i => i.embassyLocation).filter(Boolean)));

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    const todayInterviews = interviews.filter(i => i.interviewDate && isToday(parseISO(i.interviewDate)));
    const tomorrowInterviews = interviews.filter(i => i.interviewDate && isTomorrow(parseISO(i.interviewDate)));
    const thisWeekInterviews = interviews.filter(i => i.interviewDate && isThisWeek(parseISO(i.interviewDate)));
    const pendingInterviews = interviews.filter(i => i.status === "interview_scheduled");

    return {
      total: interviews.length,
      today: todayInterviews.length,
      tomorrow: tomorrowInterviews.length,
      thisWeek: thisWeekInterviews.length,
      pending: pendingInterviews.length
    };
  }, [interviews]);

  const getInterviewStatusBadge = (interview: InterviewData) => {
    if (!interview.interviewDate) return null;
    
    const interviewDate = parseISO(interview.interviewDate);
    
    if (isToday(interviewDate)) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
          <Clock className="h-3 w-3 mr-1" />
          Today
        </Badge>
      );
    } else if (isTomorrow(interviewDate)) {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 shadow-lg">
          <Calendar className="h-3 w-3 mr-1" />
          Tomorrow
        </Badge>
      );
    } else if (isThisWeek(interviewDate)) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
          <Calendar className="h-3 w-3 mr-1" />
          This Week
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0 shadow-lg">
          <Calendar className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    }
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
                    Interview Management Center
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Comprehensive interview scheduling and tracking
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
                <Video className="h-3 w-3 mr-1" />
                {stats.total} Scheduled Interviews
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Interviews</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-blue-100 text-xs mt-1">Scheduled</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Calendar className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Today</p>
                  <p className="text-3xl font-bold">{stats.today}</p>
                  <p className="text-red-100 text-xs mt-1">Urgent</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Tomorrow</p>
                  <p className="text-3xl font-bold">{stats.tomorrow}</p>
                  <p className="text-orange-100 text-xs mt-1">Upcoming</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <AlertCircle className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">This Week</p>
                  <p className="text-3xl font-bold">{stats.thisWeek}</p>
                  <p className="text-cyan-100 text-xs mt-1">Active</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Video className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                  <p className="text-purple-100 text-xs mt-1">Status update</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, embassy, visa type, or tracking code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this-week">This Week</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <select
                    value={embassyFilter}
                    onChange={(e) => setEmbassyFilter(e.target.value)}
                    className="px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="all">All Embassies</option>
                    {uniqueEmbassies.map(embassy => (
                      <option key={embassy} value={embassy || ""}>{embassy}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInterviews.map((interview) => (
            <Card 
              key={interview.id} 
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
                        {interview.user.displayName}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        ID: {interview.user.uid}
                      </p>
                    </div>
                  </div>
                  {getInterviewStatusBadge(interview)}
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{interview.user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{interview.user.phone}</span>
                  </div>
                  {interview.embassyLocation && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{interview.embassyLocation}</span>
                    </div>
                  )}
                  {interview.visaType && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{interview.visaType}</span>
                    </div>
                  )}
                </div>

                {interview.interviewDate && interview.interviewTime && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Interview Scheduled
                        </p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {format(parseISO(interview.interviewDate), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          at {interview.interviewTime}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    {interview.trackingCode && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        #{interview.trackingCode}
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
        {filteredInterviews.length === 0 && (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No interviews found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || dateFilter !== "all" || embassyFilter !== "all"
                  ? "Try adjusting your search or filter criteria." 
                  : "There are no scheduled interviews at this time."}
              </p>
              {(searchTerm || dateFilter !== "all" || embassyFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("all");
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