import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Globe } from "lucide-react";

// Common country codes for the dropdown
const countryCodes = [
  { code: "+1", name: "United States/Canada", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+86", name: "China", flag: "🇨🇳" },
];

const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country code"),
  phone: z.string().min(7, "Please enter a valid phone number").max(15, "Phone number too long"),
});

type PhoneData = z.infer<typeof phoneSchema>;

export default function PhoneSignIn() {
  const { sendOtp } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PhoneData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "+1",
      phone: "",
    },
  });

  const onSubmit = async (data: PhoneData) => {
    setIsLoading(true);
    
    try {
      // Clean phone number - remove all non-digits
      const cleanPhone = data.phone.replace(/\D/g, "");
      
      // Combine country code with phone number
      const formattedPhone = data.countryCode + cleanPhone;

      await sendOtp(formattedPhone);
      
      // Store phone for OTP verification
      sessionStorage.setItem("pendingPhone", formattedPhone);
      
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
      
      setLocation(`/auth/otp?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (error: any) {
      if (error.message === "You are not a candidate of Chef Overseas") {
        toast({
          title: "Access Denied",
          description: "You are not a candidate of Chef Overseas",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Sign In with Phone Number</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center space-x-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                              <span className="text-sm text-gray-500">{country.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm min-w-[60px] justify-center">
                        {form.watch("countryCode")}
                      </div>
                      <Input 
                        {...field}
                        type="tel"
                        placeholder="Enter your phone number"
                        className="rounded-l-none"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-center text-xs text-gray-500 italic">
              Only registered candidates can access the system
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
