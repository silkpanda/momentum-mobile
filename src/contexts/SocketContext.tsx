// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { logger } from '../utils/logger';

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
        if (isLoading) {
            logger.debug('Waiting for auth to load...');
            return;
        }

        // Only connect if we have a token
        if (!token) {
            if (socket) {
                logger.info('Disconnecting socket (no token)');
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
                logger.debug('Socket already connected with current token');
                return;
            }

            if (socket) {
                logger.info('Disconnecting old socket...');
                socket.disconnect();
            }

            logger.info('Initializing socket connection...');
            try {
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
                    logger.info('Connected to WebSocket server');
                    setConnected(true);
                });

                newSocket.on('disconnect', () => {
                    logger.info('Disconnected from WebSocket server');
                    setConnected(false);
                });

                newSocket.on('connect_error', (error) => {
                    logger.error('WebSocket connection error:', error.message);
                    setConnected(false);
                });

                setSocket(newSocket);
            } catch (error) {
                logger.error('Failed to initialize socket:', error);
            }
        };

        initSocket();

        return () => {
            if (socket) {
                logger.info('Cleaning up socket connection...');
                socket.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, isLoading]);

    const emit = useCallback((event: string, data?: any) => {
        if (socket && connected) {
            socket.emit(event, data);
        } else {
            logger.warn('Socket not connected, cannot emit:', event);
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
