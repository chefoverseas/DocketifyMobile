import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Server, 
  Database, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  TrendingUp
} from "lucide-react";

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  responseTime: number;
  uptime: string;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function SystemMonitoring() {
  const [realTimeData, setRealTimeData] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkIn: 1.2,
    networkOut: 0.8,
    activeUsers: 127,
    totalRequests: 8542,
    errorRate: 0.3,
    responseTime: 245,
    uptime: "15 days, 4 hours"
  });

  const { data: systemData } = useQuery({
    queryKey: ["/api/admin/system-metrics"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const [alerts] = useState<SystemAlert[]>([
    {
      id: "1",
      type: "warning",
      message: "High memory usage detected (85%)",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      resolved: false
    },
    {
      id: "2",
      type: "info",
      message: "Scheduled backup completed successfully",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: true
    },
    {
      id: "3",
      type: "error",
      message: "Database connection timeout (resolved)",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      resolved: true
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkIn: Math.max(0.5, Math.min(5, prev.networkIn + (Math.random() - 0.5) * 0.5)),
        networkOut: Math.max(0.3, Math.min(3, prev.networkOut + (Math.random() - 0.5) * 0.3)),
        responseTime: Math.max(150, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return { color: "text-red-600", bg: "bg-red-100", status: "Critical" };
    if (value >= thresholds.warning) return { color: "text-yellow-600", bg: "bg-yellow-100", status: "Warning" };
    return { color: "text-green-600", bg: "bg-green-100", status: "Good" };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xl font-bold text-gray-900">Online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requests Today</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-lg font-bold text-gray-900">{realTimeData.uptime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CPU Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Cpu className="h-4 w-4 mr-2" />
              CPU Usage
              <Badge className={`ml-auto ${getMetricStatus(realTimeData.cpuUsage, { warning: 70, critical: 85 }).bg} ${getMetricStatus(realTimeData.cpuUsage, { warning: 70, critical: 85 }).color}`}>
                {getMetricStatus(realTimeData.cpuUsage, { warning: 70, critical: 85 }).status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{realTimeData.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={realTimeData.cpuUsage} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <MemoryStick className="h-4 w-4 mr-2" />
              Memory Usage
              <Badge className={`ml-auto ${getMetricStatus(realTimeData.memoryUsage, { warning: 75, critical: 90 }).bg} ${getMetricStatus(realTimeData.memoryUsage, { warning: 75, critical: 90 }).color}`}>
                {getMetricStatus(realTimeData.memoryUsage, { warning: 75, critical: 90 }).status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{realTimeData.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={realTimeData.memoryUsage} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Disk Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <HardDrive className="h-4 w-4 mr-2" />
              Disk Usage
              <Badge className={`ml-auto ${getMetricStatus(realTimeData.diskUsage, { warning: 80, critical: 95 }).bg} ${getMetricStatus(realTimeData.diskUsage, { warning: 80, critical: 95 }).color}`}>
                {getMetricStatus(realTimeData.diskUsage, { warning: 80, critical: 95 }).status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{realTimeData.diskUsage.toFixed(1)}%</span>
              </div>
              <Progress value={realTimeData.diskUsage} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Network Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Inbound Traffic</span>
                <span className="text-sm">{realTimeData.networkIn.toFixed(1)} MB/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outbound Traffic</span>
                <span className="text-sm">{realTimeData.networkOut.toFixed(1)} MB/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-sm">{realTimeData.responseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm">{realTimeData.errorRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    alert.resolved ? "bg-gray-50" : "bg-red-50"
                  }`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      alert.resolved ? "text-gray-700" : "text-gray-900"
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {alert.resolved && (
                    <Badge variant="outline" className="text-xs">
                      Resolved
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              View Detailed Logs
            </Button>
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Database Health Check
            </Button>
            <Button variant="outline">
              <Server className="h-4 w-4 mr-2" />
              Restart Services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}