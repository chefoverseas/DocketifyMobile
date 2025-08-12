import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import OtpVerification from "@/pages/otp-verification";
import Profile from "@/pages/profile";
import Docket from "@/pages/docket";
import Contracts from "@/pages/contracts";
import WorkPermit from "@/pages/workpermit";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Admin from "@/pages/admin";
import AdminContracts from "@/pages/admin-contracts";
import AdminWorkPermits from "@/pages/admin-workpermits";
import AdminWorkPermit from "@/pages/admin-workpermit";
import AdminUserCreate from "@/pages/admin-user-create";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/auth/otp" component={OtpVerification} />
      <Route path="/profile" component={Profile} />
      <Route path="/docket" component={Docket} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/workpermit" component={WorkPermit} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/contracts" component={AdminContracts} />
      <Route path="/admin/workpermits" component={AdminWorkPermits} />
      <Route path="/admin/workpermit/:userId" component={AdminWorkPermit} />
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
