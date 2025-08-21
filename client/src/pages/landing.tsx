import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Users, Shield, CheckCircle } from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200">
              <img 
                src={chefOverseasLogo} 
                alt="Chef Overseas" 
                className="h-20 w-auto object-contain max-w-md"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Docketify
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your comprehensive document management platform for work permits, contracts, and professional documentation.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
          >
            Sign In to Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Document Management</CardTitle>
              <CardDescription>
                Organize and track all your important documents in one secure place.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Work Permits</CardTitle>
              <CardDescription>
                Streamline your work permit applications and status tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Contract Management</CardTitle>
              <CardDescription>
                Keep track of employment contracts and important agreements.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Progress Tracking</CardTitle>
              <CardDescription>
                Monitor completion status and stay on top of deadlines.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Powered by Chef Overseas
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Chef Overseas is dedicated to helping culinary professionals navigate the complex world of 
            international employment. Our Docketify platform simplifies document management, making it 
            easier for chefs and hospitality workers to organize their credentials and track their 
            professional journey.
          </p>
        </div>
      </div>
    </div>
  );
}