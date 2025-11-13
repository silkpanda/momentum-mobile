// silkpanda/momentum-mobile/momentum-mobile-48a3bdaec149b6570562600bab21372e4eb95908/context/AuthAndHouseholdContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/utils/config';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// --- Types for Household Data (matches API Schema) ---

// The nested profile sub-document from the Household model
export interface IHouseholdMemberProfile {
  _id: string; // Mongoose sub-document ID
  familyMemberId: {
    _id: string;
    firstName: string;
    email: string;
  };
  displayName: string;
  profileColor: string;
  role: 'Parent' | 'Child';
  pointsTotal: number;
}

// The main Household document
export interface IHousehold {
  _id: string;
  householdName: string;
  memberProfiles: IHouseholdMemberProfile[];
  createdAt: string;
  updatedAt: string;
}

// --- Context Definition ---

interface IAuthAndHouseholdContext {
  isAuthenticated: boolean;
  authToken: string | null;
  currentHousehold: IHousehold | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  fetchHousehold: () => Promise<void>;
  currentMemberProfile: IHouseholdMemberProfile | null;
}

const AuthAndHouseholdContext = createContext<IAuthAndHouseholdContext | undefined>(undefined);

export const AuthAndHouseholdProvider = ({ children }: { children: ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentHousehold, setCurrentHousehold] = useState<IHousehold | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // NOTE: This state should ideally be determined by comparing req.user._id (from token) 
  // with the memberProfiles array. For now, we'll use the first Parent found.
  const currentMemberProfile = currentHousehold?.memberProfiles.find(
    (profile) => profile.role === 'Parent' // Assume the logged-in user is a Parent for initial setup
  ) || null;
  
  // Initial check (simulates checking for a stored token)
  useEffect(() => {
    // In a real app, this is where you'd check SecureStore for a token
    // If a token is found, you would call setAuthToken(storedToken)
    setIsLoading(false);
  }, []);

  const signOut = () => {
    setAuthToken(null);
    setCurrentHousehold(null);
    // In a real app, clear the token from storage here
    router.replace('/login');
  };

  const fetchHousehold = async (tokenOverride?: string) => {
    const token = tokenOverride || authToken;
    if (!token) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/households`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        // If the token is valid but no household is found (404), we keep the user logged in but no household context.
        if (response.status === 404) {
            setCurrentHousehold(null);
            return;
        }
        
        // For other errors (401 Unauthorized), we should sign out.
        if (response.status === 401) {
            signOut();
            Alert.alert("Session Expired", "Please sign in again.");
            return;
        }

        throw new Error(data.message || 'Failed to fetch household data');
      }

      // The API returns { status: 'success', data: { household } }
      setCurrentHousehold(data.data.household);

    } catch (error: any) {
      console.error("Household Fetch Error:", error.message);
      // We keep the user signed in, but without household context, which will trigger the Create Household flow.
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function called from login screen
  const signIn = async (token: string) => {
    setAuthToken(token);
    // In a real app, save the token to storage here
    await fetchHousehold(token); 
    // Redirect is now handled by the login screen after this function resolves
  };

  // Re-fetch logic if token changes or if we navigate into the app while already authenticated
  useEffect(() => {
    if (authToken) {
      fetchHousehold();
    }
  }, [authToken]);


  return (
    <AuthAndHouseholdContext.Provider
      value={{
        isAuthenticated: !!authToken,
        authToken,
        currentHousehold,
        isLoading,
        signIn,
        signOut,
        fetchHousehold,
        currentMemberProfile,
      }}
    >
      {children}
    </AuthAndHouseholdContext.Provider>
  );
};

export const useAuthAndHousehold = () => {
  const context = useContext(AuthAndHouseholdContext);
  if (context === undefined) {
    throw new Error('useAuthAndHousehold must be used within an AuthAndHouseholdProvider');
  }
  return context;
};