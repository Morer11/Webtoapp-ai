import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import VerifyEmailPage from "@/pages/auth/verify-email";
import DashboardPage from "@/pages/dashboard";
import ConversionPage from "@/pages/conversion/index";
import AnalysisPage from "@/pages/conversion/analysis";
import ProgressPage from "@/pages/conversion/progress";
import CompletePage from "@/pages/conversion/complete";
import AdminPage from "@/pages/admin/index";
import PricingUpgradePage from "@/pages/pricing-upgrade";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
        <Route path="/auth/verify-email" component={VerifyEmailPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/conversion" component={ConversionPage} />
        <Route path="/conversion/analysis/:id" component={AnalysisPage} />
        <Route path="/conversion/progress/:id" component={ProgressPage} />
        <Route path="/conversion/complete/:id" component={CompletePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/pricing-upgrade" component={PricingUpgradePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
