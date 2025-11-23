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
} from 'react-native';
import { Mail, Lock, AlertTriangle, CheckCircle, LogIn } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import FormInput from '../../components/shared/FormInput';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
    const { login } = useAuth();
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
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Family Task & Reward System
                    </Text>
                </View>

                {/* Login Form */}
                <View style={[styles.formContainer, { backgroundColor: theme.colors.bgSurface }]}>
                    <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
                        Welcome Back
                    </Text>

                    {/* Status Indicators */}
                    {error && (
                        <View style={[styles.statusMessage, { backgroundColor: theme.colors.signalAlert + '20', borderColor: theme.colors.signalAlert + '50' }]}>
                            <AlertTriangle size={20} color={theme.colors.signalAlert} style={styles.statusIcon} />
                            <Text style={[styles.statusText, { color: theme.colors.signalAlert }]}>{error}</Text>
                        </View>
                    )}
                    {success && (
                        <View style={[styles.statusMessage, { backgroundColor: theme.colors.signalSuccess + '20', borderColor: theme.colors.signalSuccess + '50' }]}>
                            <CheckCircle size={20} color={theme.colors.signalSuccess} style={styles.statusIcon} />
                            <Text style={[styles.statusText, { color: theme.colors.signalSuccess }]}>Login Successful!</Text>
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
                                <Text style={styles.buttonText}>{success ? 'Logging In...' : 'Login'}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Register')}
                        disabled={isLoading}
                    >
                        <Text style={[styles.linkText, { color: theme.colors.actionPrimary }]}>
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
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
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
    formTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
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
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
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
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
