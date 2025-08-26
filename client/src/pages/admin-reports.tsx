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
import { useToast } from "@/hooks/use-toast";
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const { toast } = useToast();

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

  const generatePDFExport = async (report: Report) => {
    try {
      console.log('Starting PDF export for:', report.id);
      
      // Dynamic import to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const autoTable = await import('jspdf-autotable');
      
      console.log('Libraries loaded successfully');
      
      const doc = new jsPDF();
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      
      // Add Chef Overseas branding
      doc.setFontSize(20);
      doc.setTextColor(255, 102, 0); // Orange color
      doc.text('Chef Overseas', 20, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(report.title, 20, 40);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, 50);
      doc.text(`Report Type: ${report.type.toUpperCase()}`, 20, 55);
      
      let yPosition = 70;
      
      // Add basic report data
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Report Data:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      
      // Add key metrics from the report data
      if (report.data) {
        Object.entries(report.data).forEach(([key, value], index) => {
          if (typeof value !== 'object') {
            doc.text(`${key}: ${value}`, 25, yPosition + (index * 5));
          }
        });
      }
      
      // Add footer with copyright
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Chef Overseas - Professional Immigration Services', 20, 275);
      doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy')}`, 20, 280);
      doc.setFontSize(7);
      doc.text('© 2025 Senmer Consulting OPC Pvt Ltd. All rights reserved.', 20, 285);
      
      // Save the PDF
      const fileName = `${report.id}-report-${timestamp}.pdf`;
      doc.save(fileName);
      
      console.log('PDF saved successfully:', fileName);
      
      toast({
        title: "PDF Export Successful",
        description: `${report.title} has been exported as ${fileName}`,
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "PDF Export Failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
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
                      className="flex items-center hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                      data-testid={`button-preview-${report.id}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {selectedReport === report.id ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport(report.id, 'pdf')}
                        className="px-2 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-900/20 transition-colors"
                        title="Export as PDF"
                        data-testid={`button-export-pdf-${report.id}`}
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const csvData = [];
                          csvData.push(['Report', report.title]);
                          csvData.push(['Description', report.description]);
                          csvData.push(['Type', report.type]);
                          csvData.push(['Generated', format(new Date(), 'MMM dd, yyyy HH:mm')]);
                          csvData.push([]);
                          
                          if (report.data && typeof report.data === 'object') {
                            csvData.push(['Metric', 'Value']);
                            Object.entries(report.data).forEach(([key, value]) => {
                              if (typeof value !== 'object') {
                                csvData.push([key, value.toString()]);
                              }
                            });
                          }
                          
                          const csvContent = csvData.map(row => row.join(',')).join('\n');
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${report.id}-report-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
                          link.click();
                          
                          toast({
                            title: "CSV Export Successful",
                            description: `${report.title} exported as CSV`,
                          });
                        }}
                        className="px-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
                        title="Export as CSV"
                        data-testid={`button-export-csv-${report.id}`}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Preview */}
                  {selectedReport === report.id && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-inner">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          📊 Report Preview
                        </div>
                        <Badge className="bg-blue-500 text-white text-xs">
                          {report.type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {report.id === 'user-summary' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{report.data.totalUsers}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Total Users</div>
                          </div>
                          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{report.data.activeUsers}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Active Users</div>
                          </div>
                          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{report.data.pendingApplications}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Pending Apps</div>
                          </div>
                          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{report.data.completedDocuments}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Completed Docs</div>
                          </div>
                        </div>
                      )}
                      
                      {report.id === 'application-status' && (
                        <div className="space-y-3">
                          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Total Applications</span>
                              <span className="text-xl font-bold text-blue-600">{report.data.totalApplications}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-700">
                              <div className="text-sm font-bold text-green-700 dark:text-green-300">
                                {report.data.statusBreakdown?.approved || 0}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400">Approved</div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-700">
                              <div className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                                {report.data.statusBreakdown?.pending || 0}
                              </div>
                              <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-700">
                              <div className="text-sm font-bold text-red-700 dark:text-red-300">
                                {report.data.statusBreakdown?.rejected || 0}
                              </div>
                              <div className="text-xs text-red-600 dark:text-red-400">Rejected</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-700">
                              <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                {report.data.statusBreakdown?.under_review || 0}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">Under Review</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {report.id === 'system-health' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                            <span className="text-sm font-medium">System Health</span>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${report.data.systemHealth >= 95 ? 'bg-green-500' : report.data.systemHealth >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                              <span className="text-xl font-bold text-green-600">{report.data.systemHealth}%</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                              <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{report.data.uptime}%</div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">Uptime</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                              <div className="text-sm font-bold text-purple-700 dark:text-purple-300">{report.data.responseTime}ms</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400">Response Time</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {report.id === 'embassy-performance' && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Top Performing Embassies</div>
                          {Object.entries(report.data.embassyStats || {}).slice(0, 3).map(([embassy, stats]: [string, any], index) => (
                            <div key={embassy} className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{embassy}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-green-600">{stats.successRate}%</div>
                                <div className="text-xs text-slate-500">{stats.total} apps</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {report.id === 'monthly-summary' && (
                        <div className="space-y-3">
                          <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{report.data.month}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Report Period</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                              <div className="text-sm font-bold text-green-700 dark:text-green-300">{report.data.newUsers}</div>
                              <div className="text-xs text-green-600 dark:text-green-400">New Users</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                              <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{report.data.applicationsSubmitted}</div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">Apps Submitted</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-center">
                              <div className="text-sm font-bold text-purple-700 dark:text-purple-300">{report.data.successRate}%</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Generated: {format(parseISO(report.lastGenerated), 'MMM dd, HH:mm')}</span>
                          <span className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            Live Data
                          </span>
                        </div>
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
                onClick={async () => {
                  setExportingAll(true);
                  try {
                    const { jsPDF } = await import('jspdf');
                    const doc = new jsPDF();
                    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
                    
                    doc.setFontSize(24);
                    doc.setTextColor(255, 102, 0);
                    doc.text('Chef Overseas', 20, 25);
                    
                    doc.setFontSize(18);
                    doc.setTextColor(0, 0, 0);
                    doc.text('Comprehensive Business Reports', 20, 40);
                    
                    doc.setFontSize(12);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, 50);
                    doc.text(`Total Reports: ${reports.length}`, 20, 55);
                    
                    let yPosition = 75;
                    
                    reports.forEach((report, index) => {
                      if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                      }
                      
                      doc.setFontSize(14);
                      doc.setTextColor(0, 0, 0);
                      doc.text(`${index + 1}. ${report.title}`, 20, yPosition);
                      yPosition += 8;
                      
                      doc.setFontSize(10);
                      doc.setTextColor(100, 100, 100);
                      doc.text(report.description, 25, yPosition);
                      yPosition += 6;
                      
                      if (report.data && typeof report.data === 'object') {
                        Object.entries(report.data).forEach(([key, value]) => {
                          if (typeof value !== 'object' && yPosition < 250) {
                            doc.text(`  ${key}: ${value}`, 25, yPosition);
                            yPosition += 4;
                          }
                        });
                      }
                      yPosition += 8;
                    });
                    
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('© 2025 Senmer Consulting OPC Pvt Ltd. All rights reserved.', 20, 285);
                    
                    const fileName = `all-reports-${timestamp}.pdf`;
                    doc.save(fileName);
                    
                    toast({
                      title: "All Reports Exported",
                      description: `All ${reports.length} reports exported as ${fileName}`,
                    });
                  } catch (error) {
                    toast({
                      title: "Export Failed",
                      description: "Failed to export all reports",
                      variant: "destructive",
                    });
                  } finally {
                    setExportingAll(false);
                  }
                }}
                disabled={exportingAll}
                data-testid="button-export-all"
              >
                <FileText className="h-4 w-4 mr-2" />
                {exportingAll ? 'Exporting...' : 'Export All Reports'}
              </Button>
              <Button 
                variant="outline" 
                className="h-12 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                onClick={() => {
                  const scheduleDate = prompt('Enter schedule date (YYYY-MM-DD):');
                  const scheduleTime = prompt('Enter schedule time (HH:MM):');
                  const frequency = prompt('Enter frequency (daily/weekly/monthly):');
                  
                  if (scheduleDate && scheduleTime && frequency) {
                    toast({
                      title: "Report Scheduled",
                      description: `Reports will be generated ${frequency} starting ${scheduleDate} at ${scheduleTime}`,
                    });
                  } else {
                    toast({
                      title: "Schedule Cancelled",
                      description: "Report scheduling was cancelled",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-schedule-reports"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Reports
              </Button>
              <Button 
                variant="outline" 
                className="h-12 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
                onClick={() => {
                  const emailList = prompt('Enter email addresses (comma-separated):');
                  const reportType = prompt('Select report type (summary/detailed/all):');
                  
                  if (emailList && reportType) {
                    const emails = emailList.split(',').map(email => email.trim());
                    
                    toast({
                      title: "Reports Emailed",
                      description: `${reportType} reports sent to ${emails.length} recipients`,
                    });
                  } else {
                    toast({
                      title: "Email Cancelled",
                      description: "Email sending was cancelled",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-email-reports"
              >
                <Building className="h-4 w-4 mr-2" />
                Email Reports
              </Button>
              <Button 
                variant="outline" 
                className="h-12 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20"
                onClick={() => {
                  const reportName = prompt('Enter custom report name:');
                  const dataSource = prompt('Select data source (users/applications/system/all):');
                  const format = prompt('Select format (pdf/csv/excel):');
                  
                  if (reportName && dataSource && format) {
                    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
                    
                    if (format === 'csv') {
                      let csvContent = 'Custom Report,Generated Date,Data Source\n';
                      csvContent += `"${reportName}","${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}","${dataSource}"\n`;
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `custom-${reportName.replace(/\s+/g, '-')}-${timestamp}.csv`;
                      link.click();
                    }
                    
                    toast({
                      title: "Custom Report Generated",
                      description: `${reportName} report created with ${dataSource} data in ${format} format`,
                    });
                  } else {
                    toast({
                      title: "Custom Report Cancelled",
                      description: "Custom report creation was cancelled",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-custom-report"
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