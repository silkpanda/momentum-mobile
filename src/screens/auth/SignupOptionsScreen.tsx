import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { textStyles } from '../../theme/typography';
import { Mail } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

type SignupOptionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignupOptions'>;

interface Props {
    navigation: SignupOptionsScreenNavigationProp;
}

export default function SignupOptionsScreen({ navigation }: Props) {
    const { currentTheme: theme } = useTheme();
    const { googleLogin } = useAuth(); // Assuming this will be added to AuthContext
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignup = async () => {
        if (Constants.appOwnership === 'expo') {
            Alert.alert('Not Supported', 'Google Sign-In is not supported in Expo Go. Please use a development build.');
            return;
        }

        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Force account selection by revoking access and signing out
            try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
            } catch (error) {
                // Ignore error if already signed out or no access to revoke
                console.log('Sign out/revoke error (expected if not logged in):', error);
            }

            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();

            if (userInfo.data?.idToken) {
                // This will handle the login/signup on the backend
                // and update the auth state
                await googleLogin(userInfo.data.idToken, userInfo.data.serverAuthCode || undefined);

                // Navigation to Onboarding is handled by the AuthContext/AppNavigator 
                // based on whether the user is new or has completed onboarding.
                // But for now, let's assume successful login updates state.
            } else {
                throw new Error('No ID token received from Google');
            }
        } catch (error: any) {
            console.error('Google Sign-In error:', error);
            if (error.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert('Error', 'Failed to sign in with Google');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={styles.content}>
                {/* Logo/Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.actionPrimary }]}>
                        ⚡ Momentum
                    </Text>
                    <Text style={[textStyles.bodyLarge, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                        The family task & reward system that actually works.
                    </Text>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.googleButton, { backgroundColor: '#FFFFFF' }]}
                        onPress={handleGoogleSignup}
                        disabled={isLoading}
                    >
                        {/* Google Icon would go here, using text for now or a library icon if available */}
                        <Text style={[styles.googleButtonText, { color: '#000000' }]}>
                            Sign up with Google
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={[styles.line, { backgroundColor: theme.colors.borderSubtle }]} />
                        <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR</Text>
                        <View style={[styles.line, { backgroundColor: theme.colors.borderSubtle }]} />
                    </View>

                    <TouchableOpacity
                        style={[styles.emailButton, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}
                        onPress={() => navigation.navigate('Register')}
                        disabled={isLoading}
                    >
                        <Mail size={20} color={theme.colors.textPrimary} style={styles.icon} />
                        <Text style={[styles.emailButtonText, { color: theme.colors.textPrimary }]}>
                            Sign up with Email
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View style={styles.footer}>
                    <Text style={[textStyles.body, { color: theme.colors.textSecondary }]}>
                        Already have an account?
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[textStyles.label, { color: theme.colors.actionPrimary, marginLeft: 4 }]}>
                            Log in
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    optionsContainer: {
        gap: 16,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    emailButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    icon: {
        marginRight: 12,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 48,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
