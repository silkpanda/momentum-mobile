// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/context/AuthAndHouseholdContext.tsx
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

  // Data Hooks (provided by SWR)
  // We no longer store household/profile in context state.
  // We'll use SWR hooks in the components that need them.
  // This simplifies state management immensely.
  
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
  
  // This is the ONLY piece of household state we track globally.
  // The rest (household, tasks, etc) is fetched by SWR.
  const [currentMemberProfile, setCurrentMemberProfile] = useState<IHouseholdMemberProfile | null>(null);

  // Check for auth token on app load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          // We could verify the token with the API, but for now,
          // just having it means we are "authenticated".
          // The SWR hooks will fail if the token is invalid,
          // which we can handle gracefully.
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
      // The API should return { token: "..." }
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
      // The API should return { token: "..." }
      const { token } = await api.post<{ token: string }>("/auth/signup", credentials);

      if (!token) {
        throw new Error("No token received from API");
      }
      
      await AsyncStorage.setItem("authToken", token);
      setIsAuthenticated(true);
      // When you sign up, you might not have a household yet.
      // The 'No Household' screen in (app)/index.tsx will handle this.
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
    // Clear all SWR cache on sign out
    mutate(() => true, undefined, { revalidate: false });
  };
  
  // Function to select a profile
  const selectMemberProfile = (profile: IHouseholdMemberProfile | null) => {
    setCurrentMemberProfile(profile);
  };


  // The value provided to the context consumers
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
          // Optional: Add global SWR config
          onError: (error, key) => {
            if (error.status === 401 || error.status === 403) {
              // Unauthorized, force a sign-out
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
// These are the hooks we'll use in our components to get data.

/**
 * Fetches the user's session info (user, household).
 * This is the mobile equivalent of the web app's useSession.
 */
export const useSession = () => {
  const { data, error, isLoading, mutate } = useSWR<ISession>("/session");
  
  return {
    session: data,
    error,
    isLoading,
    mutate,
  };
};


/**
 * Fetches the full household data (member profiles, etc.)
 * It's dependent on the session, so it won't run until we have a householdId.
 */
export const useHousehold = () => {
  const { session } = useSession();
  const householdId = session?.household?._id;

  // Only fetch if householdId is available
  const { data, error, isLoading, mutate } = useSWR<IHousehold>(
    householdId ? `/households/${householdId}` : null
  );

  return {
    household: data,
    error,
    isLoading,
    mutate,
  };
};