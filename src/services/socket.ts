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

// Re-export from constants for convenience
export { SOCKET_EVENTS } from '../constants/socketEvents';
export type {
    TaskUpdatedEvent,
    MemberPointsUpdatedEvent,
    HouseholdUpdatedEvent
} from '../constants/socketEvents';
