import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import OtpForm from "@/components/otp-form";
import { Shield } from "lucide-react";

export default function OtpVerification() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/docket");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  // Get phone from URL params or session storage
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone") || sessionStorage.getItem("pendingPhone") || "";

  if (!phone) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Verify Your Phone</h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a 6-digit code to <span className="font-medium">{phone}</span>
          </p>
        </div>
        
        <OtpForm phone={phone} />
      </div>
    </div>
  );
}
