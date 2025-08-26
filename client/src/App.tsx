import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import EmailLogin from "@/pages/email-login";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Docket from "@/pages/docket";
import Contracts from "@/pages/contracts";
import WorkPermit from "@/pages/workpermit";
import WorkVisa from "@/pages/workvisa";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Admin from "@/pages/admin";
import AdminContracts from "@/pages/admin-contracts";
import AdminUsers from "@/pages/admin-users";
import AdminWorkPermits from "@/pages/admin-workpermits";
import AdminWorkPermit from "@/pages/admin-workpermit";
import AdminWorkVisas from "@/pages/admin-workvisas";
import AdminSync from "@/pages/admin-sync";
import AdminAudit from "@/pages/admin-audit";
import AdminUserCreate from "@/pages/admin-user-create";
import AdminUserEdit from "@/pages/admin-user-edit";
import AdminUserDetail from "@/pages/admin-user-detail";
import AdminDockets from "@/pages/admin-dockets";
import AdminDocketDetail from "@/pages/admin-docket-detail";
import AdminContractDetail from "@/pages/admin-contract-detail";
import AdminDocketUpload from "@/pages/admin-docket-upload";
import AdminContractUpload from "@/pages/admin-contract-upload";
import AdminArchive from "@/pages/admin-archive";

import AdminMonitoring from "@/pages/admin-monitoring";
import AdminSettings from "@/pages/admin-settings";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminInsights from "@/pages/admin-insights";
import AdminReports from "@/pages/admin-reports";
import NotFound from "@/pages/not-found";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import OTPVerification from "@/pages/otp-verification";

import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/chef-overseas-logo.png" alt="Chef Overseas" className="h-16 w-auto mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={EmailLogin} />
          <Route path="/auth/otp" component={OTPVerification} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/docket" component={Docket} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/workpermit" component={WorkPermit} />
          <Route path="/workvisa" component={WorkVisa} />
        </>
      )}
      {/* Admin routes - separate authentication */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/contracts" component={AdminContracts} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/workpermits" component={AdminWorkPermits} />
      <Route path="/admin/workpermit/:userId" component={AdminWorkPermit} />
      <Route path="/admin/workvisas" component={AdminWorkVisas} />
      <Route path="/admin/sync" component={AdminSync} />
      <Route path="/admin/audit" component={AdminAudit} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/insights" component={AdminInsights} />
      <Route path="/admin/monitoring" component={AdminMonitoring} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/archive" component={AdminArchive} />

      <Route path="/admin/interviews">
        {() => {
          window.location.href = "/admin/workvisas";
          return null;
        }}
      </Route>
      <Route path="/admin/embassy-tracking">
        {() => {
          window.location.href = "/admin/workvisas";
          return null;
        }}
      </Route>
      <Route path="/admin/user/new" component={AdminUserCreate} />
      <Route path="/admin/user/:userId/edit">
        {params => <AdminUserEdit userId={params.userId} />}
      </Route>
      <Route path="/admin/user/:userId/upload-docket">
        {params => <AdminDocketUpload userId={params.userId} />}
      </Route>
      <Route path="/admin/user/:userId/upload-contracts">
        {params => <AdminContractUpload userId={params.userId} />}
      </Route>
      <Route path="/admin/user/:userId">
        {params => <AdminUserDetail userId={params.userId} />}
      </Route>
      <Route path="/admin/dockets" component={AdminDockets} />
      <Route path="/admin/docket/:userId">
        {params => <AdminDocketDetail userId={params.userId} />}
      </Route>
      <Route path="/admin/docket-detail/:userId">
        {params => <AdminDocketDetail userId={params.userId} />}
      </Route>
      <Route path="/admin/contracts/:userId">
        {params => <AdminContractDetail userId={params.userId} />}
      </Route>
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster />
            <Navigation />
            <div className="flex-1">
              <Router />
            </div>
            <Footer />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
