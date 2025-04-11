
// Base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  const response = await fetch(`${BASE_URL}/me`, {
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
  const response = await fetch(`${BASE_URL}/sync-user`, {
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
  const response = await fetch(`${BASE_URL}/me`, {
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
