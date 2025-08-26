import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Search, 
  User, 
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Filter,
  Download,
  Upload,
  Users,
  TrendingUp,
  AlertCircle,
  Sparkles,
  FileCheck,
  Phone,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Archive,
  Star
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface DocketData {
  userId: string;
  user: {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    phone: string;
    createdAt: string;
    docketCompleted: boolean;
  };
  docket: {
    id: number;
    userId: string;
    lastUpdated: string;
    passportFrontUrl: string | null;
    passportLastUrl: string | null;
    passportPhotoUrl: string | null;
    resumeUrl: string | null;
    educationFiles: any[];
    experienceFiles: any[];
    offerLetterUrl: string | null;
    permanentAddressUrl: string | null;
    currentAddressUrl: string | null;
    otherCertifications: any[];
    references: any[];
  } | null;
}

export default function AdminDocketsModernPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: docketsData, isLoading: docketsLoading, refetch } = useQuery({
    queryKey: ["/api/admin/dockets"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
  });

  if (adminLoading || docketsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">Loading Docket Management...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Preparing advanced analytics</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const dockets: DocketData[] = (docketsData as any)?.dockets || [];

  // Calculate docket progress for each user
  const calculateDocketProgress = (docket: any) => {
    if (!docket) return { completed: 0, total: 9, percentage: 0 };
    
    const sections = [
      !!docket.passportFrontUrl,
      !!docket.passportLastUrl,
      !!docket.passportPhotoUrl,
      !!docket.resumeUrl,
      docket.educationFiles?.length > 0,
      docket.experienceFiles?.length > 0,
      !!docket.offerLetterUrl,
      !!docket.permanentAddressUrl,
      docket.references?.length >= 2
    ];
    
    const completed = sections.filter(Boolean).length;
    const total = sections.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  // Enhanced filtering and search
  const filteredDockets = useMemo(() => {
    let filtered = dockets.filter(item => {
      const user = item.user;
      const matchesSearch = 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uid?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      const progress = calculateDocketProgress(item.docket);
      
      switch (selectedFilter) {
        case "completed":
          return progress.percentage === 100;
        case "in-progress":
          return progress.percentage > 0 && progress.percentage < 100;
        case "not-started":
          return progress.percentage === 0;
        case "high-priority":
          return progress.percentage > 50 && progress.percentage < 100;
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      const progressA = calculateDocketProgress(a.docket);
      const progressB = calculateDocketProgress(b.docket);
      return progressB.percentage - progressA.percentage;
    });
  }, [dockets, searchTerm, selectedFilter]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = dockets.length;
    const completed = dockets.filter(item => calculateDocketProgress(item.docket).percentage === 100).length;
    const inProgress = dockets.filter(item => {
      const progress = calculateDocketProgress(item.docket);
      return progress.percentage > 0 && progress.percentage < 100;
    }).length;
    const notStarted = dockets.filter(item => calculateDocketProgress(item.docket).percentage === 0).length;
    
    return { total, completed, inProgress, notStarted };
  }, [dockets]);

  const getDocketStatusBadge = (progress: { completed: number; total: number; percentage: number }) => {
    if (progress.percentage === 100) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      );
    } else if (progress.percentage > 70) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
          <Clock className="h-3 w-3 mr-1" />
          Nearly Done
        </Badge>
      );
    } else if (progress.percentage > 30) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
          <Upload className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    } else if (progress.percentage > 0) {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
          <FileText className="h-3 w-3 mr-1" />
          Started
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0 shadow-lg">
          <AlertCircle className="h-3 w-3 mr-1" />
          Not Started
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
                    Docket Management Center
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Advanced document portfolio oversight
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
                <Users className="h-3 w-3 mr-1" />
                {stats.total} Active Portfolios
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Dockets</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-blue-100 text-xs mt-1">Active portfolios</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                  <p className="text-green-100 text-xs mt-1">{Math.round((stats.completed / stats.total) * 100) || 0}% completion rate</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                  <p className="text-orange-100 text-xs mt-1">Active work</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Not Started</p>
                  <p className="text-3xl font-bold">{stats.notStarted}</p>
                  <p className="text-purple-100 text-xs mt-1">Awaiting action</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <AlertCircle className="h-8 w-8" />
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
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="all">All Dockets</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="high-priority">High Priority</option>
                    <option value="not-started">Not Started</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dockets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDockets.map((item) => {
            const progress = calculateDocketProgress(item.docket);
            
            return (
              <Card 
                key={item.userId} 
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
                          {item.user.displayName}
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          ID: {item.user.uid}
                        </p>
                      </div>
                    </div>
                    {getDocketStatusBadge(progress)}
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{item.user.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{item.user.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created {format(new Date(item.user.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Progress: {progress.completed}/{progress.total} sections
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {progress.percentage}%
                      </span>
                    </div>
                    <Progress 
                      value={progress.percentage} 
                      className="h-3 bg-slate-200 dark:bg-slate-700"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      {item.docket?.lastUpdated && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Updated {format(new Date(item.docket.lastUpdated), "MMM dd")}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link href={`/admin/docket-detail/${item.user.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDockets.length === 0 && (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No dockets found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || selectedFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "There are no user dockets in the system yet."}
              </p>
              {(searchTerm || selectedFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFilter("all");
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