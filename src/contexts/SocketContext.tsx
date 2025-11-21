// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    emit: () => { },
    on: () => { },
    off: () => { },
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const { token, isLoading } = useAuth();

    useEffect(() => {
        // Wait for auth to finish loading
        if (isLoading) return;

        // Only connect if we have a token
        if (!token) {
            if (socket) {
                console.log('🔌 Disconnecting socket (no token)');
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Initialize Socket.IO connection
        const initSocket = async () => {
            // If we already have a socket connected with the same token, don't reconnect
            if (socket?.connected && (socket.auth as any)?.token === token) {
                return;
            }

            if (socket) {
                socket.disconnect();
            }

            console.log('🔌 Initializing socket connection...');
            const newSocket = io('https://momentum-mobile-bff.onrender.com', {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
                auth: {
                    token
                }
            });

            newSocket.on('connect', () => {
                console.log('🔌 Connected to WebSocket server');
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Disconnected from WebSocket server');
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                setConnected(false);
            });

            setSocket(newSocket);
        };

        initSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [token, isLoading]);

    const emit = useCallback((event: string, data?: any) => {
        if (socket && connected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }, [socket, connected]);

    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        if (socket) {
            socket.on(event, callback);
        }
    }, [socket]);

    const off = useCallback((event: string, callback: (...args: any[]) => void) => {
        if (socket) {
            socket.off(event, callback);
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, connected, emit, on, off }}>
            {children}
        </SocketContext.Provider>
    );
};
