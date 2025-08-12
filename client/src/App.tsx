import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";
import Landing from "@/pages/landing";
import OtpVerification from "@/pages/otp-verification";
import Profile from "@/pages/profile";
import Docket from "@/pages/docket";
import Contracts from "@/pages/contracts";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Admin from "@/pages/admin";
import AdminContracts from "@/pages/admin-contracts";
import AdminUserCreate from "@/pages/admin-user-create";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth/otp" component={OtpVerification} />
      <Route path="/profile" component={Profile} />
      <Route path="/docket" component={Docket} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/contracts" component={AdminContracts} />
      <Route path="/admin/user/new" component={AdminUserCreate} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Toaster />
            <Router />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
