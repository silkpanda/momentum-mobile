import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { api } from './api';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            // NOTE: Android Push Notifications require Firebase (FCM) configuration.
            // Since we are avoiding Firebase for now, we will skip token fetching on Android
            // to prevent the "Default FirebaseApp is not initialized" error.
            if (Platform.OS === 'android') {
                console.log('Skipping Push Token fetch on Android (FCM not configured).');
                return;
            }

            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log('Expo Push Token:', token);

            if (token) {
                await api.savePushToken(token);
            }
        } catch (error) {
            console.warn('Failed to fetch push token (Push Notifications may not work):', error);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export function setupNotificationListeners() {
    // Handle notification when app is in foreground
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
    });

    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification Received:', notification);
    });

    // Listen for user interacting with notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification Response:', response);
        // Handle navigation based on notification data here
    });

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
}
