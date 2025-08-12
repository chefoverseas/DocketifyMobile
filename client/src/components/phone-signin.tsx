import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Smartphone } from "lucide-react";

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number"),
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
      phone: "",
    },
  });

  const onSubmit = async (data: PhoneData) => {
    setIsLoading(true);
    
    try {
      // Format phone number - ensure it starts with +1
      let formattedPhone = data.phone.replace(/\D/g, "");
      if (!formattedPhone.startsWith("1")) {
        formattedPhone = "1" + formattedPhone;
      }
      formattedPhone = "+" + formattedPhone;

      await sendOtp(formattedPhone);
      
      // Store phone for OTP verification
      sessionStorage.setItem("pendingPhone", formattedPhone);
      
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
      
      setLocation(`/auth/otp?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 text-sm">+1</span>
                      </div>
                      <Input 
                        {...field}
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-center text-xs text-gray-500 italic">
              reCAPTCHA verification will be handled automatically
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
