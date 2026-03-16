import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationToast } from './NotificationToast';
import { Notification } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { registerForPushNotificationsAsync } from '../../services/notificationService';

export const NotificationManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { on, off } = useSocket();
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    useEffect(() => {
        const handleNotification = (data: any) => {
            // Check if notification is for this user
            // data.recipients is an array of user IDs
            if (data.recipients && user?.id && !data.recipients.includes(user.id)) {
                return;
            }

            // If no recipients specified, assume it's for everyone in the room (household)
            // or if it's a broadcast.

            // Ensure data has necessary fields for Notification interface
            // The socket payload might be slightly different from the full DB record
            // but NotificationToast expects Notification interface.
            // We might need to map it or ensure the payload matches.

            setCurrentNotification(data as Notification);
        };

        on('notification', handleNotification);

        return () => {
            off('notification', handleNotification);
        };
    }, [on, off, user]);

    const handlePress = () => {
        if (currentNotification) {
            setCurrentNotification(null);
            navigation.navigate('NotificationCenter');
        }
    };

    return (
        <>
            {children}
            <NotificationToast
                notification={currentNotification}
                onDismiss={() => setCurrentNotification(null)}
                onPress={handlePress}
            />
        </>
    );
};
