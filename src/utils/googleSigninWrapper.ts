import { Platform } from 'react-native';
import * as GoogleSigninNative from '@react-native-google-signin/google-signin';

// Check if the native module is actually available
const isNativeAvailable = !!GoogleSigninNative.GoogleSignin && typeof GoogleSigninNative.GoogleSignin.configure === 'function';

// Mock implementation for Expo Go
const GoogleSigninMock = {
    configure: (options?: any) => {
        console.log('[GoogleSignin Mock] Configured with:', options);
    },
    hasPlayServices: async (options?: any) => {
        console.log('[GoogleSignin Mock] Checking Play Services:', options);
        return true;
    },
    signIn: async () => {
        console.log('[GoogleSignin Mock] Signing in...');
        // Return a dummy user object
        return {
            data: {
                user: {
                    id: 'mock-user-id',
                    name: 'Expo Go Tester',
                    email: 'tester@expogo.com',
                    photo: 'https://via.placeholder.com/150',
                    familyName: 'Tester',
                    givenName: 'Expo Go',
                },
                idToken: 'mock-id-token',
                serverAuthCode: 'mock-auth-code',
                scopes: ['profile', 'email'],
            }
        };
    },
    signInSilently: async () => {
        console.log('[GoogleSignin Mock] Signing in silently...');
        // Simulate no user signed in silently for fresh start, or return user if needed
        // For testing onboarding, returning null (no silent sign-in) is often safer to force manual button press
        return null;
    },
    signOut: async () => {
        console.log('[GoogleSignin Mock] Signing out...');
    },
    revokeAccess: async () => {
        console.log('[GoogleSignin Mock] Revoking access...');
    },
    getTokens: async () => {
        console.log('[GoogleSignin Mock] Getting tokens...');
        return {
            idToken: 'mock-id-token',
            accessToken: 'mock-access-token',
        };
    },
    getCurrentUser: () => {
        console.log('[GoogleSignin Mock] Getting current user...');
        return null;
    },
};

// Export the native module if available, otherwise the mock
export const GoogleSignin = isNativeAvailable ? GoogleSigninNative.GoogleSignin : GoogleSigninMock;

// Export types if needed (re-exporting from native might fail if types aren't available during compilation in some envs, 
// but usually okay. For safety/simplicity in this specific workaround, we blindly export what we used).
export const statusCodes = isNativeAvailable ? GoogleSigninNative.statusCodes : {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};
