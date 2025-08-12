import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import PhoneSignIn from "@/components/phone-signin";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src={chefOverseasLogo} 
              alt="Chef Overseas Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to Docketify</h2>
          <p className="mt-2 text-sm text-gray-600">
            Chef Overseas - Document Management System
          </p>
        </div>
        
        <PhoneSignIn />
      </div>
    </div>
  );
}
