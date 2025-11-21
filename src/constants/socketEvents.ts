// src/constants/socketEvents.ts
export const SOCKET_EVENTS = {
    TASK_UPDATED: 'task_updated',
    MEMBER_POINTS_UPDATED: 'member_points_updated',
    STORE_ITEM_UPDATED: 'store_item_updated',
    HOUSEHOLD_UPDATED: 'household_updated',
    QUEST_UPDATED: 'quest_updated',
    ROUTINE_UPDATED: 'routine_updated',
} as const;

export interface TaskUpdatedEvent {
    type: 'create' | 'update' | 'delete';
    task?: any;
    taskId?: string;
    memberUpdate?: {
        memberId: string;
        pointsTotal: number;
    };
}

export interface MemberPointsUpdatedEvent {
    memberId: string;
    pointsTotal: number;
    householdId: string;
}

export interface HouseholdUpdatedEvent {
    type: 'update' | 'member_add' | 'member_update' | 'member_remove';
    householdId: string;
    householdName?: string;
    member?: any;
    memberProfile?: any;
    memberProfileId?: string;
}
