// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/app/lib/types.ts

// The user's global identity, from the FamilyMember document
export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// The profile for a member *within* a specific household
export interface IHouseholdMemberProfile {
  _id: string; // This is the profile's unique ID
  familyMemberId: string; // Reference to the FamilyMember document
  displayName: string;
  role: "parent" | "child" | "other";
  profileColor: string; // e.g., "#EF4444"
  pointsTotal: number;
}

// The Household document
export interface IHousehold {
  _id: string;
  householdName: string;
  memberProfiles: IHouseholdMemberProfile[];
  // tasks and storeItems will be fetched from separate endpoints
}

// The core session payload, combining user and household info
export interface ISession {
  user: IUser;
  household: {
    _id: string;
    householdName: string;
  };
}

// A Task
export interface ITask {
  _id: string;
  name: string;
  points: number;
  status: "pending" | "completed" | "approved";
  assignedTo: string; // This will be a profile _id
  // Add other fields from the web app as needed
}

// A Store Item
export interface IStoreItem {
  _id: string;
  name: string;
  points: number;
  stock: number;
  // Add other fields from the web app as needed
}