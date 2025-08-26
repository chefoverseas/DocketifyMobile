import { useState, useEffect } from "react";
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

  // Load current settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    enabled: !!(adminData as any)?.admin,
  });

  // Update state when settings are loaded
  useEffect(() => {
    if ((settingsData as any)?.settings) {
      const settings = (settingsData as any).settings;
      setMaintenanceMode(settings.maintenanceMode);
      setMaintenanceMessage(settings.maintenanceMessage);
      setEmailNotifications(settings.emailNotifications);
      setAutoSync(settings.autoSync);
      setSessionTimeout(settings.sessionTimeout.toString());
      setMaxFileSize(settings.maxFileSize.toString());
      setBackupFrequency(settings.backupFrequency);
      setSupportEmail(settings.supportEmail);
      setSupportPhone(settings.supportPhone);
      setSystemMessage(settings.systemMessage);
    }
  }, [settingsData]);

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
      // Save maintenance mode and other settings to backend
      await apiRequest("/api/admin/settings", "POST", {
        maintenanceMode,
        maintenanceMessage,
        emailNotifications,
        autoSync,
        sessionTimeout: parseInt(sessionTimeout),
        maxFileSize: parseInt(maxFileSize),
        backupFrequency,
        supportEmail,
        supportPhone,
        systemMessage
      });
      
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

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* System Status & Maintenance Mode - Modern Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                <Server className="h-8 w-8 mr-4 text-orange-500" />
                System Control Center
              </CardTitle>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  maintenanceMode 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  {maintenanceMode ? 'Maintenance Active' : 'System Online'}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {/* Maintenance Mode Toggle */}
            <div className="bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    maintenanceMode 
                      ? 'bg-red-500 shadow-lg shadow-red-500/25' 
                      : 'bg-green-500 shadow-lg shadow-green-500/25'
                  }`}>
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Maintenance Mode
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Control system access during maintenance periods
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {maintenanceMode ? 'Enabled' : 'Disabled'}
                  </span>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                    className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500 scale-125"
                    data-testid="maintenance-mode-toggle"
                  />
                </div>
              </div>
              
              {/* Status Description */}
              <div className={`p-4 rounded-lg transition-all duration-300 ${
                maintenanceMode 
                  ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700' 
                  : 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700'
              }`}>
                <div className="flex items-center space-x-3">
                  {maintenanceMode ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                  <p className={`text-sm font-medium ${
                    maintenanceMode 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {maintenanceMode 
                      ? 'System is in maintenance mode - only administrators can access the platform'
                      : 'System is fully operational and accepting all users'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Maintenance Message Configuration */}
            {maintenanceMode && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 backdrop-blur-sm rounded-xl p-6 border border-red-200 dark:border-red-700 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Maintenance Configuration</h4>
                    <p className="text-sm text-red-600 dark:text-red-400">Configure the message users will see</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maintenance-message" className="text-red-700 dark:text-red-300 font-medium">
                      User Message
                    </Label>
                    <Textarea
                      id="maintenance-message"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="Enter the message users will see during maintenance..."
                      className="mt-2 min-h-[120px] bg-white/90 dark:bg-slate-800/90 border-red-200 dark:border-red-700 focus:border-red-400 focus:ring-red-400"
                      data-testid="maintenance-message-input"
                    />
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-red-100/50 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <strong>Important:</strong> While maintenance mode is active, regular users will be redirected to a maintenance page displaying your custom message. Only administrators with valid sessions can access the system.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact & Communication Settings */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-900 backdrop-blur-xl border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10"></div>
          <CardHeader className="relative">
            <CardTitle className="text-xl flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <Mail className="h-6 w-6 mr-3 text-blue-500" />
              Contact & Communication
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Configure support channels and system messaging</p>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <Label htmlFor="support-email" className="text-slate-700 dark:text-slate-300 font-medium">
                    Support Email Address
                  </Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@chefoverseas.com"
                    className="mt-2 bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-700"
                    data-testid="input-support-email"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Primary email for user support inquiries</p>
                </div>
                
                <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <Label htmlFor="support-phone" className="text-slate-700 dark:text-slate-300 font-medium">
                    Support WhatsApp Number
                  </Label>
                  <Input
                    id="support-phone"
                    type="tel"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+919363234028"
                    className="mt-2 bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-700"
                    data-testid="input-support-phone"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">WhatsApp contact for instant support</p>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                <Label htmlFor="system-message" className="text-slate-700 dark:text-slate-300 font-medium">
                  System-wide Announcement
                </Label>
                <Textarea
                  id="system-message"
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  placeholder="Enter important announcements or notices for all users..."
                  className="mt-2 min-h-[120px] bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-700"
                  data-testid="textarea-system-message"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This message will be displayed to all users on their dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Performance Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Settings */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-red-50 to-orange-50 dark:from-slate-800 dark:via-red-900/10 dark:to-orange-900/10 backdrop-blur-xl border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl flex items-center bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                <Shield className="h-6 w-6 mr-3 text-red-500" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-red-200/50 dark:border-red-700/50">
                <Label htmlFor="session-timeout" className="text-slate-700 dark:text-slate-300 font-medium">
                  Session Timeout (days)
                </Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  min="1"
                  max="30"
                  className="mt-2 bg-white/80 dark:bg-slate-800/80 border-red-200 dark:border-red-700"
                  data-testid="input-session-timeout"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Automatic logout after inactivity</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Key className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-200">OTP Authentication</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Mobile verification active</div>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Security Active:</strong> All users authenticate via mobile OTP. Admin sessions are encrypted and automatically managed.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-green-50 to-emerald-50 dark:from-slate-800 dark:via-green-900/10 dark:to-emerald-900/10 backdrop-blur-xl border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl flex items-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                <Zap className="h-6 w-6 mr-3 text-green-500" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                <Label htmlFor="max-file-size" className="text-slate-700 dark:text-slate-300 font-medium">
                  Max File Upload (MB)
                </Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  min="1"
                  max="100"
                  className="mt-2 bg-white/80 dark:bg-slate-800/80 border-green-200 dark:border-green-700"
                  data-testid="input-max-file-size"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maximum size for document uploads</p>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                <Label htmlFor="backup-frequency" className="text-slate-700 dark:text-slate-300 font-medium">
                  Data Backup Frequency
                </Label>
                <select
                  id="backup-frequency"
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-white/80 dark:bg-slate-800/80 border border-green-200 dark:border-green-700 rounded-md text-sm focus:ring-2 focus:ring-green-400"
                  data-testid="select-backup-frequency"
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Automated system backup schedule</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-200">Storage System</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Local file system with UUID naming</div>
                  </div>
                </div>
                <Badge className="bg-blue-500 text-white">Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications & System Automation */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-slate-800 dark:via-purple-900/10 dark:to-indigo-900/10 backdrop-blur-xl border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10"></div>
          <CardHeader className="relative">
            <CardTitle className="text-xl flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              <Bell className="h-6 w-6 mr-3 text-purple-500" />
              Notifications & Automation
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Configure automated services and notification preferences</p>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email & Communication */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  Communication Services
                </h4>
                
                <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">Email Notifications</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Status updates and alerts</div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      className="data-[state=checked]:bg-blue-500"
                      data-testid="toggle-email-notifications"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>SendGrid integration active</span>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">Auto-Sync Service</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Data consistency checks</div>
                    </div>
                    <Switch
                      checked={autoSync}
                      onCheckedChange={setAutoSync}
                      className="data-[state=checked]:bg-green-500"
                      data-testid="toggle-auto-sync"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <RefreshCw className="h-4 w-4" />
                    <span>Running every 5 minutes</span>
                  </div>
                </div>
              </div>

              {/* System Services Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center">
                  <Server className="h-4 w-4 mr-2 text-green-500" />
                  System Services
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-green-500 rounded-md">
                        <Database className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">Data Sync Service</div>
                        <div className="text-xs text-green-600 dark:text-green-400">5-minute intervals</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-blue-500 rounded-md">
                        <Users className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Archive Service</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Daily cleanup</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white text-xs">Running</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-orange-500 rounded-md">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Reminder Service</div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">Document reminders</div>
                      </div>
                    </div>
                    <Badge className="bg-orange-500 text-white text-xs">Online</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}