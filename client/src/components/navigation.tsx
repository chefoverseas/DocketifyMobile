import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated || location === "/" || location === "/auth/otp" || location.startsWith("/admin")) {
    return null;
  }

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-orange-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 shadow-lg border border-orange-100/50 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <img 
                  src={chefOverseasLogo} 
                  alt="Chef Overseas Logo" 
                  className="h-8 w-auto object-contain transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="ml-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Chef Overseas
                </span>
                <div className="text-sm font-medium text-gray-500 -mt-1">
                  Document Management
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-12 flex items-center space-x-2">
              <Link 
                href="/dashboard"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive("/dashboard") 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                    : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400 hover:shadow-md"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/profile"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive("/profile") 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                    : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400 hover:shadow-md"
                }`}
              >
                Profile
              </Link>
              <Link 
                href="/docket"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive("/docket") 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                    : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400 hover:shadow-md"
                }`}
              >
                Docket
              </Link>
              <Link 
                href="/contracts"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive("/contracts") 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                    : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400 hover:shadow-md"
                }`}
              >
                Contracts
              </Link>
              <Link 
                href="/workpermit"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive("/workpermit") 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                    : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400 hover:shadow-md"
                }`}
              >
                Work Permit
              </Link>
              <Link 
                href="/workvisa"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive("/workvisa") 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                    : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-400 hover:shadow-md"
                }`}
              >
                Work Visa
              </Link>
              {user?.isAdmin && (
                <Link 
                  href="/admin"
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 border-2 ${
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
          
          <div className="flex items-center space-x-6">
            <Button variant="ghost" className="p-3 rounded-full hover:bg-orange-50 transition-all duration-300 group">
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
            </Button>
            <div className="flex items-center space-x-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-orange-100/50">
              <Avatar className="h-11 w-11 ring-2 ring-orange-200/50 ring-offset-2 ring-offset-white">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white font-semibold">
                  {user?.displayName?.charAt(0) || user?.phone?.slice(-2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.displayName || user?.phone}
                </div>
                <div className="text-xs text-gray-500">
                  Document Manager
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => logout()} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-red-500 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
