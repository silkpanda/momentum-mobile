// lib/types.ts

// --- THIS IS THE FIX ---
// We MUST export IMemberProfile as its own interface
// so we can import it in other files (like the context).
export interface IMemberProfile {
  _id: string;
  familyMemberId: string;
  displayName: string;
  profileColor: string;
  role: 'Parent' | 'Child';
  pointsTotal: number;
}
// --- END OF FIX ---

// This is the main Household object
export interface IHousehold {
  _id: string;
  householdName: string;
  // This array now correctly uses the exported interface
  memberProfiles: IMemberProfile[];
  createdAt: string;
  updatedAt: string;
}

// This is the Task object
export interface ITask {
  _id: string;
  householdId: string;
  title: string;
  description?: string;
  pointsValue: number;
  status: 'Pending' | 'PendingApproval' | 'Approved';
  assignedTo: string[]; // Array of member profile _ids
  completedBy?: string; // The member profile _id who completed it
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// This is the StoreItem object
export interface IStoreItem {
  _id: string;
  householdId: string;
  itemName: string;
  description?: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}