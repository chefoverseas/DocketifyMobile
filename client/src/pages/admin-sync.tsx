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
  Settings
} from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Data Synchronization Center
            </h1>
          </div>
          <p className="text-gray-600">Monitor and manage data consistency across all user modules</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Sync Status */}
          <Card className="bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Sync Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${syncStatus?.status.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">
                      {syncStatus?.status.isRunning ? 'Active' : 'Stopped'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Next check: {syncStatus?.status.nextSyncIn || 'Unknown'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Sync */}
          <Card className="bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <span>Manual Sync</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleManualSync}
                disabled={manualSyncMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {manualSyncMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Sync Now
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Checks all users immediately
              </p>
            </CardContent>
          </Card>

          {/* Sync Statistics */}
          <Card className="bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Last Sync</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastSyncReport ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Users checked:</span>
                    <span className="font-medium">{lastSyncReport.usersChecked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Issues found:</span>
                    <span className="font-medium">{lastSyncReport.totalInconsistencies}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(lastSyncReport.timestamp).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No sync data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sync Report */}
        {lastSyncReport && (
          <Card className="bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Latest Sync Report</span>
                <Badge variant="outline" className="ml-auto">
                  {new Date(lastSyncReport.timestamp).toLocaleString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastSyncReport.totalInconsistencies === 0 ? (
                <div className="flex items-center justify-center py-8 text-green-600">
                  <CheckCircle className="h-8 w-8 mr-3" />
                  <div>
                    <h3 className="font-semibold">All Data Consistent</h3>
                    <p className="text-sm">No issues found across {lastSyncReport.usersChecked} users</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Issues Detected</h4>
                    <Badge variant="secondary">
                      {lastSyncReport.totalInconsistencies} total
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {lastSyncReport.inconsistencies.map((issue, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="mt-0.5">
                          {getStatusIcon(issue.fixed)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {issue.userEmail}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getTypeColor(issue.type)}`}
                            >
                              {issue.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{issue.issue}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge 
                            variant={issue.fixed ? "default" : "secondary"}
                            className={issue.fixed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {issue.fixed ? "Fixed" : "Needs Attention"}
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

        {/* Information */}
        <Card className="bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How Data Sync Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Automatic Monitoring</h4>
                <ul className="space-y-1">
                  <li>• Runs every 5 minutes automatically</li>
                  <li>• Checks all user records for consistency</li>
                  <li>• Creates missing records automatically</li>
                  <li>• Fixes invalid status values</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Data Verification</h4>
                <ul className="space-y-1">
                  <li>• Docket: Ensures all users have docket records</li>
                  <li>• Work Permits: Validates status values</li>
                  <li>• Work Visas: Checks interview scheduling consistency</li>
                  <li>• Contracts: Verifies contract status integrity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}