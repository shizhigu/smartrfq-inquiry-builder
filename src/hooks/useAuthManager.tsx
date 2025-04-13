
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useUserStore } from '@/stores/userStore';
import { useAppStore } from '@/stores/appStore';
import { useProjectStore } from '@/stores/projectStore';
import { useSupplierStore } from '@/stores/supplierStore';
import { useRfqStore } from '@/stores/rfqStore';
import { useEmailStore } from '@/stores/emailStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Idle timeout in milliseconds (15 minutes)
const IDLE_TIMEOUT = 15 * 60 * 1000;

export function useAuthManager() {
  const { signOut, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [showIdleDialog, setShowIdleDialog] = useState(false);
  
  // Get reset methods from all stores
  const userStore = useUserStore();
  const appStore = useAppStore();
  const projectStore = useProjectStore();
  const supplierStore = useSupplierStore();
  const rfqStore = useRfqStore();
  const emailStore = useEmailStore();
  
  // Timer references
  const idleTimerRef = useRef<number | null>(null);
  const dialogTimerRef = useRef<number | null>(null);
  
  // Function to reset all store states and clear localStorage
  const resetAllStores = useCallback(() => {
    console.log('Resetting all stores and clearing localStorage');
    
    // First reset all stores (this updates the memory state)
    userStore.resetState();
    appStore.resetState();
    projectStore.resetState();
    supplierStore.resetState();
    rfqStore.resetState();
    emailStore.resetState();
    
    // Clear all Zustand persistent stores from localStorage
    localStorage.removeItem('smartrfq-user-state');
    localStorage.removeItem('smartrfq-app-state');
    localStorage.removeItem('smartrfq-project-state');
    localStorage.removeItem('smartrfq-supplier-state');
    localStorage.removeItem('smartrfq-rfq-state');
    // No need to clear email store as it doesn't use persist
    
    console.log('All Zustand stores reset and localStorage cleared');
  }, [userStore, appStore, projectStore, supplierStore, rfqStore, emailStore]);
  
  // Check auth state changes - handle logout detection
  useEffect(() => {
    // This effect will run when isSignedIn changes to false (user logged out)
    if (isSignedIn === false) {
      console.log('User logged out detected, resetting all stores');
      resetAllStores();
    }
  }, [isSignedIn, resetAllStores]);
  
  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      console.log('Manual logout initiated, resetting all stores');
      
      // Reset all stores and clear localStorage first
      resetAllStores();
      
      // Sign out with Clerk
      await signOut();
      
      // Redirect to homepage
      navigate('/');
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  }, [signOut, resetAllStores, navigate]);
  
  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    // Clear existing timers
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    
    if (dialogTimerRef.current) {
      window.clearTimeout(dialogTimerRef.current);
    }
    
    // Close idle dialog if open
    if (showIdleDialog) {
      setShowIdleDialog(false);
    }
    
    // Set new idle timer
    idleTimerRef.current = window.setTimeout(() => {
      // Show idle dialog
      setShowIdleDialog(true);
      
      // Set auto-logout timer (1 minute after dialog shown)
      dialogTimerRef.current = window.setTimeout(() => {
        handleLogout();
      }, 60000);
    }, IDLE_TIMEOUT);
  }, [handleLogout, showIdleDialog]);
  
  // Handle user activity
  useEffect(() => {
    // List of events to reset the idle timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'touchstart',
      'scroll',
      'click'
    ];
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer);
    });
    
    // Initialize idle timer
    resetIdleTimer();
    
    // Cleanup event listeners and timers
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
      
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      
      if (dialogTimerRef.current) {
        window.clearTimeout(dialogTimerRef.current);
      }
    };
  }, [resetIdleTimer]);
  
  // Handle staying active
  const handleStayActive = () => {
    resetIdleTimer();
  };
  
  // Idle dialog component
  const IdleDialog = (
    <Dialog open={showIdleDialog} onOpenChange={setShowIdleDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you still there?</DialogTitle>
          <DialogDescription>
            You've been inactive for a while. For security reasons, you'll be logged out automatically in 1 minute.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleLogout}>
            Log out now
          </Button>
          <Button onClick={handleStayActive}>
            I'm still here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  return {
    logout: handleLogout,
    resetIdleTimer,
    IdleDialog,
    resetAllStores // Export this so it can be used elsewhere if needed
  };
}
