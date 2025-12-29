// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { GoogleSignin } from '../../utils/googleSigninWrapper';
import Constants from 'expo-constants';
import { Mail, Lock, AlertTriangle, CheckCircle, LogIn } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { textStyles } from '../../theme/typography';
import FormInput from '../../components/shared/FormInput';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
    const { login, googleLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { currentTheme: theme } = useTheme();

    const handleLogin = async () => {
        setError(null);
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            setSuccess(true);
            // Navigation is handled by auth state, but we can show success briefly
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
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

            if (userInfo.data?.idToken) {
                // Pass serverAuthCode to allow backend to get refresh tokens
                await googleLogin(userInfo.data.idToken, userInfo.data.serverAuthCode || undefined);
                setSuccess(true);
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
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.actionPrimary }]}>
                        ⚡ Momentum
                    </Text>
                    <Text style={[textStyles.bodyLarge, { color: theme.colors.textSecondary }]}>
                        Family Task & Reward System
                    </Text>
                </View>

                {/* Login Form */}
                <View style={[styles.formContainer, { backgroundColor: theme.colors.bgSurface }]}>
                    <Text style={[textStyles.displayMedium, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 24 }]}>
                        Welcome Back
                    </Text>

                    {/* Google Login Button */}
                    <TouchableOpacity
                        style={[styles.googleButton, { backgroundColor: '#FFFFFF', borderColor: theme.colors.borderSubtle }]}
                        onPress={handleGoogleLogin}
                        disabled={isLoading || success}
                    >
                        <Text style={[styles.googleButtonText, { color: '#000000' }]}>
                            Sign in with Google
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={[styles.line, { backgroundColor: theme.colors.borderSubtle }]} />
                        <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR</Text>
                        <View style={[styles.line, { backgroundColor: theme.colors.borderSubtle }]} />
                    </View>

                    {/* Status Indicators */}
                    {error && (
                        <View style={[styles.statusMessage, { backgroundColor: theme.colors.signalAlert + '20', borderColor: theme.colors.signalAlert + '50' }]}>
                            <AlertTriangle size={20} color={theme.colors.signalAlert} style={styles.statusIcon} />
                            <Text style={[textStyles.label, { color: theme.colors.signalAlert, flex: 1 }]}>{error}</Text>
                        </View>
                    )}
                    {success && (
                        <View style={[styles.statusMessage, { backgroundColor: theme.colors.signalSuccess + '20', borderColor: theme.colors.signalSuccess + '50' }]}>
                            <CheckCircle size={20} color={theme.colors.signalSuccess} style={styles.statusIcon} />
                            <Text style={[textStyles.label, { color: theme.colors.signalSuccess }]}>Login Successful!</Text>
                        </View>
                    )}

                    <FormInput
                        label="Email Address"
                        placeholder="your.parent.email@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isLoading}
                        icon={Mail}
                    />

                    <FormInput
                        label="Password"
                        placeholder="Your secret password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isLoading}
                        icon={Lock}
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: theme.colors.actionPrimary },
                            (isLoading || success) && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={isLoading || success}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <LogIn size={20} color="#FFFFFF" style={styles.buttonIcon} />
                                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>{success ? 'Logging In...' : 'Login'}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Register')}
                        disabled={isLoading}
                    >
                        <Text style={[textStyles.label, { color: theme.colors.actionPrimary }]}>
                            Don't have an account? Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
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
        marginBottom: 8,
    },
    formContainer: {
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 16,
    },
    statusIcon: {
        marginRight: 12,
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
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
});

