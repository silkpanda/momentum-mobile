// src/components/pin/ChangePINModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, TouchableOpacity, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PINKeypad from './PINKeypad';
import { api } from '../../services/api';

interface ChangePINModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'verify' | 'create' | 'confirm';

const ChangePINModal: React.FC<ChangePINModalProps> = ({
    visible,
    onClose,
    onSuccess,
}) => {
    const { currentTheme: theme } = useTheme();
    const [step, setStep] = useState<Step>('verify');
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Reset state when modal opens/closes
    useEffect(() => {
        if (visible) {
            setStep('verify');
            setOldPin('');
            setNewPin('');
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

    const validateNewPin = (pin: string): boolean => {
        // Check for all same digits (e.g., 1111)
        if (/^(\d)\1{3}$/.test(pin)) {
            setError('PIN cannot be all the same digit');
            shake();
            return false;
        }

        // Check for sequential patterns (e.g., 1234, 4321)
        const digits = pin.split('').map(Number);
        const isAscending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
        const isDescending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);

        if (isAscending || isDescending) {
            setError('PIN cannot be sequential');
            shake();
            return false;
        }

        return true;
    };

    const handleKeyPress = (key: string) => {
        if (step === 'verify') {
            if (oldPin.length < 4) {
                const newOldPin = oldPin + key;
                setOldPin(newOldPin);
                setError('');

                // Auto-verify when 4 digits entered
                if (newOldPin.length === 4) {
                    setTimeout(() => {
                        verifyOldPin(newOldPin);
                    }, 100);
                }
            }
        } else if (step === 'create') {
            if (newPin.length < 4) {
                const updatedPin = newPin + key;
                setNewPin(updatedPin);
                setError('');

                // Auto-validate when 4 digits entered
                if (updatedPin.length === 4) {
                    setTimeout(() => {
                        if (validateNewPin(updatedPin)) {
                            setStep('confirm');
                        }
                    }, 100);
                }
            }
        } else {
            if (confirmPin.length < 4) {
                const updatedConfirmPin = confirmPin + key;
                setConfirmPin(updatedConfirmPin);
                setError('');

                // Auto-check when 4 digits entered
                if (updatedConfirmPin.length === 4) {
                    setTimeout(() => {
                        if (updatedConfirmPin === newPin) {
                            // Success!
                            changePin(newPin);
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
        if (step === 'verify') {
            setOldPin(oldPin.slice(0, -1));
            setError('');
        } else if (step === 'create') {
            setNewPin(newPin.slice(0, -1));
            setError('');
        } else {
            setConfirmPin(confirmPin.slice(0, -1));
            setError('');
        }
    };

    const verifyOldPin = async (pin: string) => {
        try {
            // Use changePin endpoint's verification (it will verify internally)
            // Or we can call getPinStatus to check if PIN exists, then just proceed
            // For now, we'll attempt the change and let the backend verify
            setStep('create');
            setError('');
        } catch (error) {
            setError('Incorrect PIN');
            shake();
            setTimeout(() => {
                setOldPin('');
                setError('');
            }, 1500);
        }
    };

    const changePin = async (pin: string) => {
        try {
            await api.changePin(oldPin, pin);
            onSuccess();
            onClose();
        } catch (error) {
            setError('Failed to change PIN');
            shake();
        }
    };

    const handleBack = () => {
        if (step === 'confirm') {
            setStep('create');
            setConfirmPin('');
            setError('');
        } else if (step === 'create') {
            setStep('verify');
            setNewPin('');
            setError('');
        }
    };

    const currentPin = step === 'verify' ? oldPin : step === 'create' ? newPin : confirmPin;

    const getTitle = () => {
        switch (step) {
            case 'verify':
                return 'Enter Current PIN';
            case 'create':
                return 'Create New PIN';
            case 'confirm':
                return 'Confirm New PIN';
        }
    };

    const getSubtitle = () => {
        switch (step) {
            case 'verify':
                return 'Verify your current PIN to continue';
            case 'create':
                return 'Choose a new 4-digit PIN';
            case 'confirm':
                return 'Re-enter your new PIN to confirm';
        }
    };

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
                                { backgroundColor: step !== 'verify' ? theme.colors.actionPrimary : theme.colors.borderSubtle },
                            ]}
                        />
                        <View
                            style={[
                                styles.progressDot,
                                {
                                    backgroundColor: step !== 'verify' ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                },
                            ]}
                        />
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

                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{getTitle()}</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{getSubtitle()}</Text>

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

                    {/* Back Button (on create/confirm steps) */}
                    {step !== 'verify' && (
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={[styles.backButtonText, { color: theme.colors.actionPrimary }]}>
                                ← Back
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
        fontSize: 12,
        marginBottom: 4,
    },
    backButton: {
        marginTop: 16,
        padding: 12,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePINModal;
