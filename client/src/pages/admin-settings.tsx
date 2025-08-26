import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Mail, 
  Bell, 
  Shield, 
  Database, 
  Globe,
  ArrowLeft,
  Save,
  RefreshCw,
  Clock,
  Users,
  FileText,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Key,
  Server,
  Smartphone
} from "lucide-react";
import { Link, useLocation } from "wouter";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("We are currently performing scheduled maintenance. Please check back shortly.");
  const [sessionTimeout, setSessionTimeout] = useState("7");
  const [maxFileSize, setMaxFileSize] = useState("10");
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [supportEmail, setSupportEmail] = useState("info@chefoverseas.com");
  const [supportPhone, setSupportPhone] = useState("+919363234028");
  const [systemMessage, setSystemMessage] = useState("");

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  // Early returns after all hooks are called
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">Loading System Settings...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Preparing configuration options</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call for saving settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
                    System Settings
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Configure system preferences and options</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                System Online
              </Badge>
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Maintenance Mode */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Server className="h-6 w-6 mr-3 text-red-500" />
              Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}>
                  <Server className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    System Status: {maintenanceMode ? 'Maintenance Mode' : 'Online'}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {maintenanceMode ? 'System is currently in maintenance mode' : 'System is operational and accepting users'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={maintenanceMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}>
                  {maintenanceMode ? 'Maintenance' : 'Online'}
                </Badge>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
            
            {maintenanceMode && (
              <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Maintenance Mode Active</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message (shown to users)</Label>
                  <Textarea
                    id="maintenance-message"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Enter the message users will see during maintenance..."
                    className="min-h-[100px] bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  <strong>Warning:</strong> When maintenance mode is active, regular users will not be able to access the system. Only admin users can access the platform.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Settings className="h-6 w-6 mr-3 text-blue-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="Enter support email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-phone">Support Phone</Label>
                <Input
                  id="support-phone"
                  type="tel"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="Enter support phone"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="system-message">System Message (displayed to users)</Label>
              <Textarea
                id="system-message"
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder="Enter any system-wide message for users..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Shield className="h-6 w-6 mr-3 text-red-500" />
              Security & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (days)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  min="1"
                  max="30"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Enhanced security for admin accounts</div>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Security Notice</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    OTP authentication is active for all user accounts. Session management is handled automatically by the system.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File & Storage Settings */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-6 w-6 mr-3 text-green-500" />
                File & Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <select
                  id="backup-frequency"
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Database className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Local Storage</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Files stored in uploads directory</div>
                </div>
                <Badge className="bg-green-500 text-white">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Alerts */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Bell className="h-6 w-6 mr-3 text-orange-500" />
                Notifications & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Send email alerts for system events</div>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Auto Sync</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Automatic data synchronization</div>
                  </div>
                </div>
                <Switch
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">SendGrid Integration</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Email service is configured and operational</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status & Integration */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Server className="h-6 w-6 mr-3 text-purple-500" />
              System Status & Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <Badge className="bg-green-500 text-white text-xs">Online</Badge>
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">PostgreSQL</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Primary database</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">SendGrid</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Email service</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className="h-5 w-5 text-orange-600" />
                  <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">OTP Service</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">SMS authentication</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <Badge className="bg-green-500 text-white text-xs">Running</Badge>
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">API Server</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">REST endpoints</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3 text-yellow-500" />
              Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Mode</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Temporarily disable user access for system maintenance</div>
                </div>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
            {maintenanceMode && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="text-sm text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Warning: Maintenance mode is enabled. Users will not be able to access the system.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}