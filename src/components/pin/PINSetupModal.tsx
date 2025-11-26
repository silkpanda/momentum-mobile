// src/components/pin/PINSetupModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PINKeypad from './PINKeypad';

interface PINSetupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void;
}

const PINSetupModal: React.FC<PINSetupModalProps> = ({ visible, onClose, onSuccess }) => {
    const { currentTheme: theme } = useTheme();
    const [step, setStep] = useState<'create' | 'confirm'>('create');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setStep('create');
            setPin('');
            setConfirmPin('');
            setError('');
        }
    }, [visible]);

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const validatePin = (pinToValidate: string): { valid: boolean; message?: string } => {
        // Check if exactly 4 digits
        if (!/^\d{4}$/.test(pinToValidate)) {
            return { valid: false, message: 'PIN must be exactly 4 digits' };
        }

        // Check if all same digit
        if (/^(\d)\1{3}$/.test(pinToValidate)) {
            return { valid: false, message: 'PIN cannot be all the same digit (e.g., 1111)' };
        }

        // Check if sequential
        const digits = pinToValidate.split('').map(Number);
        const isAscending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
        const isDescending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);

        if (isAscending || isDescending) {
            return { valid: false, message: 'PIN cannot be sequential (e.g., 1234, 4321)' };
        }

        return { valid: true };
    };

    const handleKeyPress = (key: string) => {
        if (step === 'create') {
            if (pin.length < 4) {
                const newPin = pin + key;
                setPin(newPin);
                setError('');

                // Auto-validate when 4 digits entered
                if (newPin.length === 4) {
                    setTimeout(() => {
                        const validation = validatePin(newPin);
                        if (!validation.valid) {
                            setError(validation.message || 'Invalid PIN');
                            shake();
                        } else {
                            // Move to confirm step
                            setStep('confirm');
                        }
                    }, 100);
                }
            }
        } else {
            if (confirmPin.length < 4) {
                const newConfirmPin = confirmPin + key;
                setConfirmPin(newConfirmPin);
                setError('');

                // Auto-check when 4 digits entered
                if (newConfirmPin.length === 4) {
                    setTimeout(() => {
                        if (newConfirmPin === pin) {
                            // Success!
                            onSuccess(pin);
                        } else {
                            setError('PINs do not match');
                            shake();
                            setTimeout(() => {
                                setConfirmPin('');
                                setError('');
                            }, 1500);
                        }
                    }, 100);
                }
            }
        }
    };

    const handleBackspace = () => {
        if (step === 'create') {
            setPin(pin.slice(0, -1));
            setError('');
        } else {
            setConfirmPin(confirmPin.slice(0, -1));
            setError('');
        }
    };

    const handleBack = () => {
        setStep('create');
        setConfirmPin('');
        setError('');
    };

    const currentPin = step === 'create' ? pin : confirmPin;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressDot, { backgroundColor: theme.colors.actionPrimary }]} />
                        <View
                            style={[
                                styles.progressLine,
                                { backgroundColor: step === 'confirm' ? theme.colors.actionPrimary : theme.colors.borderSubtle },
                            ]}
                        />
                        <View
                            style={[
                                styles.progressDot,
                                {
                                    backgroundColor: step === 'confirm' ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                },
                            ]}
                        />
                    </View>

                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        {step === 'create'
                            ? 'Choose a 4-digit PIN for secure access'
                            : 'Re-enter your PIN to confirm'}
                    </Text>

                    {/* PIN Dots Display */}
                    <View style={styles.dotsContainer}>
                        {[0, 1, 2, 3].map((index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            currentPin.length > index ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Error Message */}
                    {error && <Text style={[styles.error, { color: theme.colors.signalAlert }]}>{error}</Text>}

                    {/* Guidelines (only on create step) */}
                    {step === 'create' && !error && (
                        <View style={styles.guidelines}>
                            <Text style={[styles.guidelineText, { color: theme.colors.textSecondary }]}>
                                • Must be 4 digits
                            </Text>
                            <Text style={[styles.guidelineText, { color: theme.colors.textSecondary }]}>
                                • Cannot be all same (e.g., 1111)
                            </Text>
                            <Text style={[styles.guidelineText, { color: theme.colors.textSecondary }]}>
                                • Cannot be sequential (e.g., 1234)
                            </Text>
                        </View>
                    )}

                    {/* Keypad */}
                    <PINKeypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />

                    {/* Back Button (on confirm step) */}
                    {step === 'confirm' && (
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={[styles.backButtonText, { color: theme.colors.actionPrimary }]}>
                                ← Back to Create PIN
                            </Text>
                        </TouchableOpacity>
                    )}
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
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    progressLine: {
        width: 40,
        height: 2,
        marginHorizontal: 8,
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
        marginBottom: 24,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    error: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
    guidelines: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    guidelineText: {
        fontSize: 13,
        marginBottom: 4,
    },
    backButton: {
        marginTop: 16,
        padding: 12,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PINSetupModal;
