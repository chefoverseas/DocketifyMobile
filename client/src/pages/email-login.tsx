import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function EmailLogin() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiRequest("POST", "/api/auth/send-otp", { email });
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error: any) {
      setError(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/auth/verify-otp", { email, otp });
      const data = await response.json();
      
      // Refresh user data in cache
      queryClient.setQueryData(["/api/auth/user"], data.user);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect will happen automatically via useAuth hook
    } catch (error: any) {
      setError(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/chef-overseas-logo.png" 
            alt="Chef Overseas" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Chef Overseas</h1>
          <p className="text-gray-600 mt-2">Document Management System</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {step === "email" ? (
                <>
                  <Mail className="h-5 w-5 text-orange-600" />
                  Enter Your Email
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 text-orange-600" />
                  Verify OTP
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === "email" 
                ? "Enter the email address registered by your admin"
                : `Enter the 6-digit code sent to ${email}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                    disabled={isLoading}
                    className="h-12 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                >
                  Back to Email
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
}