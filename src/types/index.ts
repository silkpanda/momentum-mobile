export interface User {
    id: string;
    _id?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Parent' | 'Child';
    householdId?: string;
    profileColor?: string;
}

export interface Member {
    id: string;
    _id?: string; // Handle both id and _id for compatibility
    userId: string;
    firstName: string;
    lastName: string;
    role: 'Parent' | 'Child';
    profileColor: string;
    pointsTotal: number;
    walletBalance?: number; // Sometimes distinct from total points
}

export interface Task {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    value: number;
    status: 'Pending' | 'PendingApproval' | 'Completed' | 'Approved';
    assignedTo: string[]; // Array of member IDs
    completedBy?: string | null; // Member ID
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuestClaim {
    memberId: string;
    status: 'claimed' | 'completed' | 'approved';
    claimedAt: string;
    completedAt?: string;
    approvedAt?: string;
}

export interface Quest {
    id: string;
    _id?: string;
    title: string;
    description: string;
    pointsValue: number;
    rewardValue?: number; // Fallback
    isActive: boolean;
    claims: QuestClaim[];
    createdBy?: string;
    createdAt?: string;
}

export interface StoreItem {
    id: string;
    _id?: string;
    itemName: string;
    description: string;
    cost: number;
    stock?: number;
    image?: string;
    isInfinite?: boolean;
    isAvailable?: boolean;
}

export interface Restaurant {
    id: string;
    _id?: string;
    name: string;
    cuisine?: string;
    isFavorite?: boolean;
}

export interface Meal {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    ingredients?: string[];
    isTrying?: boolean;
}

export interface Household {
    id: string;
    _id?: string;
    name: string;
    members: Member[];
    currencyName?: string;
}

export interface DashboardData {
    household: Household;
    tasks: Task[];
    pendingApprovals?: number;
}

export interface FamilyData {
    household: Household;
}

export interface LoginResponse {
    parent: User;
    primaryHouseholdId: string;
    token?: string;
}

export interface RegisterResponse {
    parent: User;
    household: Household;
    token?: string;
}

export interface MeResponse {
    user: User;
    householdId: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ApiResponse<T = any> {
    status: string;
    data?: T;
    message?: string;
    token?: string;
}
