import { useAuth } from "@/hooks/use-auth";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { NotificationSystem } from "@/components/notification-system";
import { AdvancedSearch } from "@/components/advanced-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, Clock, CheckCircle, Activity, Settings, LogOut } from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <img src={chefOverseasLogo} alt="Chef Overseas" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.displayName}</h1>
                <p className="text-sm text-gray-600">Manage your documents and applications</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AdvancedSearch />
              <NotificationSystem />
              <Link href="/profile">
                <Button variant="ghost" size="sm" title="User Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Docket Progress</p>
                  <p className="text-2xl font-bold text-gray-900">65%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Work Permit</p>
                  <p className="text-2xl font-bold text-gray-900">In Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overall</p>
                  <p className="text-2xl font-bold text-gray-900">42%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Docket Updated</p>
                  <p className="text-sm text-gray-600">Passport documents uploaded • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Contract Signed</p>
                  <p className="text-sm text-gray-600">Company contract signed and submitted • 1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <UserNavigationHub />
      </div>
    </div>
  );
}