// silkpanda/momentum-mobile/momentum-mobile-15b59c26f6ccaf50749d72d04c8e30b0a6821e20/context/AuthAndHouseholdContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SWRConfig } from "swr";
import useSWR, { mutate } from "swr";
import api, { swrFetcher, ApiError } from "../lib/api"; // <-- Path Updated
import { IHousehold, ISession, IHouseholdMemberProfile } from "../lib/types"; // <-- Path Updated

// Define the shape of the authentication context
export interface IAuthAndHouseholdContext {
  // Auth State
  isAuthenticated: boolean;
  isLoading: boolean; // This is now for auth actions (login, etc)

  // Auth Methods
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (credentials: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;

  // Profile Selection
  currentMemberProfile: IHouseholdMemberProfile | null;
  selectMemberProfile: (profile: IHouseholdMemberProfile | null) => void;
}

// Create the context
const AuthAndHouseholdContext = createContext<IAuthAndHouseholdContext | undefined>(
  undefined
);

// Define the props for the provider
interface AuthAndHouseholdProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthAndHouseholdProvider: React.FC<AuthAndHouseholdProviderProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // This is now for the initial token check
  
  const [currentMemberProfile, setCurrentMemberProfile] = useState<IHouseholdMemberProfile | null>(null);

  // Check for auth token on app load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Failed to load auth token:", e);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // --- Real Auth Methods ---

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { token } = await api.post<{ token: string }>("/auth/login", {
        email,
        password,
      });

      if (!token) {
        throw new Error("No token received from API");
      }

      await AsyncStorage.setItem("authToken", token);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Login Failed: ${err.message}`);
      } else {
        alert("An unknown error occurred.");
      }
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (credentials: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { token } = await api.post<{ token: string }>("/auth/signup", credentials);

      if (!token) {
        throw new Error("No token received from API");
      }
      
      await AsyncStorage.setItem("authToken", token);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Sign Up Failed: ${err.message}`);
      } else {
        alert("An unknown error occurred.");
      }
      setIsLoading(false);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    await AsyncStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setCurrentMemberProfile(null);
    mutate(() => true, undefined, { revalidate: false });
  };
  
  const selectMemberProfile = (profile: IHouseholdMemberProfile | null) => {
    setCurrentMemberProfile(profile);
  };


  const contextValue: IAuthAndHouseholdContext = {
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    currentMemberProfile,
    selectMemberProfile,
  };

  return (
    <AuthAndHouseholdContext.Provider value={contextValue}>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          onError: (error, key) => {
            if (error.status === 401 || error.status === 403) {
              console.error("SWR: Auth error, signing out.", key);
              signOut();
            }
          },
        }}
      >
        {children}
      </SWRConfig>
    </AuthAndHouseholdContext.Provider>
  );
};

// Create the custom hook
export const useAuthAndHousehold = () => {
  const context = useContext(AuthAndHouseholdContext);
  if (context === undefined) {
    throw new Error(
      "useAuthAndHousehold must be used within an AuthAndHouseholdProvider"
    );
  }
  return context;
};

// --- NEW DATA HOOKS ---

/**
 * Fetches the user's session info (user, householdId).
 */
export const useSession = () => {
  const { data, error, isLoading, mutate } = useSWR<ISession>("/auth/me");
  
  return {
    session: data,
    error,
    isLoading,
    mutate,
  };
};


/**
 * Fetches the full household data (member profiles, etc.)
 */
export const useHousehold = () => {
  const { session } = useSession();
  const householdId = session?.householdId;

  //
  // --- THIS IS THE CRITICAL CHANGE ---
  // The server route is '/households', not '/households/:id'.
  //
  const { data, error, isLoading, mutate } = useSWR<IHousehold>(
    householdId ? `/households` : null // <-- WAS: `/households/${householdId}`
  );

  return {
    household: data,
    error,
    isLoading,
    mutate,
  };
};