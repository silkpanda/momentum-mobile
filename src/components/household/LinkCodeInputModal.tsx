import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { X, Link } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';

interface LinkCodeInputModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (childData: { childId: string; childName: string; code: string }) => void;
}

export default function LinkCodeInputModal({ visible, onClose, onSuccess }: LinkCodeInputModalProps) {
    const { currentTheme: theme } = useTheme();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleCodeChange = (index: number, value: string) => {
        // Only allow letters and numbers
        const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (sanitized.length === 0) {
            // Handle backspace
            const newCode = [...code];
            newCode[index] = '';
            setCode(newCode);

            // Move to previous input
            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
            return;
        }

        if (sanitized.length === 1) {
            // Single character input
            const newCode = [...code];
            newCode[index] = sanitized;
            setCode(newCode);

            // Auto-advance to next input
            if (index < 5) {
                inputRefs.current[index + 1]?.focus();
            } else {
                // Last character entered, auto-submit
                const fullCode = [...newCode].join('');
                if (fullCode.length === 6) {
                    handleSubmit(fullCode);
                }
            }
        } else if (sanitized.length > 1) {
            // Handle paste or multiple characters
            const chars = sanitized.split('').slice(0, 6);
            const newCode = [...code];

            chars.forEach((char, i) => {
                if (index + i < 6) {
                    newCode[index + i] = char;
                }
            });

            setCode(newCode);

            // Focus the next empty input or last input
            const nextIndex = Math.min(index + chars.length, 5);
            inputRefs.current[nextIndex]?.focus();

            // Auto-submit if complete
            if (newCode.every(c => c !== '')) {
                handleSubmit(newCode.join(''));
            }
        }
    };

    const handleSubmit = async (fullCode?: string) => {
        const codeToSubmit = fullCode || code.join('');

        if (codeToSubmit.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter all 6 characters');
            return;
        }

        setLoading(true);
        try {
            // Validate the code
            const response = await api.validateLinkCode(codeToSubmit);

            if (response.data?.valid) {
                onSuccess({
                    childId: response.data.childId,
                    childName: response.data.childName,
                    code: codeToSubmit,
                });
                handleClose();
            } else {
                Alert.alert('Invalid Code', 'This link code is not valid or has expired');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to validate link code');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCode(['', '', '', '', '', '']);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Link size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                Link Child
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleClose}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                        Enter the 6-character code provided by the other parent
                    </Text>

                    <View style={styles.codeInputContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[
                                    styles.codeInput,
                                    {
                                        backgroundColor: theme.colors.bgCanvas,
                                        color: theme.colors.textPrimary,
                                        borderColor: digit ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                    },
                                ]}
                                value={digit}
                                onChangeText={(value) => handleCodeChange(index, value)}
                                maxLength={6} // Allow paste
                                autoCapitalize="characters"
                                autoCorrect={false}
                                keyboardType="default"
                                selectTextOnFocus
                                editable={!loading}
                            />
                        ))}
                    </View>

                    {loading && (
                        <ActivityIndicator size="large" color={theme.colors.actionPrimary} style={styles.loader} />
                    )}

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: code.every(c => c !== '') ? theme.colors.actionPrimary : theme.colors.borderSubtle
                            },
                        ]}
                        onPress={() => handleSubmit()}
                        disabled={loading || !code.every(c => c !== '')}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Validating...' : 'Continue'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    container: {
        borderRadius: 16,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    codeInput: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loader: {
        marginVertical: 16,
    },
    submitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
