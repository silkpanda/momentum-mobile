import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { X, Share2, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';

interface LinkCodeGenerationModalProps {
    visible: boolean;
    onClose: () => void;
    childId: string;
    childName: string;
}

export default function LinkCodeGenerationModal({ visible, onClose, childId, childName }: LinkCodeGenerationModalProps) {
    const { currentTheme: theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);

    const generateCode = async () => {
        setLoading(true);
        try {
            const response = await api.generateLinkCode(childId);
            if (response.data) {
                setCode(response.data.code);
                setExpiresAt(response.data.expiresAt);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to generate link code');
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate when modal opens if no code exists
    React.useEffect(() => {
        if (visible && !code) {
            generateCode();
        }
    }, [visible]);

    const handleShare = async () => {
        if (!code) return;
        try {
            await Share.share({
                message: `Here is the link code for ${childName} on Momentum: ${code}. It expires in 7 days.`,
            });
        } catch (error) {
            console.error(error);
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
                <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                            Link {childName}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                        Share this code with the other parent to link {childName} to their household.
                    </Text>

                    <View style={[styles.codeContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                        {loading ? (
                            <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
                        ) : code ? (
                            <>
                                <Text style={[styles.code, { color: theme.colors.actionPrimary }]}>
                                    {code}
                                </Text>
                                <Text style={[styles.expiry, { color: theme.colors.textSecondary }]}>
                                    Expires {new Date(expiresAt!).toLocaleDateString()}
                                </Text>
                            </>
                        ) : (
                            <TouchableOpacity onPress={generateCode} style={styles.retryButton}>
                                <RefreshCw size={20} color={theme.colors.textSecondary} />
                                <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>
                                    Tap to Generate Code
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={handleShare}
                            disabled={!code || loading}
                        >
                            <Share2 size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Share Code</Text>
                        </TouchableOpacity>
                    </View>
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
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    codeContainer: {
        width: '100%',
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        minHeight: 120,
    },
    code: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 8,
    },
    expiry: {
        fontSize: 12,
    },
    retryButton: {
        alignItems: 'center',
        gap: 8,
    },
    retryText: {
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
