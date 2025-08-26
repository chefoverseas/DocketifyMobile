import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Clock, 
  Globe,
  ArrowLeft,
  RefreshCw,
  Calendar,
  PieChart,
  LineChart,
  Target,
  Award,
  MapPin,
  Briefcase,
  Activity,
  Download
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format, subDays, parseISO } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function AdminAnalyticsPage() {
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: statsData, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!(adminData as any)?.admin,
    refetchInterval: 30000,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!(adminData as any)?.admin,
  });

  const { data: workVisasData, isLoading: workVisasLoading } = useQuery({
    queryKey: ["/api/admin/workvisas"],
    enabled: !!(adminData as any)?.admin,
  });

  const { data: workPermitsData, isLoading: workPermitsLoading } = useQuery({
    queryKey: ["/api/admin/workpermits"],
    enabled: !!(adminData as any)?.admin,
  });

  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/admin/contracts"],
    enabled: !!(adminData as any)?.admin,
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    const users = (usersData as any)?.users || [];
    const workVisas = (workVisasData as any)?.workVisas || [];
    const workPermits = (workPermitsData as any)?.workPermits || [];
    const contracts = (contractsData as any)?.contracts || [];

    // Application status distribution
    const applicationStatuses = {
      preparation: 0,
      applied: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      interview_scheduled: 0
    };

    [...workVisas, ...workPermits].forEach(item => {
      const status = item.workVisa?.status || item.workPermit?.status;
      if (status && applicationStatuses.hasOwnProperty(status)) {
        applicationStatuses[status as keyof typeof applicationStatuses]++;
      }
    });

    // Embassy/Country distribution
    const countryStats: Record<string, number> = {};
    workVisas.forEach((item: any) => {
      const embassy = item.workVisa?.embassyLocation;
      if (embassy) {
        countryStats[embassy] = (countryStats[embassy] || 0) + 1;
      }
    });

    // Contract types
    const contractTypes: Record<string, number> = {};
    contracts.forEach((contract: any) => {
      const type = contract.contractType || 'Standard';
      contractTypes[type] = (contractTypes[type] || 0) + 1;
    });

    // Success rates
    const totalApplications = workVisas.length + workPermits.length;
    const approvedApplications = applicationStatuses.approved;
    const successRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;

    // Recent activity (last 7 days)
    const recentDate = subDays(new Date(), 7);
    const recentUsers = users.filter((user: any) => 
      user.createdAt && parseISO(user.createdAt) > recentDate
    );

    return {
      totalUsers: users.length,
      totalApplications,
      approvedApplications,
      successRate,
      applicationStatuses,
      countryStats,
      contractTypes,
      recentUsers: recentUsers.length,
      averageProcessingTime: 15, // Mock data - days
      topCountries: Object.entries(countryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      monthlyGrowth: 12.5 // Mock percentage
    };
  }, [usersData, workVisasData, workPermitsData, contractsData]);

  // Early returns after all hooks are called
  if (adminLoading || statsLoading || usersLoading || workVisasLoading || workPermitsLoading || contractsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">Loading Analytics...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generating insights and reports</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center space-x-3">
                <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-auto" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Business intelligence and performance insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {analytics.totalUsers}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{analytics.monthlyGrowth}%</span>
                  </div>
                </div>
                <Users className="h-12 w-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Applications</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {analytics.totalApplications}
                  </p>
                  <div className="flex items-center mt-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                  </div>
                </div>
                <Briefcase className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {analytics.successRate.toFixed(1)}%
                  </p>
                  <div className="flex items-center mt-2">
                    <Award className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600">Approved</span>
                  </div>
                </div>
                <Target className="h-12 w-12 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Processing</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {analytics.averageProcessingTime}d
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600">Days</span>
                  </div>
                </div>
                <Activity className="h-12 w-12 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <PieChart className="h-6 w-6 mr-3 text-blue-500" />
                Application Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.applicationStatuses).map(([status, count]) => {
                  const percentage = analytics.totalApplications > 0 ? (count / analytics.totalApplications) * 100 : 0;
                  const colors = {
                    preparation: 'bg-yellow-500',
                    applied: 'bg-blue-500',
                    under_review: 'bg-orange-500',
                    approved: 'bg-green-500',
                    rejected: 'bg-red-500',
                    interview_scheduled: 'bg-purple-500'
                  };
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`}></div>
                        <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{count}</span>
                        <div className="w-20">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-xs text-slate-500 w-10">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Globe className="h-6 w-6 mr-3 text-green-500" />
                Top Countries by Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCountries.map(([country, count], index) => {
                  const percentage = analytics.totalApplications > 0 ? (count / analytics.totalApplications) * 100 : 0;
                  const badgeColors = ['bg-gold-500', 'bg-silver-500', 'bg-bronze-500', 'bg-blue-500', 'bg-purple-500'];
                  
                  return (
                    <div key={country} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${badgeColors[index] || 'bg-gray-500'} text-white text-xs px-2 py-1`}>
                          #{index + 1}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">{country}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{count}</span>
                        <div className="w-16">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-xs text-slate-500 w-10">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
                {analytics.topCountries.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No country data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <LineChart className="h-6 w-6 mr-3 text-purple-500" />
              Performance Trends & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                  <Badge className="bg-blue-500 text-white">7 days</Badge>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{analytics.recentUsers}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">New users registered</div>
              </div>

              {/* Contract Types */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Active Contracts</h3>
                  <Badge className="bg-green-500 text-white">Total</Badge>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Object.values(analytics.contractTypes).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Contract agreements</div>
              </div>

              {/* Success Rate Trend */}
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Success Rate</h3>
                  <Badge className="bg-orange-500 text-white">Overall</Badge>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">{analytics.successRate.toFixed(1)}%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Application approval rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Download className="h-6 w-6 mr-3 text-indigo-500" />
              Export & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center h-12"
                onClick={() => {
                  // Mock export functionality
                  alert('PDF report export functionality would be implemented here');
                }}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Export PDF Report
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center h-12"
                onClick={() => {
                  // Mock export functionality
                  alert('CSV data export functionality would be implemented here');
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Export CSV Data
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center h-12"
                onClick={() => {
                  // Mock export functionality
                  alert('Analytics dashboard export functionality would be implemented here');
                }}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Export Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}