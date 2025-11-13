// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/app/context/AuthAndHouseholdContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the shape of a Household Member Profile (embedded in Household)
export interface IHouseholdMemberProfile {
  _id: string; // This will be the MongoDB ObjectId
  familyMemberId: string; // Reference to the FamilyMember document
  displayName: string;
  role: "parent" | "child" | "other";
  profileColor: string; // e.g., "#EF4444"
  pointsTotal: number;
}

// Define the shape of the Household document
export interface IHousehold {
  _id: string;
  householdName: string;
  memberProfiles: IHouseholdMemberProfile[];
  // Other household-specific fields (e.g., tasks, rewards) will go here
}

// Define the shape of the authentication context
export interface IAuthAndHouseholdContext {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentHousehold: IHousehold | null;
  currentMemberProfile: IHouseholdMemberProfile | null;
  
  // --- AUTH METHODS ---
  signIn: (email?: string, password?: string) => Promise<boolean>;
  signUp: (credentials: { // <-- FIX: Added signUp to the interface
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthAndHouseholdContext = createContext<IAuthAndHouseholdContext | undefined>(
  undefined
);

// Define the props for the provider
interface AuthAndHouseholdProviderProps {
  children: ReactNode;
}

// --- MOCK DATA ---
const MOCK_HOUSEHOLD_1: IHousehold = {
  _id: "h001",
  householdName: "The Adventure Team",
  memberProfiles: [
    {
      _id: "m001",
      familyMemberId: "fm001", // Parent 1
      displayName: "Sarah",
      role: "parent",
      profileColor: "#EF4444", // red-500
      pointsTotal: 0,
    },
    {
      _id: "m002",
      familyMemberId: "fm002", // Child 1
      displayName: "Leo",
      role: "child",
      profileColor: "#3B82F6", // blue-500
      pointsTotal: 1250,
    },
    {
      _id: "m003",
      familyMemberId: "fm003", // Child 2
      displayName: "Maya",
      role: "child",
      profileColor: "#10B981", // emerald-500
      pointsTotal: 800,
    },
    {
        _id: "m004",
        familyMemberId: "fm004", // Parent 2
        displayName: "Alex",
        role: "parent",
        profileColor: "#8B5CF6", // violet-500
        pointsTotal: 0,
      },
  ],
};
// --- END MOCK DATA ---


// Create the provider component
export const AuthAndHouseholdProvider: React.FC<AuthAndHouseholdProviderProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHousehold, setCurrentHousehold] = useState<IHousehold | null>(null);
  const [currentMemberProfile, setCurrentMemberProfile] = useState<IHouseholdMemberProfile | null>(null);

  // Check for auth token on app load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setIsAuthenticated(true);
          setCurrentHousehold(MOCK_HOUSEHOLD_1); // Load mock data
        } else {
          setIsAuthenticated(false);
          setCurrentHousehold(null);
        }
      } catch (e) {
        console.error("Failed to load auth token:", e);
        setIsAuthenticated(false);
        setCurrentHousehold(null);
      } finally {
        setTimeout(() => setIsLoading(false), 500); // Simulate loading
      }
    };

    checkAuth();
  }, []);

  // --- Mock Auth Methods ---
  const signIn = async (email?: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await AsyncStorage.setItem("authToken", "mock-auth-token");
          setIsAuthenticated(true);
          setCurrentHousehold(MOCK_HOUSEHOLD_1); 
          setIsLoading(false);
          resolve(true);
        } catch (e) {
          console.error("Failed to save auth token:", e);
          setIsLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  // --- FIX: Added the actual signUp function ---
  const signUp = async (credentials: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call for sign up
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          // Simulate successful sign up and immediate login
          await AsyncStorage.setItem("authToken", "mock-auth-token-new-user");
          setIsAuthenticated(true);
          // In Phase 2.3, this will be different (Create/Join Household).
          setCurrentHousehold(MOCK_HOUSEHOLD_1);
          setIsLoading(false);
          resolve(true);
        } catch (e) {
          console.error("Failed to save auth token:", e);
          setIsLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await AsyncStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setCurrentHousehold(null);
          setCurrentMemberProfile(null);
          setIsLoading(false);
          resolve();
        } catch (e) {
          console.error("Failed to remove auth token:", e);
          setIsLoading(false);
          resolve();
        }
      }, 500);
    });
  };

  // The value provided to the context consumers
  const contextValue: IAuthAndHouseholdContext = {
    isAuthenticated,
    isLoading,
    currentHousehold,
    currentMemberProfile,
    signIn,
    signUp, // <-- FIX: Pass the function in the provider value
    signOut,
  };

  return (
    <AuthAndHouseholdContext.Provider value={contextValue}>
      {children}
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