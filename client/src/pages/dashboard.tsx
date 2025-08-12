import { useAuth } from "@/hooks/use-auth";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function Dashboard() {
  const { user } = useAuth();

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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserNavigationHub />
      </div>
    </div>
  );
}