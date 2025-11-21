// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { getSocket, SOCKET_EVENTS } from '../services/socket';

export const useSocket = () => {
    const socket = getSocket();
    return socket;
};

export const useSocketEvent = <T = any>(eventName: string, callback: (data: T) => void) => {
    const socket = getSocket();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!socket) return;

        const handler = (data: T) => {
            callbackRef.current(data);
        };

        socket.on(eventName, handler);

        return () => {
            socket.off(eventName, handler);
        };
    }, [eventName]);
};
