
// Base URL from new backend
import { API_CONFIG, useMockData } from '../config';
import { mockUsers } from '../mock/mockData';

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
  if (useMockData()) {
    console.log('Using mock data for fetchCurrentUser');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers[0];
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/me`, {
    headers,
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
  if (useMockData()) {
    console.log('Using mock data for syncUser');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers[0];
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/sync-user`, {
    method: 'POST',
    headers,
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
  if (useMockData()) {
    console.log('Using mock data for updateUserProfile');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    const updatedUser = {
      ...mockUsers[0],
      ...userData
    };
    return updatedUser;
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/me`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update user profile');
  }

  return response.json();
}
