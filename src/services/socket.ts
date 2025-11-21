// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

// The BFF URL for WebSocket connection (root URL, not /mobile-bff)
const SOCKET_URL = 'https://momentum-mobile-bff.onrender.com';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        console.log('[WebSocket] Connecting to:', SOCKET_URL);
        socket = io(SOCKET_URL, {
            transports: ['websocket'], // Force WebSocket for better performance on mobile
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('[WebSocket] Connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('[WebSocket] Disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('[WebSocket] Connection error:', error.message);
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Event Types (Mirrored from Web App)
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

export interface StoreItemUpdatedEvent {
    type: 'create' | 'update' | 'delete';
    storeItem?: any;
    storeItemId?: string;
}

export interface HouseholdUpdatedEvent {
    type: 'update' | 'member_add' | 'member_update' | 'member_remove';
    householdId: string;
    householdName?: string;
    member?: any;
    memberProfile?: any;
    memberProfileId?: string;
}

export const SOCKET_EVENTS = {
    TASK_UPDATED: 'task_updated',
    MEMBER_POINTS_UPDATED: 'member_points_updated',
    STORE_ITEM_UPDATED: 'store_item_updated',
    HOUSEHOLD_UPDATED: 'household_updated',
} as const;
