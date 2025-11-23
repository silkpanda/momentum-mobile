// src/screens/auth/RegisterScreen.tsx
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
import { User, Home, Mail, Lock, Check, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PROFILE_COLORS } from '../../theme/constants';
import FormInput from '../../components/shared/FormInput';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
    const { register } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [householdName, setHouseholdName] = useState('');
    const [userDisplayName, setUserDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0].hex);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { currentTheme: theme } = useTheme();

    const handleRegister = async () => {
        setError(null);
        // Validation
        if (!firstName || !lastName || !householdName || !userDisplayName || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);
        try {
            await register({
                firstName,
                lastName,
                householdName,
                userDisplayName,
                email,
                password,
                userProfileColor: selectedColor,
                role: 'Parent', // Default to Parent for household creation
            });
            setSuccess(true);
            // Navigation handled by auth state
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
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
                        Create Account
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Join your family on Momentum
                    </Text>
                </View>

                {/* Register Form */}
                <View style={[styles.formContainer, { backgroundColor: theme.colors.bgSurface }]}>

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
                            <Text style={[styles.statusText, { color: theme.colors.signalSuccess }]}>Success! Redirecting...</Text>
                        </View>
                    )}

                    {/* Name Fields */}
                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <FormInput
                                label="First Name"
                                placeholder="John"
                                value={firstName}
                                onChangeText={setFirstName}
                                editable={!isLoading}
                                icon={User}
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <FormInput
                                label="Last Name"
                                placeholder="Doe"
                                value={lastName}
                                onChangeText={setLastName}
                                editable={!isLoading}
                                icon={User}
                            />
                        </View>
                    </View>

                    <FormInput
                        label="Household Name"
                        placeholder="e.g., 'The Smith Family'"
                        value={householdName}
                        onChangeText={setHouseholdName}
                        editable={!isLoading}
                        icon={Home}
                    />

                    <FormInput
                        label="Your Display Name"
                        placeholder="e.g., 'Mom' or 'Jessica'"
                        value={userDisplayName}
                        onChangeText={setUserDisplayName}
                        editable={!isLoading}
                        icon={User}
                    />

                    <FormInput
                        label="Email Address"
                        placeholder="your@email.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isLoading}
                        icon={Mail}
                    />

                    <FormInput
                        label="Password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isLoading}
                        icon={Lock}
                    />

                    {/* Color Picker */}
                    <View style={styles.colorPickerContainer}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                            Your Profile Color
                        </Text>
                        <View style={[styles.colorGrid, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }]}>
                            {PROFILE_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color.hex}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color.hex },
                                        selectedColor === color.hex && styles.selectedColorOption,
                                        selectedColor === color.hex && { borderColor: theme.colors.actionPrimary }
                                    ]}
                                    onPress={() => setSelectedColor(color.hex)}
                                >
                                    {selectedColor === color.hex && <Check size={16} color="#FFFFFF" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: theme.colors.actionPrimary },
                            (isLoading || success) && styles.buttonDisabled,
                        ]}
                        onPress={handleRegister}
                        disabled={isLoading || success}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>{success ? 'Signing Up...' : 'Create Account'}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                        disabled={isLoading}
                    >
                        <Text style={[styles.linkText, { color: theme.colors.actionPrimary }]}>
                            Already have an account? Sign In
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
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    colorPickerContainer: {
        marginBottom: 20,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColorOption: {
        transform: [{ scale: 1.1 }],
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
