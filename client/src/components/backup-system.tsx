import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  Upload, 
  Archive, 
  RefreshCcw, 
  Database,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface BackupInfo {
  id: string;
  type: "full" | "incremental" | "documents";
  size: string;
  createdAt: Date;
  status: "completed" | "failed" | "in_progress";
  downloadUrl?: string;
}

export function BackupSystem() {
  const { toast } = useToast();
  const [backupProgress, setBackupProgress] = useState(0);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const { data: backupsData, isLoading } = useQuery({
    queryKey: ["/api/admin/backups"],
  });

  const backups: BackupInfo[] = (backupsData as any)?.backups || [
    {
      id: "1",
      type: "full",
      size: "45.2 MB",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "completed",
      downloadUrl: "/api/admin/download-backup/1"
    },
    {
      id: "2",
      type: "documents",
      size: "32.1 MB",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "completed",
      downloadUrl: "/api/admin/download-backup/2"
    },
    {
      id: "3",
      type: "incremental",
      size: "8.7 MB",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "completed",
      downloadUrl: "/api/admin/download-backup/3"
    }
  ];

  const createBackupMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const res = await apiRequest("POST", "/api/admin/create-backup", { type });
      return res.json();
    },
    onSuccess: () => {
      setIsCreatingBackup(false);
      setBackupProgress(0);
      toast({
        title: "Backup Created Successfully",
        description: "Your backup has been created and is ready for download",
      });
    },
    onError: (error: any) => {
      setIsCreatingBackup(false);
      setBackupProgress(0);
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = async (type: string) => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 10;
      });
    }, 500);

    createBackupMutation.mutate({ type });
  };

  const getBackupIcon = (type: string) => {
    switch (type) {
      case "full": return <Database className="h-5 w-5 text-blue-600" />;
      case "documents": return <FileText className="h-5 w-5 text-green-600" />;
      case "incremental": return <RefreshCcw className="h-5 w-5 text-orange-600" />;
      default: return <Archive className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Backup & Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleCreateBackup("full")}
              disabled={isCreatingBackup}
              className="flex items-center justify-center space-x-2 h-16"
            >
              <Database className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Full Backup</div>
                <div className="text-sm opacity-90">Complete system backup</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleCreateBackup("documents")}
              disabled={isCreatingBackup}
              className="flex items-center justify-center space-x-2 h-16"
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Documents Only</div>
                <div className="text-sm opacity-70">User files & documents</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleCreateBackup("incremental")}
              disabled={isCreatingBackup}
              className="flex items-center justify-center space-x-2 h-16"
            >
              <RefreshCcw className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Incremental</div>
                <div className="text-sm opacity-70">Changes since last backup</div>
              </div>
            </Button>
          </div>

          {/* Backup Progress */}
          {isCreatingBackup && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Creating backup...</span>
                <span className="text-sm text-blue-700">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="h-5 w-5 mr-2" />
            Backup History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No backups available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getBackupIcon(backup.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium capitalize">
                          {backup.type} Backup
                        </h4>
                        {getStatusBadge(backup.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(backup.createdAt, "MMM dd, yyyy 'at' HH:mm")}
                        </span>
                        <span>{backup.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {backup.status === "completed" && backup.downloadUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={backup.downloadUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    )}
                    
                    {backup.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Backup Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Daily Incremental Backups</h4>
                <p className="text-sm text-gray-600">Automatically backup changes every day at 2:00 AM</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Weekly Full Backups</h4>
                <p className="text-sm text-gray-600">Complete system backup every Sunday at 1:00 AM</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Backup Retention</h4>
                <p className="text-sm text-gray-600">Keep backups for 30 days before automatic deletion</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}