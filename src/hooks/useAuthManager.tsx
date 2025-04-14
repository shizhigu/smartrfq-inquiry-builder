
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

// Idle timeout in milliseconds (1 minute for testing)
const IDLE_TIMEOUT = 1 * 60 * 1000;
// Dialog countdown duration (30 seconds)
const COUNTDOWN_DURATION = 30;

export function useAuthManager() {
  const { signOut, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [showIdleDialog, setShowIdleDialog] = useState(false);
  const [countdownTime, setCountdownTime] = useState(COUNTDOWN_DURATION);
  
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
  const countdownIntervalRef = useRef<number | null>(null);
  
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
      
      // Clear all timers
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      
      if (dialogTimerRef.current) {
        window.clearTimeout(dialogTimerRef.current);
        dialogTimerRef.current = null;
      }
      
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      // Reset all stores and clear localStorage first
      resetAllStores();
      
      // Close the dialog
      setShowIdleDialog(false);
      
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
  
  // Start countdown timer for auto logout
  const startCountdown = useCallback(() => {
    console.log('Starting countdown timer');
    // Reset countdown time
    setCountdownTime(COUNTDOWN_DURATION);
    
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
    }
    
    // Set up countdown interval that updates every second
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdownTime(prevTime => {
        const newTime = prevTime - 1;
        console.log('Countdown: ', newTime);
        
        // If time is up, clear interval and trigger logout
        if (newTime <= 0) {
          console.log('Countdown finished, logging out automatically');
          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          // Automatically log out when countdown reaches zero
          handleLogout();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [handleLogout]);
  
  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    // Only reset if user is not already being shown the idle dialog
    if (showIdleDialog) {
      return;
    }
    
    // Clear existing timers
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    
    // Set new idle timer
    idleTimerRef.current = window.setTimeout(() => {
      console.log('User idle detected, showing idle dialog');
      setShowIdleDialog(true);
      startCountdown();
    }, IDLE_TIMEOUT);
  }, [showIdleDialog, startCountdown]);
  
  // Handle user activity
  useEffect(() => {
    // Only set up event listeners if the user is signed in
    if (!isSignedIn) return;
    
    console.log('Setting up idle detection');
    
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
      console.log('Cleaning up idle detection');
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
      
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      
      if (dialogTimerRef.current) {
        window.clearTimeout(dialogTimerRef.current);
      }
      
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, [resetIdleTimer, isSignedIn]);
  
  // Handle staying active
  const handleStayActive = useCallback(() => {
    console.log('User clicked "Stay active"');
    // Clear countdown timer
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Hide the dialog
    setShowIdleDialog(false);
    
    // Reset the idle timer
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    
    // Set new idle timer
    idleTimerRef.current = window.setTimeout(() => {
      console.log('User idle detected, showing idle dialog');
      setShowIdleDialog(true);
      startCountdown();
    }, IDLE_TIMEOUT);
  }, [startCountdown]);
  
  // Idle dialog component
  const IdleDialog = (
    <Dialog open={showIdleDialog} onOpenChange={(open) => {
      if (!open) {
        // Prevent the dialog from being closed by clicking outside
        // We want the user to explicitly choose an option
        return;
      }
    }}>
      <DialogContent onEscapeKeyDown={(e) => {
        // Prevent closing on escape key
        e.preventDefault();
      }} onInteractOutside={(e) => {
        // Prevent closing when clicking outside
        e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle>Are you still there?</DialogTitle>
          <DialogDescription>
            You've been inactive for a while. For security reasons, you'll be logged out automatically in <strong>{countdownTime}</strong> seconds.
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
    resetAllStores
  };
}
