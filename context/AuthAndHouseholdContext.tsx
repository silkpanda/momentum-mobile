import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
// Correctly importing axios
import axios from 'axios';
import { IHousehold, IMemberProfile, ITask, IStoreItem } from '../lib/types';
import apiClient, { getKioskData } from '../lib/api';

// Define the shape of the data returned by the BFF
interface KioskData {
  status: string;
  data: {
    household: IHousehold;
    tasks: ITask[];
    storeItems: IStoreItem[];
  };
}

// Define the shape of the context
interface AuthContextType {
  authToken: string | null;
  household: IHousehold | null;
  tasks: ITask[];
  storeItems: IStoreItem[];
  isLoading: boolean;
  selectedMember: IMemberProfile | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (formData: any) => Promise<void>;
  logout: () => void;
  selectMember: (member: IMemberProfile | null) => void;
  fetchHouseholdData: () => Promise<void>; // To allow manual refresh
}

const AuthAndHouseholdContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthAndHouseholdContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook to manage auth state and redirects
function useProtectedRoute(authToken: string | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!authToken && !inAuthGroup) {
      router.replace('/login');
    } else if (authToken && inAuthGroup) {
      router.replace('/');
    }
  }, [authToken, segments, router]);
}

// The provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [household, setHousehold] = useState<IHousehold | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [storeItems, setStoreItems] = useState<IStoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<IMemberProfile | null>(
    null,
  );

  useProtectedRoute(authToken);

  const fetchHouseholdData = useCallback(async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      // We call our new getKioskData function which hits the BFF.
      const data: KioskData = await getKioskData();

      if (data.status === 'success' && data.data.household) {
        setHousehold(data.data.household);
        setTasks(data.data.tasks || []);
        setStoreItems(data.data.storeItems || []);
      }
    } catch (error) {
      console.error('Failed to fetch household data from BFF:', error);
      // If we fail (e.g., token expired), log out
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  // Load token and data on app start
  useEffect(() => {
    const loadAuthData = async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          setAuthToken(token);
          // Manually set token for subsequent apiClient requests
          apiClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${token}`;

          const data: KioskData = await getKioskData();

          if (data.status === 'success' && data.data.household) {
            setHousehold(data.data.household);
            setTasks(data.data.tasks || []);
            setStoreItems(data.data.storeItems || []);
          } else {
            // Token might be invalid, clear it
            await SecureStore.deleteItemAsync('token');
            setAuthToken(null);
          }
        }
      } catch (e) {
        console.error('Failed to load auth token:', e);
        await SecureStore.deleteItemAsync('token');
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // --- THIS IS THE FIX ---
      // Changed 'password' to 'pass' to match the function argument
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password: pass, // Using the 'pass' variable here
      });
      // --- END OF FIX ---

      if (response.data.token) {
        const { token } = response.data;
        await SecureStore.setItemAsync('token', token);
        setAuthToken(token);
        // Set token for all future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch household data after successful login
        await fetchHouseholdData();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (formData: any) => {
    setIsLoading(true);
    try {
      // The signup endpoint is now on the BFF.
      const response = await apiClient.post('/api/v1/auth/signup', formData);

      if (response.data.token) {
        const { token } = response.data;
        await SecureStore.setItemAsync('token', token);
        setAuthToken(token);
        // Set token for all future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch household data after successful signup
        await fetchHouseholdData();
      }
    } catch (error) {
      console.error('Signup failed:', error);
      // Use the correctly imported 'axios'
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message ||
            'Signup failed. Please try again.',
        );
      }
      throw new Error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setAuthToken(null);
    setHousehold(null);
    setTasks([]);
    setStoreItems([]);
    setSelectedMember(null);
    // Remove auth header from apiClient
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const selectMember = (member: IMemberProfile | null) => {
    setSelectedMember(member);
  };

  const value = {
    authToken,
    household,
    tasks,
    storeItems,
    isLoading,
    selectedMember,
    login,
    signup,
    logout,
    selectMember,
    fetchHouseholdData,
  };

  return (
    <AuthAndHouseholdContext.Provider value={value}>
      {children}
    </AuthAndHouseholdContext.Provider>
  );
};