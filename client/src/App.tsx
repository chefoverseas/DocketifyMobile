import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Docket from "@/pages/docket";
import Contracts from "@/pages/contracts";
import WorkPermit from "@/pages/workpermit";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Admin from "@/pages/admin";
import AdminContracts from "@/pages/admin-contracts";
import AdminUsers from "@/pages/admin-users";
import AdminWorkPermits from "@/pages/admin-workpermits";
import AdminWorkPermit from "@/pages/admin-workpermit";
import AdminUserCreate from "@/pages/admin-user-create";
import AdminUserEdit from "@/pages/admin-user-edit";
import AdminUserDetail from "@/pages/admin-user-detail";
import AdminDockets from "@/pages/admin-dockets";
import AdminDocketDetail from "@/pages/admin-docket-detail";
import AdminContractDetail from "@/pages/admin-contract-detail";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/docket" component={Docket} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/workpermit" component={WorkPermit} />
        </>
      )}
      {/* Admin routes - separate authentication */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/contracts" component={AdminContracts} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/workpermits" component={AdminWorkPermits} />
      <Route path="/admin/workpermit/:userId" component={AdminWorkPermit} />
      <Route path="/admin/user/new" component={AdminUserCreate} />
      <Route path="/admin/user/:userId/edit" component={AdminUserEdit} />
      <Route path="/admin/user/:userId" component={AdminUserDetail} />
      <Route path="/admin/dockets" component={AdminDockets} />
      <Route path="/admin/docket/:userId">
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
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
