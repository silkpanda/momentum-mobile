// src/services/socket.ts
import { io, Socket } from 'socket.io-client';
import { logger } from '../utils/logger';

// The BFF URL for WebSocket connection (root URL, not /mobile-bff)
const SOCKET_URL = 'https://momentum-mobile-bff.onrender.com';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        logger.info('Connecting to WebSocket:', SOCKET_URL);
        socket = io(SOCKET_URL, {
            transports: ['websocket'], // Force WebSocket for better performance on mobile
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            logger.info('WebSocket Connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            logger.info('WebSocket Disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            logger.error('WebSocket Connection error:', error.message);
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
