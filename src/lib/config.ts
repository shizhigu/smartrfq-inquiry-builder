
/**
 * Global configuration settings for the application
 */

// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: 'https://uqjpqskash.a.pinggy.link/api',
  
  // Set to false to use real API endpoints instead of mock data
  // This can be overridden by localStorage for development convenience
  USE_MOCK_DATA: false,
};

/**
 * Determines whether to use mock data or real API calls
 * Checks localStorage first (for development convenience), then falls back to the config value
 */
export function useMockData(): boolean {
  // Check if localStorage setting exists
  const localStorageSetting = localStorage.getItem('useMockData');
  
  // If localStorage has a value, use that; otherwise use the config default
  if (localStorageSetting !== null) {
    return localStorageSetting === 'true';
  }
  
  // Fall back to config value
  return API_CONFIG.USE_MOCK_DATA;
}

/**
 * Toggle whether to use mock data or real API calls
 * @param value - True to use mock data, false to use real API
 */
export function setUseMockData(value: boolean): void {
  localStorage.setItem('useMockData', value.toString());
  // Force page reload to apply the change
  window.location.reload();
}
