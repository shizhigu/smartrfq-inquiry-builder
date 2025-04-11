
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from "@clerk/clerk-react";
import App from './App.tsx'
import './index.css'

// Use the Clerk publishable key from the environment variable
const PUBLISHABLE_KEY = "pk_test_cmVmaW5lZC1iZWFnbGUtNjMuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Add custom meta tag for API URL
const metaTag = document.createElement('meta');
metaTag.name = 'api-url';
metaTag.content = 'http://uqjpqskash.a.pinggy.link/api';
document.head.appendChild(metaTag);

// Define API URL globally
window.API_URL = 'http://uqjpqskash.a.pinggy.link/api';

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
