import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { syncUser, fetchCurrentUser } from '@/lib/api/users';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';

/**
 * Custom hook to synchronize the Clerk user with the SmartRFQ backend
 * and store the user data in the userStore
 */
export function useSyncUser() {
  const { userId, getToken, isLoaded, isSignedIn } = useAuth();
  const { currentUser, setCurrentUser, setLoading, setError } = useUserStore();
  
  useEffect(() => {
    const syncUserWithBackend = async () => {
      // Only proceed if Clerk auth is loaded and user is signed in
      if (!isLoaded || !isSignedIn || !userId) return;
      
      try {
        setLoading(true);
        
        const token = await getToken();
        if (!token) {
          toast.error('Authentication error');
          return;
        }
        
        // If we already have a user in the store, just fetch their profile
        // Otherwise, sync the Clerk user with the backend
        let user;
        if (currentUser) {
          user = await fetchCurrentUser(token);
        } else {
          user = await syncUser(token);
        }
        
        setCurrentUser(user);
        console.log('User synced with backend:', user.name);
      } catch (error) {
        console.error('Failed to sync user', error);
        setError(error instanceof Error ? error.message : 'Failed to sync user');
        toast.error('Failed to connect with the backend');
      } finally {
        setLoading(false);
      }
    };
    
    syncUserWithBackend();
  }, [userId, getToken, isLoaded, isSignedIn]);
  
  return { currentUser };
}
