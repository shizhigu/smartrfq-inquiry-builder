
import { useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/clerk-react';
import { syncUser, fetchCurrentUser } from '@/lib/api/users';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import { useMockData } from '@/lib/config';

/**
 * Custom hook to synchronize the Clerk user with the SmartRFQ backend
 * and store the user data in the userStore
 */
export function useSyncUser() {
  const { userId, getToken, isLoaded, isSignedIn } = useAuth();
  const { organization } = useOrganization();
  const { 
    currentUser, 
    setCurrentUser, 
    setLoading, 
    setError,
    token,
    setToken
  } = useUserStore();
  
  useEffect(() => {
    const syncUserWithBackend = async () => {
      // If mocks are enabled, we can skip the check for Clerk auth
      if (useMockData()) {
        try {
          setLoading(true);
          
          // For mock mode, we'll just fetch the current user
          // In a real app, we'd use the token from Clerk
          const mockToken = "mock-token";
          
          // Store the token in Zustand
          setToken(mockToken);
          
          // If we already have a user in the store, just fetch their profile
          // Otherwise, sync the Clerk user with the backend
          let user;
          if (currentUser) {
            user = await fetchCurrentUser(mockToken);
          } else {
            user = await syncUser(mockToken);
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
        return;
      }
      
      // Only proceed if Clerk auth is loaded and user is signed in
      if (!isLoaded || !isSignedIn || !userId) return;
      
      try {
        setLoading(true);
        
        // Get token with organization context
        // Using organizationId parameter instead of template
        const clerkToken = await getToken({ 
          organizationId: organization?.id  // Pass the organization ID directly
        });
        
        if (!clerkToken) {
          toast.error('Authentication error');
          return;
        }
        
        // Store the token in Zustand
        setToken(clerkToken);
        
        console.log('Using token with organization data, current org:', organization?.id);
        
        // If we already have a user in the store, just fetch their profile
        // Otherwise, sync the Clerk user with the backend
        let user;
        if (currentUser) {
          user = await fetchCurrentUser(clerkToken);
        } else {
          user = await syncUser(clerkToken);
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
  }, [userId, getToken, isLoaded, isSignedIn, organization?.id]); // Organization ID dependency
  
  return { currentUser, organizationId: organization?.id, token };
}

