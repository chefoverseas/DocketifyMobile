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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={chefOverseasLogo} 
                alt="Chef Overseas Logo" 
                className="h-8 w-auto mr-2"
              />
              <span className="text-xl font-bold text-gray-900">Docketify</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard") 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/profile") 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Profile
              </Link>
              <Link 
                href="/docket"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/docket") 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Docket
              </Link>
              <Link 
                href="/contracts"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/contracts") 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Contracts
              </Link>
              <Link 
                href="/workpermit"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/workpermit") 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Work Permit
              </Link>
              {user?.isAdmin && (
                <Link 
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin") 
                      ? "text-primary-600 bg-primary-50" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback>
                  {user?.displayName?.charAt(0) || user?.phone?.slice(-2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {user?.displayName || user?.phone}
              </span>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
