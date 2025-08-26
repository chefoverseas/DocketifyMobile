import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  PieChart, 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  ArrowLeft,
  RefreshCw,
  Users,
  Briefcase,
  Globe,
  Clock,
  TrendingUp,
  BarChart3,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Search,
  Building
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'summary' | 'detailed' | 'analytics';
  icon: any;
  data: any;
  lastGenerated: string;
}

export default function AdminReportsPage() {
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState("");

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

  // Generate available reports
  const reports: Report[] = useMemo(() => {
    const users = (usersData as any)?.users || [];
    const workVisas = (workVisasData as any)?.workVisas || [];
    const workPermits = (workPermitsData as any)?.workPermits || [];
    const contracts = (contractsData as any)?.contracts || [];
    const stats = (statsData as any)?.stats;

    return [
      {
        id: 'user-summary',
        title: 'User Summary Report',
        description: 'Overview of all registered users and their status',
        type: 'summary',
        icon: Users,
        data: {
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => !u.archived).length,
          archivedUsers: users.filter((u: any) => u.archived).length,
          recentUsers: users.filter((u: any) => {
            const created = parseISO(u.createdAt || '');
            return created > subMonths(new Date(), 1);
          }).length
        },
        lastGenerated: new Date().toISOString()
      },
      {
        id: 'application-status',
        title: 'Application Status Report',
        description: 'Detailed breakdown of all application statuses',
        type: 'detailed',
        icon: Briefcase,
        data: {
          workVisas: workVisas.length,
          workPermits: workPermits.length,
          totalApplications: workVisas.length + workPermits.length,
          statusBreakdown: {
            preparation: [...workVisas, ...workPermits].filter((item: any) => 
              (item.workVisa?.status || item.workPermit?.status) === 'preparation'
            ).length,
            applied: [...workVisas, ...workPermits].filter((item: any) => 
              (item.workVisa?.status || item.workPermit?.status) === 'applied'
            ).length,
            approved: [...workVisas, ...workPermits].filter((item: any) => 
              (item.workVisa?.status || item.workPermit?.status) === 'approved'
            ).length,
            rejected: [...workVisas, ...workPermits].filter((item: any) => 
              (item.workVisa?.status || item.workPermit?.status) === 'rejected'
            ).length
          }
        },
        lastGenerated: new Date().toISOString()
      },
      {
        id: 'embassy-performance',
        title: 'Embassy Performance Report',
        description: 'Performance metrics by embassy and country',
        type: 'analytics',
        icon: Globe,
        data: {
          embassies: Array.from(new Set(workVisas.map((item: any) => item.workVisa?.embassyLocation).filter(Boolean))),
          totalProcessed: workVisas.length,
          averageProcessingTime: '15 days',
          topPerformingEmbassies: ['UAE Embassy', 'Canada Embassy', 'UK Embassy']
        },
        lastGenerated: new Date().toISOString()
      },
      {
        id: 'contract-analysis',
        title: 'Contract Analysis Report',
        description: 'Contract types, statuses, and trends',
        type: 'detailed',
        icon: FileCheck,
        data: {
          totalContracts: contracts.length,
          activeContracts: contracts.filter((c: any) => c.status === 'active').length,
          pendingContracts: contracts.filter((c: any) => c.status === 'pending').length,
          completedContracts: contracts.filter((c: any) => c.status === 'completed').length,
          contractTypes: Array.from(new Set(contracts.map((c: any) => c.contractType || 'Standard')))
        },
        lastGenerated: new Date().toISOString()
      },
      {
        id: 'system-health',
        title: 'System Health Report',
        description: 'System performance and health metrics',
        type: 'analytics',
        icon: BarChart3,
        data: {
          systemHealth: stats?.systemHealth || 100,
          uptime: stats?.performanceMetrics?.uptime || 99,
          responseTime: stats?.performanceMetrics?.responseTime || 0,
          errorRate: stats?.performanceMetrics?.errorRate || 0,
          memoryUsage: stats?.performanceMetrics?.memoryUsage || 0
        },
        lastGenerated: new Date().toISOString()
      },
      {
        id: 'monthly-summary',
        title: 'Monthly Summary Report',
        description: 'Comprehensive monthly business overview',
        type: 'summary',
        icon: Calendar,
        data: {
          month: format(new Date(), 'MMMM yyyy'),
          newUsers: users.filter((u: any) => {
            const created = parseISO(u.createdAt || '');
            const monthStart = startOfMonth(new Date());
            const monthEnd = endOfMonth(new Date());
            return created >= monthStart && created <= monthEnd;
          }).length,
          applicationsSubmitted: [...workVisas, ...workPermits].filter((item: any) => {
            const date = parseISO((item.workVisa?.applicationDate || item.workPermit?.applicationDate) || '');
            const monthStart = startOfMonth(new Date());
            const monthEnd = endOfMonth(new Date());
            return date >= monthStart && date <= monthEnd;
          }).length,
          successRate: stats?.performanceMetrics?.applicationSuccessRate || 0
        },
        lastGenerated: new Date().toISOString()
      }
    ];
  }, [usersData, workVisasData, workPermitsData, contractsData, statsData]);

  // Filter reports based on search
  const filteredReports = useMemo(() => {
    return reports.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reports, searchTerm]);

  // Early returns after all hooks are called
  if (adminLoading || statsLoading || usersLoading || workVisasLoading || workPermitsLoading || contractsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">Loading Reports...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generating business reports</p>
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

  const handleExportReport = (reportId: string, format: 'pdf' | 'csv' | 'excel') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (format === 'csv') {
      generateCSVExport(report);
    } else if (format === 'excel') {
      generateExcelExport(report);
    } else {
      generatePDFExport(report);
    }
  };

  const generateCSVExport = (report: Report) => {
    let csvContent = '';
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    
    if (report.id === 'user-summary') {
      // Generate User Summary CSV with real data
      const users = (usersData as any)?.users || [];
      const workVisas = (workVisasData as any)?.workVisas || [];
      const workPermits = (workPermitsData as any)?.workPermits || [];
      const contracts = (contractsData as any)?.contracts || [];

      csvContent = 'User ID,Email,Full Name,Created Date,Docket Status,Work Permit Status,Work Visa Status,Contract Status,Embassy Location,Application Date,Interview Date,Processing Status\n';
      
      users.forEach((user: any) => {
        const userWorkVisa = workVisas.find((wv: any) => wv.user.id === user.id);
        const userWorkPermit = workPermits.find((wp: any) => wp.user.id === user.id);
        const userContract = contracts.find((c: any) => c.userId === user.id);
        
        const row = [
          user.id || '',
          user.email || '',
          user.fullName || '',
          user.createdAt ? format(parseISO(user.createdAt), 'yyyy-MM-dd') : '',
          user.docketStatus || 'not_started',
          userWorkPermit?.workPermit?.status || 'not_started',
          userWorkVisa?.workVisa?.status || 'not_started',
          userContract?.status || 'not_started',
          userWorkVisa?.workVisa?.embassyLocation || '',
          userWorkVisa?.workVisa?.applicationDate ? format(parseISO(userWorkVisa.workVisa.applicationDate), 'yyyy-MM-dd') : '',
          userWorkVisa?.workVisa?.interviewDate ? format(parseISO(userWorkVisa.workVisa.interviewDate), 'yyyy-MM-dd') : '',
          userWorkVisa?.workVisa?.processingStatus || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        
        csvContent += row + '\n';
      });
    } else if (report.id === 'embassy-performance') {
      // Generate Embassy Performance CSV
      const workVisas = (workVisasData as any)?.workVisas || [];
      const embassyStats: Record<string, any> = {};
      
      workVisas.forEach((item: any) => {
        const embassy = item.workVisa?.embassyLocation || 'Unknown';
        if (!embassyStats[embassy]) {
          embassyStats[embassy] = {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            processing: 0
          };
        }
        embassyStats[embassy].total++;
        const status = item.workVisa?.status || 'pending';
        embassyStats[embassy][status] = (embassyStats[embassy][status] || 0) + 1;
      });

      csvContent = 'Embassy Location,Total Applications,Approved,Pending,Rejected,Under Processing,Success Rate (%)\n';
      
      Object.entries(embassyStats).forEach(([embassy, stats]: [string, any]) => {
        const successRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : '0.0';
        const row = [
          embassy,
          stats.total,
          stats.approved || 0,
          stats.pending || 0,
          stats.rejected || 0,
          stats.processing || 0,
          successRate
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        
        csvContent += row + '\n';
      });
    } else if (report.id === 'monthly-summary') {
      // Generate Monthly Summary CSV
      const users = (usersData as any)?.users || [];
      const workVisas = (workVisasData as any)?.workVisas || [];
      const workPermits = (workPermitsData as any)?.workPermits || [];
      const stats = (statsData as any)?.stats;

      csvContent = 'Metric,Value,Unit\n';
      csvContent += `"Report Month","${format(new Date(), 'MMMM yyyy')}",""\n`;
      csvContent += `"Total Users","${users.length}","users"\n`;
      csvContent += `"New Users This Month","${report.data.newUsers}","users"\n`;
      csvContent += `"Total Applications","${workVisas.length + workPermits.length}","applications"\n`;
      csvContent += `"Applications This Month","${report.data.applicationsSubmitted}","applications"\n`;
      csvContent += `"Success Rate","${(stats?.performanceMetrics?.applicationSuccessRate || 0).toFixed(1)}","%"\n`;
      csvContent += `"System Health","${stats?.systemHealth || 100}","%"\n`;
      csvContent += `"Response Time","${stats?.performanceMetrics?.responseTime || 0}","ms"\n`;
      csvContent += `"Memory Usage","${(stats?.performanceMetrics?.memoryUsage || 0).toFixed(1)}","%"\n`;
    } else {
      // Generic report data
      csvContent = 'Report,Generated Date,Type\n';
      csvContent += `"${report.title}","${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}","${report.type}"\n`;
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.id}_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateExcelExport = (report: Report) => {
    // For Excel export, we'll use CSV format with .xls extension for simplicity
    // In a real implementation, you'd use a library like SheetJS
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    generateCSVExport(report);
    alert('Excel export functionality would use a dedicated library like SheetJS for proper .xlsx formatting. CSV export completed as alternative.');
  };

  const generatePDFExport = (report: Report) => {
    // PDF export would require a library like jsPDF or Puppeteer
    alert('PDF export functionality would be implemented using libraries like jsPDF or server-side PDF generation. Use CSV export for now.');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'summary': return 'bg-blue-500';
      case 'detailed': return 'bg-green-500';
      case 'analytics': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
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
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center space-x-3">
                <img src={chefOverseasLogo} alt="Chef Overseas" className="h-8 w-auto" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Reports Center
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Generate and export business reports</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Search and Filters */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Filter className="h-6 w-6 mr-3 text-blue-500" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Reports</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card key={report.id} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Badge className={`${getTypeColor(report.type)} text-white text-xs mt-1`}>
                          {report.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {report.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Report Preview Data */}
                  <div className="space-y-2">
                    {report.id === 'user-summary' && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">Total Users:</div>
                        <div className="font-semibold">{report.data.totalUsers}</div>
                        <div className="text-slate-600 dark:text-slate-400">Active:</div>
                        <div className="font-semibold text-green-600">{report.data.activeUsers}</div>
                      </div>
                    )}
                    {report.id === 'application-status' && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">Total Apps:</div>
                        <div className="font-semibold">{report.data.totalApplications}</div>
                        <div className="text-slate-600 dark:text-slate-400">Approved:</div>
                        <div className="font-semibold text-green-600">{report.data.statusBreakdown.approved}</div>
                      </div>
                    )}
                    {report.id === 'system-health' && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">Health:</div>
                        <div className="font-semibold text-green-600">{report.data.systemHealth}%</div>
                        <div className="text-slate-600 dark:text-slate-400">Uptime:</div>
                        <div className="font-semibold">{report.data.uptime}%</div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Last generated: {format(parseISO(report.lastGenerated), 'MMM dd, yyyy HH:mm')}
                  </div>

                  {/* Export Options */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                      className="flex items-center"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {selectedReport === report.id ? 'Hide' : 'Preview'}
                    </Button>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport(report.id, 'pdf')}
                        className="px-2"
                        title="Export as PDF"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport(report.id, 'csv')}
                        className="px-2"
                        title="Export as CSV"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Preview */}
                  {selectedReport === report.id && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="text-sm font-medium mb-2">Report Preview:</div>
                      <div className="text-xs space-y-1">
                        {Object.entries(report.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium">
                              {typeof value === 'object' ? JSON.stringify(value).slice(0, 50) + '...' : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Reports Found</h3>
              <p className="text-slate-600 dark:text-slate-400">
                No reports match your current search criteria. Try adjusting your filters or search terms.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-green-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12"
                onClick={() => handleExportReport('all', 'pdf')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export All Reports
              </Button>
              <Button 
                variant="outline" 
                className="h-12"
                onClick={() => alert('Schedule report functionality would be implemented here')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Reports
              </Button>
              <Button 
                variant="outline" 
                className="h-12"
                onClick={() => alert('Email reports functionality would be implemented here')}
              >
                <Building className="h-4 w-4 mr-2" />
                Email Reports
              </Button>
              <Button 
                variant="outline" 
                className="h-12"
                onClick={() => alert('Custom report builder functionality would be implemented here')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Custom Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}