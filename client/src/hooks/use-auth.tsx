import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isInitialized,
    retry: false,
  });

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { email });
      return res.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { email, otp });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force navigation to dashboard after successful login
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      // Force redirect to home page after logout
      window.location.href = "/";
    },
  });

  const sendOtp = async (email: string) => {
    await sendOtpMutation.mutateAsync(email);
  };

  const login = async (email: string, otp: string) => {
    await loginMutation.mutateAsync({ email, otp });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: (user as User) || null,
        isLoading: !isInitialized || userLoading,
        isAuthenticated: !!user,
        login,
        logout,
        sendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
