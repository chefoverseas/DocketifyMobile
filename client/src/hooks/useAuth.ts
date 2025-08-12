import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  logoutMutation: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  const auth = useAuthValue();
  return React.createElement(AuthContext.Provider, { value: auth }, props.children);
}

function useAuthValue() {
  const { toast } = useToast();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    logoutMutation,
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}