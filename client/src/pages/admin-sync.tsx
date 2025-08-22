import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users,
  Database,
  Zap,
  Settings,
  ArrowLeft,
  Activity,
  TrendingUp,
  Shield,
  Cpu,
  BarChart3,
  Server
} from "lucide-react";
import { Link } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";
import { toast } from "@/hooks/use-toast";

interface SyncStatus {
  isRunning: boolean;
  nextSyncIn: string;
}

interface SyncInconsistency {
  userId: string;
  userEmail: string;
  type: 'docket' | 'workpermit' | 'workvisa' | 'contract';
  issue: string;
  fixed: boolean;
}

interface SyncReport {
  timestamp: string;
  usersChecked: number;
  inconsistencies: SyncInconsistency[];
  totalInconsistencies: number;
}

export default function AdminSync() {
  const [lastSyncReport, setLastSyncReport] = useState<SyncReport | null>(null);
  const queryClient = useQueryClient();

  // Get sync status
  const { data: syncStatus, isLoading: statusLoading } = useQuery<{ status: SyncStatus }>({
    queryKey: ['/api/admin/sync/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Manual sync mutation
  const manualSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/sync/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to trigger manual sync");
      return response.json();
    },
    onSuccess: (data) => {
      setLastSyncReport(data.report);
      toast({
        title: "Manual sync completed",
        description: `Checked ${data.report.usersChecked} users, found ${data.report.totalInconsistencies} issues`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sync/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to complete manual sync",
        variant: "destructive",
      });
    }
  });

  const handleManualSync = () => {
    manualSyncMutation.mutate();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'docket': return 'bg-blue-100 text-blue-800';
      case 'workpermit': return 'bg-green-100 text-green-800';
      case 'workvisa': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (fixed: boolean) => {
    return fixed ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Modern Header with Chef Overseas Branding */}
      <Card className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white border-none shadow-2xl mb-8 rounded-none">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                  <img 
                    src={chefOverseasLogo} 
                    alt="Chef Overseas Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">Data Synchronization Center</h1>
                  <p className="text-orange-100 text-lg mt-1">
                    Advanced monitoring and automated data consistency management
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-orange-100">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Real-time Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Data Integrity Protection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span>Auto-healing System</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="container mx-auto px-4 pb-8">

        {/* Modern Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Real-time Status */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className={`h-3 w-3 rounded-full animate-pulse ${syncStatus?.status.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">System Status</h3>
              <p className="text-2xl font-bold text-blue-600">
                {statusLoading ? '...' : (syncStatus?.status.isRunning ? 'Active' : 'Offline')}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {statusLoading ? 'Loading...' : `Next: ${syncStatus?.status.nextSyncIn || 'Unknown'}`}
              </p>
            </CardContent>
          </Card>

          {/* Sync Performance */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-800">5 min</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sync Interval</h3>
              <p className="text-2xl font-bold text-green-600">Every 5 min</p>
              <p className="text-sm text-gray-500 mt-2">Automated checks</p>
            </CardContent>
          </Card>

          {/* Data Health */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-purple-100 text-purple-800">Protected</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Data Integrity</h3>
              <p className="text-2xl font-bold text-purple-600">Active</p>
              <p className="text-sm text-gray-500 mt-2">Auto-healing enabled</p>
            </CardContent>
          </Card>

          {/* Manual Control */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <Button 
                  onClick={handleManualSync}
                  disabled={manualSyncMutation.isPending}
                  size="sm"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  {manualSyncMutation.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Zap className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Manual Sync</h3>
              <p className="text-2xl font-bold text-orange-600">Ready</p>
              <p className="text-sm text-gray-500 mt-2">Instant check</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Control Panel */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 border-b">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Cpu className="h-6 w-6 mr-3 text-blue-600" />
              Synchronization Control Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Automated Sync Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Automated Synchronization
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <Badge className={syncStatus?.status.isRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {syncStatus?.status.isRunning ? 'Active' : 'Stopped'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Frequency</span>
                    <span className="text-sm text-gray-600">Every 5 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Next Check</span>
                    <span className="text-sm text-gray-600">{syncStatus?.status.nextSyncIn || 'Calculating...'}</span>
                  </div>
                </div>
              </div>

              {/* Manual Operations */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-orange-600" />
                  Manual Operations
                </h4>
                <div className="space-y-3">
                  <Button 
                    onClick={handleManualSync}
                    disabled={manualSyncMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    {manualSyncMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running Sync Check...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Run Full Sync Check
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Immediately checks all users for data consistency issues
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Sync Report Display */}

        {lastSyncReport && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 border-b">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span>Latest Sync Report</span>
                <Badge variant="outline" className="ml-auto">
                  {new Date(lastSyncReport.timestamp).toLocaleString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {lastSyncReport.totalInconsistencies === 0 ? (
                <div className="flex items-center justify-center py-8 text-green-600">
                  <CheckCircle className="h-12 w-12 mr-4" />
                  <div>
                    <h3 className="text-xl font-bold">All Data Consistent</h3>
                    <p className="text-gray-600">No issues found across {lastSyncReport.usersChecked} users</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Data Inconsistencies Detected</h4>
                    <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                      {lastSyncReport.totalInconsistencies} issues
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {lastSyncReport.inconsistencies.map((issue, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="mt-1">
                          {getStatusIcon(issue.fixed)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-gray-900 truncate">
                              {issue.userEmail}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getTypeColor(issue.type)}`}
                            >
                              {issue.type}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{issue.issue}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge 
                            className={issue.fixed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {issue.fixed ? "Auto-Fixed" : "Needs Attention"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* How It Works Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mt-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Settings className="h-6 w-6 mr-3 text-blue-600" />
              How Data Synchronization Works
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Automated Monitoring
                </h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                    <span>Runs every 5 minutes automatically</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Users className="h-4 w-4 mt-0.5 text-blue-500" />
                    <span>Checks all user records for consistency</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Creates missing records automatically</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <RefreshCw className="h-4 w-4 mt-0.5 text-orange-500" />
                    <span>Fixes invalid status values</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Data Verification
                </h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <Database className="h-4 w-4 mt-0.5 text-blue-500" />
                    <span><strong>Dockets:</strong> Ensures all users have complete docket records</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Settings className="h-4 w-4 mt-0.5 text-green-500" />
                    <span><strong>Work Permits:</strong> Validates status values and consistency</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 mt-0.5 text-purple-500" />
                    <span><strong>Work Visas:</strong> Checks interview scheduling consistency</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 mt-0.5 text-orange-500" />
                    <span><strong>Contracts:</strong> Verifies contract status integrity</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}