
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp, useAuth, useOrganization } from "@clerk/clerk-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import RfqItems from "./pages/RfqItems";
import Suppliers from "./pages/Suppliers";
import Emails from "./pages/Emails";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ManageSubscription from "./pages/ManageSubscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import { useSyncUser } from "./hooks/useSyncUser";
import { useAuthManager } from "./hooks/useAuthManager";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function UserSync({ children }: { children: React.ReactNode }) {
  const { organization } = useOrganization();
  const { currentUser, organizationId } = useSyncUser();
  const { IdleDialog } = useAuthManager();
  
  // Reset and refetch queries when organization changes
  useEffect(() => {
    if (organizationId) {
      console.log('Organization changed in UserSync component, refreshing all queries. Current org:', organizationId);
      // Invalidate and refetch all queries to ensure data is up-to-date for the new org
      queryClient.invalidateQueries();
    }
  }, [organizationId]);
  
  return (
    <>
      {children}
      {IdleDialog}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
          
          <Route path="/dashboard" element={
            <>
              <SignedIn>
                <UserSync>
                  <AppLayout />
                </UserSync>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="rfq" element={<RfqItems />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="emails" element={<Emails />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="subscription" element={<ManageSubscription />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-canceled" element={<PaymentCanceled />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

