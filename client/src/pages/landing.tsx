import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import PhoneSignIn from "@/components/phone-signin";
import { FolderOpen } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/docket");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <FolderOpen className="h-16 w-16 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to Docketify</h2>
          <p className="mt-2 text-sm text-gray-600">
            Securely manage your documents and professional information
          </p>
        </div>
        
        <PhoneSignIn />
      </div>
    </div>
  );
}
