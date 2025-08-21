import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, CheckCircle, AlertCircle, Clock, X, FileText, Briefcase, Shield, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface Notification {
  id: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
  read: boolean;
  dismissed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function NotificationSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time notification fetching
  const { data: notificationsData, isLoading, refetch, isError } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale for real-time updates
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error": return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setLastSyncTime(new Date());
    },
    onError: () => {
      toast({
        title: "Sync Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/notifications/mark-all-read', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setLastSyncTime(new Date());
      toast({
        title: "Notifications Updated",
        description: "All notifications marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Sync Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  });

  // Dismiss notification mutation
  const dismissNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setLastSyncTime(new Date());
    },
    onError: () => {
      toast({
        title: "Sync Error",
        description: "Failed to dismiss notification",
        variant: "destructive"
      });
    }
  });

  // Manual sync function
  const handleManualSync = async () => {
    try {
      await refetch();
      setLastSyncTime(new Date());
      toast({
        title: "Notifications Synced",
        description: "Successfully refreshed notifications",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to refresh notifications",
        variant: "destructive"
      });
    }
  };

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refetch(); // Auto-sync when coming back online
      toast({
        title: "Back Online",
        description: "Notifications synced",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Notifications will sync when back online",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refetch, toast]);

  // Auto-sync on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (isOnline) {
        refetch();
        setLastSyncTime(new Date());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isOnline, refetch]);

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const dismissNotification = (id: string) => {
    dismissNotificationMutation.mutate(id);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative transition-colors ${
          isError ? 'border-red-300 bg-red-50' : 
          !isOnline ? 'border-yellow-300 bg-yellow-50' : 
          'border-gray-300'
        }`}
      >
        <div className="flex items-center space-x-1">
          <Bell className="h-4 w-4" />
          {!isOnline && <WifiOff className="h-3 w-3 text-yellow-600" />}
          {isError && <AlertCircle className="h-3 w-3 text-red-600" />}
          {isLoading && <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />}
        </div>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`flex items-center space-x-1 text-xs ${
                    isError ? 'text-red-600' : 
                    !isOnline ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {isError ? <WifiOff className="h-3 w-3" /> : 
                     !isOnline ? <WifiOff className="h-3 w-3" /> : 
                     <Wifi className="h-3 w-3" />}
                    <span>
                      {isError ? 'Sync Error' : 
                       !isOnline ? 'Offline' : 
                       'Online'}
                    </span>
                  </div>
                  {lastSyncTime && (
                    <span className="text-xs text-gray-500">
                      • Last sync: {formatTime(lastSyncTime)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleManualSync}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {isLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Sync
                </Button>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs"
                  >
                    {markAllAsReadMutation.isPending ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      "Mark all read"
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications
                  .sort((a, b) => {
                    if (a.priority === "high" && b.priority !== "high") return -1;
                    if (b.priority === "high" && a.priority !== "high") return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      } ${markAsReadMutation.isPending ? "opacity-50" : ""}`}
                      onClick={() => !markAsReadMutation.isPending && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? "text-gray-900" : "text-gray-700"
                            }`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              {notification.priority === "high" && (
                                <Badge variant="destructive" className="text-xs">
                                  High
                                </Badge>
                              )}
                              {!notification.read && markAsReadMutation.isPending && (
                                <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                                disabled={dismissNotificationMutation.isPending}
                                className="p-1 h-auto"
                              >
                                {dismissNotificationMutation.isPending ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatTime(new Date(notification.createdAt))}
                            </p>
                            {notification.actionUrl && (
                              <Button variant="ghost" size="sm" className="text-xs">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button variant="ghost" size="sm" className="w-full">
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}