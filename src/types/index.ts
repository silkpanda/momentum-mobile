export interface User {
    id: string;
    _id?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Parent' | 'Child';
    householdId?: string;
    profileColor?: string;
    onboardingCompleted?: boolean;
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
    focusedTaskId?: string; // ADHD Feature: When set, child sees only this task in Focus Mode

    // Streak System (Gamification)
    currentStreak?: number; // Days of consecutive task completion
    longestStreak?: number; // Personal best streak
    lastCompletionDate?: string; // ISO date string for tracking
    streakMultiplier?: number; // Current point multiplier (1.0, 1.5, 2.0, etc.)
    isLinkedChild?: boolean;
}

export interface Task {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    icon?: string; // Icon name for visual representation (for non-readers)
    value: number;
    pointsValue?: number; // API sometimes returns this instead of value
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

export interface RoutineItem {
    _id?: string;
    title: string;
    order: number;
    isCompleted: boolean;
    completedAt?: string;
}

export interface Routine {
    id: string;
    _id?: string;
    householdId: string;
    memberId: string;
    timeOfDay: 'morning' | 'noon' | 'night';
    title: string;
    items: RoutineItem[];
    isActive: boolean;
    lastResetDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WishlistItem {
    id?: string;
    _id?: string;
    memberId: string;
    householdId: string;
    title: string;
    description?: string;
    pointsCost: number;
    imageUrl?: string;
    priority: 'low' | 'medium' | 'high';
    isPurchased: boolean;
    purchasedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    // Client-side calculated fields
    progress?: number;
    canAfford?: boolean;
}

export interface Event {
    id: string;
    _id?: string;
    householdId: string;
    title: string;
    description?: string;
    location?: string;
    videoLink?: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    allDay: boolean;
    attendees: string[]; // Array of member IDs
    isRecurring: boolean;
    recurrenceType?: 'daily' | 'weekly' | 'monthly';
    reminderMinutes?: number;
    googleEventId?: string; // ID in Google Calendar
    calendarType: 'personal' | 'family'; // Which calendar it's synced to
    createdBy: string; // Member ID
    createdAt?: string;
    updatedAt?: string;
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
    quests?: Quest[];
    storeItems?: StoreItem[];
    meals?: Meal[];
    restaurants?: Restaurant[];
    routines?: Routine[];
    wishlistItems?: WishlistItem[];
    pendingApprovals?: number;
}

export interface FamilyData {
    memberProfiles: Member[];
    tasks?: Task[];
    storeItems?: StoreItem[];
    household?: Household; // Keep for backward compatibility
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
export enum NotificationType {
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    TASK_APPROVED = 'TASK_APPROVED',
    TASK_REJECTED = 'TASK_REJECTED',
    QUEST_AVAILABLE = 'QUEST_AVAILABLE',
    QUEST_COMPLETED = 'QUEST_COMPLETED',
    REWARD_REDEEMED = 'REWARD_REDEEMED',
    APPROVAL_REQUEST = 'APPROVAL_REQUEST',
    SYSTEM = 'SYSTEM',
    REMINDER = 'REMINDER'
}

export interface Notification {
    id: string;
    _id?: string;
    recipientId: string;
    householdId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
}
