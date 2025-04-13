
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
  const { isSignedIn } = useAuth();
  const { currentUser, organizationId } = useSyncUser();
  const { IdleDialog, resetAllStores } = useAuthManager();
  
  // Track auth state changes
  useEffect(() => {
    if (isSignedIn === false) {
      console.log('Auth state change detected in UserSync: User logged out');
      // Force clear all query cache when user logs out
      queryClient.clear();
    }
  }, [isSignedIn]);
  
  // Track organization changes
  useEffect(() => {
    if (organizationId) {
      console.log('Organization changed in UserSync component, refreshing all queries. Current org:', organizationId);
      queryClient.invalidateQueries();
    }
  }, [organizationId]);
  
  // When user logs in (currentUser becomes available), force a full refresh
  // This handles the case of logging in with a different account
  useEffect(() => {
    if (currentUser?.id) {
      console.log('User logged in with ID:', currentUser.id);
      
      // Check if there's a previous user ID in localStorage that's different
      const previousUserId = localStorage.getItem('smartrfq-last-user-id');
      
      if (previousUserId && previousUserId !== currentUser.id) {
        console.log('New user detected, previous user was:', previousUserId);
        console.log('Clearing all caches and forcing refresh');
        
        // Clear all stores
        resetAllStores();
        
        // Force reload the app to ensure clean state
        window.location.reload();
      }
      
      // Store current user ID for future comparison
      localStorage.setItem('smartrfq-last-user-id', currentUser.id);
    }
  }, [currentUser?.id, resetAllStores]);
  
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
