import { io } from 'socket.io-client';
import { BASE_URL } from './api';

console.log('[Socket] 🔌 Initializing socket connection to:', BASE_URL);

export const socket = io(BASE_URL, {
    autoConnect: true,
    transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
});

socket.on('connect', () => {
    console.log('[Socket] ✅ Connected to BFF! Socket ID:', socket.id);
    console.log('[Socket] Transport:', socket.io.engine.transport.name);
});

socket.on('disconnect', (reason) => {
    console.log('[Socket] ❌ Disconnected from BFF. Reason:', reason);
});

socket.on('connect_error', (err) => {
    console.error('[Socket] 🚨 Connection Error:', err.message);
    console.error('[Socket] Error details:', err);
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`[Socket] 🔄 Reconnection attempt #${attemptNumber}`);
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`[Socket] ✅ Reconnected after ${attemptNumber} attempts`);
});

// Listen for task updates
socket.on('task_updated', (data) => {
    console.log('[Socket] 📨 Received task_updated event:', JSON.stringify(data, null, 2));
});

console.log('[Socket] Socket instance created. Waiting for connection...');
