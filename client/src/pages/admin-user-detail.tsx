import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { ArrowLeft, User } from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <img src={chefOverseasLogo} alt="Chef Overseas" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Admin Dashboard - User Details</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin/users">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center">
            <User className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">User Details & Module Access</h2>
          </div>
          <p className="text-gray-600 mt-1">
            Complete overview of user information and all associated modules
          </p>
        </div>

        {/* User Navigation Hub with User Info */}
        <UserNavigationHub userId={userId} showUserInfo={true} />
      </div>
    </div>
  );
}