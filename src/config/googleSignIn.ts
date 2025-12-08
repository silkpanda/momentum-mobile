import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

// Configure Google Sign-In once at app startup
export const configureGoogleSignIn = () => {
    // Check if running in Expo Go
    if (Constants.appOwnership === 'expo') {
        console.log('Running in Expo Go - Google Sign-In disabled');
        return;
    }

    try {
        GoogleSignin.configure({
            // This is your WEB client ID from Google Cloud Console
            // (NOT the Android or iOS client ID)
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',

            // Request offline access to get a refresh token
            offlineAccess: true,

            // Scopes for Google Calendar access
            scopes: [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.events.readonly',
            ],
        });
    } catch (error) {
        console.error('Failed to configure Google Sign-In:', error);
    }
};
