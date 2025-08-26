import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch notifications to show unread count - must be before conditional return
  const { data: notificationsData } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = (notificationsData as { notifications?: any[] })?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Only hide navigation for non-authenticated users or admin pages
  if (!isAuthenticated || location === "/auth/otp" || location.startsWith("/admin")) {
    return null;
  }

  const isActive = (path: string) => location === path;

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/docket", label: "Docket" },
    { href: "/contracts", label: "Contracts" },
    { href: "/workpermit", label: "Permit" },
    { href: "/workvisa", label: "Visa" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-orange-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center group mr-8">
              <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 shadow-lg border border-orange-100/50 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <img 
                  src={chefOverseasLogo} 
                  alt="Chef Overseas Logo" 
                  className="h-8 w-auto object-contain transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="ml-4">
                <div className="text-xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
                  Chef Overseas
                </div>
                <div className="text-xs font-medium text-gray-500 leading-tight">
                  Document Management
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-2xl px-3 py-2 border border-orange-100/30 shadow-sm">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActive(item.href) 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                      : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400 hover:shadow-md"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user?.isAdmin && (
                <Link 
                  href="/admin"
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 border-2 ${
                    isActive("/admin") 
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25 border-purple-500" 
                      : "text-purple-600 border-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-400 hover:to-indigo-400 hover:shadow-md hover:border-purple-400"
                  }`}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="relative">
              <Button 
                variant="ghost" 
                className="p-2.5 rounded-full hover:bg-orange-50 transition-all duration-300 group relative"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <Bell className="h-4 w-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs rounded-full bg-red-500 text-white border-2 border-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
              
              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-orange-100/50 z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b border-orange-100/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsNotificationOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {notifications.slice(0, 5).map((notification: any) => (
                          <div 
                            key={notification.id}
                            className={`p-3 rounded-lg mb-2 border ${
                              notification.read 
                                ? 'bg-gray-50 border-gray-200' 
                                : 'bg-orange-50 border-orange-200'
                            }`}
                          >
                            <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {notifications.length > 5 && (
                          <div className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="text-orange-600">
                              View all notifications
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50/50 to-red-50/50 backdrop-blur-sm rounded-2xl px-3 py-2 border border-orange-100/50">
              <Avatar className="h-9 w-9 ring-2 ring-orange-200/50 ring-offset-1 ring-offset-white">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white font-semibold text-sm">
                  {user?.displayName?.charAt(0) || user?.phone?.slice(-2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden xl:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">
                  {user?.displayName || user?.phone}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  User Account
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => logout()} 
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-red-500 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-orange-100/50 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive(item.href) 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                      : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user?.isAdmin && (
                <Link 
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                    isActive("/admin") 
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg border-purple-500" 
                      : "text-purple-600 border-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-400 hover:to-indigo-400 hover:border-purple-400"
                  }`}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
