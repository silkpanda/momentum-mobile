// src/components/pin/PINEntryModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import PINKeypad from './PINKeypad';

interface PINEntryModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void; // Called after successful verification
    memberId: string; // Member ID to verify PIN against
    householdId: string; // Household ID
    title?: string;
    subtitle?: string;
    maxAttempts?: number;
}

const PINEntryModal: React.FC<PINEntryModalProps> = ({
    visible,
    onClose,
    onSuccess,
    memberId,
    householdId,
    title = 'Enter PIN',
    subtitle = 'Enter your 4-digit PIN to continue',
    maxAttempts = 5,
}) => {
    const { currentTheme: theme } = useTheme();
    const [pin, setPin] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Lockout timer
    useEffect(() => {
        if (lockoutTime > 0) {
            const timer = setTimeout(() => {
                setLockoutTime(lockoutTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (isLocked && lockoutTime === 0) {
            setIsLocked(false);
            setAttempts(0);
            setError('');
        }
    }, [lockoutTime, isLocked]);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setPin('');
            setError('');
            setIsVerifying(false);
            setAttempts(0);
        }
    }, [visible]);

    // Reset loading state when PIN is cleared (after error)
    useEffect(() => {
        if (pin.length === 0) {
            setIsVerifying(false);
        }
    }, [pin]);

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handleKeyPress = (key: string) => {
        if (isLocked || isVerifying) return;
        if (pin.length < 4) {
            const newPin = pin + key;
            setPin(newPin);
            setError('');

            // Auto-submit when 4 digits entered
            if (newPin.length === 4) {
                setIsVerifying(true);
                setTimeout(() => {
                    handleSubmit(newPin);
                }, 100);
            }
        }
    };

    const handleBackspace = () => {
        if (isLocked || isVerifying) return;
        setPin(pin.slice(0, -1));
        setError('');
    };

    const handleSubmit = async (pinToSubmit: string) => {
        if (pinToSubmit.length !== 4) {
            setError('PIN must be 4 digits');
            shake();
            setIsVerifying(false);
            return;
        }

        try {
            const response = await api.verifyPin(pinToSubmit, memberId, householdId);
            if (response.data?.verified) {
                // Success!
                setIsVerifying(false);
                onSuccess();
            } else {
                // Verification failed
                handleError();
            }
        } catch (error) {
            // API error or incorrect PIN
            handleError();
        }
    };

    const handleError = () => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        shake();

        if (newAttempts >= maxAttempts) {
            setIsLocked(true);
            setLockoutTime(30); // 30 second lockout
            setError(`Too many attempts. Locked for 30 seconds.`);
        } else {
            setError(`Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        { backgroundColor: theme.colors.bgSurface, transform: [{ translateX: shakeAnimation }] },
                    ]}
                >
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>

                    {/* PIN Dots Display */}
                    <View style={styles.dotsContainer}>
                        {[0, 1, 2, 3].map((index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: pin.length > index ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Loading Indicator */}
                    {isVerifying && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={theme.colors.actionPrimary} />
                            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                                Verifying...
                            </Text>
                        </View>
                    )}

                    {/* Error Message */}
                    {error && !isVerifying && (
                        <Text style={[styles.error, { color: theme.colors.signalAlert }]}>{error}</Text>
                    )}

                    {/* Lockout Message */}
                    {isLocked && (
                        <Text style={[styles.lockout, { color: theme.colors.signalAlert }]}>
                            Locked for {lockoutTime} seconds
                        </Text>
                    )}

                    {/* Keypad */}
                    <PINKeypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
        minHeight: 24,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    error: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
        minHeight: 20,
    },
    lockout: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: 'bold',
    },
});

export default PINEntryModal;
