import { apiRequest } from "./queryClient";

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    displayName?: string;
    email?: string;
    profilePhotoUrl?: string;
    docketCompleted: boolean;
    isAdmin: boolean;
    createdAt?: string;
  };
}

export interface OTPResponse {
  message: string;
}

export const authService = {
  async sendOTP(phone: string): Promise<OTPResponse> {
    const res = await apiRequest("POST", "/api/auth/send-otp", { phone });
    return res.json();
  },

  async verifyOTP(phone: string, otp: string): Promise<AuthResponse> {
    const res = await apiRequest("POST", "/api/auth/verify-otp", { phone, otp });
    return res.json();
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const res = await apiRequest("GET", "/api/auth/me");
    return res.json();
  },

  async logout(): Promise<{ message: string }> {
    const res = await apiRequest("POST", "/api/auth/logout");
    return res.json();
  },

  async updateProfile(updates: {
    displayName?: string;
    email?: string;
  }): Promise<AuthResponse> {
    const res = await apiRequest("PATCH", "/api/users/profile", updates);
    return res.json();
  },
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");
  
  // Add country code if not present
  if (!cleaned.startsWith("1")) {
    cleaned = "1" + cleaned;
  }
  
  return "+" + cleaned;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+?1)?[\s\-\.]?\(?([0-9]{3})\)?[\s\-\.]?([0-9]{3})[\s\-\.]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const isAuthenticated = (user: any): boolean => {
  return !!(user && user.id);
};

export const isAdmin = (user: any): boolean => {
  return !!(user && user.isAdmin);
};
