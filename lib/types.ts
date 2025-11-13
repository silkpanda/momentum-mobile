// silkpanda/momentum-mobile/momentum-mobile-15b59c26f6ccaf50749d72d04c8e30b0a6821e20/lib/types.ts

// (Other types like ITask, IStoreItem, etc. would be here)

export interface IHouseholdMemberProfile {
  _id: string;
  familyMemberId: string;
  displayName: string;
  profileColor: string;
  role: "Parent" | "Child";
  pointsTotal: number;
}

export interface IHousehold {
  _id: string;
  name: string;
  ownerId: string;
  memberProfiles: IHouseholdMemberProfile[];
  // Other household data (tasks, store items) will be fetched by other hooks
}

/**
 * Defines the shape of the data returned from the /api/v1/auth/me endpoint.
 */
export interface ISession {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "Parent" | "Child";
  };
  
  //
  // FIX: Changed this to match the web app and the actual API response.
  // The API sends `householdId`, not a populated `household` object.
  //
  householdId: string | null;
}