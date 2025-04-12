// Base URL from new backend
import { API_CONFIG, useMockData } from '../config';
import { ENABLE_MOCKS, mockUsers } from '../mock/mockData';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  external_id: string;
  created_at: string;
}

// Get current user profile
export async function fetchCurrentUser(token: string): Promise<User> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for fetchCurrentUser');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers[0];
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch user profile');
  }

  return response.json();
}

// Sync Clerk user with backend
export async function syncUser(token: string): Promise<User> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for syncUser');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers[0];
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/sync-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to sync user');
  }

  return response.json();
}

// Update user profile
export async function updateUserProfile(
  token: string, 
  userData: { name?: string; avatar_url?: string }
): Promise<User> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for updateUserProfile');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    const updatedUser = {
      ...mockUsers[0],
      ...userData
    };
    return updatedUser;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update user profile');
  }

  return response.json();
}
