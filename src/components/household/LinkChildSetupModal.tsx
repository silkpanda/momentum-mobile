import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { X, User } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';

interface LinkChildSetupModalProps {
    visible: boolean;
    onClose: () => void;
    childId: string;
    childName: string;
    code: string;
    onSuccess: () => void;
}

import { PROFILE_COLORS } from '../../theme/constants';

export default function LinkChildSetupModal({
    visible,
    onClose,
    childId,
    childName,
    code,
    onSuccess
}: LinkChildSetupModalProps) {
    const { currentTheme: theme } = useTheme();
    const [displayName, setDisplayName] = useState(childName);
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0].hex);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!displayName.trim()) {
            Alert.alert('Required', 'Please enter a display name for this child');
            return;
        }

        setLoading(true);
        try {
            await api.linkExistingChild(code, displayName.trim(), selectedColor);

            Alert.alert(
                'Success!',
                `${displayName} has been linked to your household`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            handleClose();
                            onSuccess();
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to link child');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDisplayName(childName);
        setSelectedColor(PROFILE_COLORS[0].hex);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <User size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                Set Up Child Profile
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                            Customize how {childName} appears in your household
                        </Text>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                                Display Name
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.colors.bgCanvas,
                                        color: theme.colors.textPrimary,
                                        borderColor: theme.colors.borderSubtle,
                                    },
                                ]}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter display name"
                                placeholderTextColor={theme.colors.textSecondary}
                                editable={!loading}
                                maxLength={30}
                            />
                            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                                This is how they'll appear in your household
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                                Profile Color
                            </Text>
                            <View style={styles.colorGrid}>
                                {PROFILE_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color.hex}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: color.hex },
                                            selectedColor === color.hex && styles.colorOptionSelected,
                                        ]}
                                        onPress={() => setSelectedColor(color.hex)}
                                        disabled={loading}
                                    >
                                        {selectedColor === color.hex && (
                                            <View style={styles.colorCheckmark} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.previewCard, { backgroundColor: theme.colors.bgCanvas }]}>
                            <Text style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                                Preview
                            </Text>
                            <View style={styles.previewContent}>
                                <View style={[styles.previewAvatar, { backgroundColor: selectedColor }]}>
                                    <Text style={styles.previewAvatarText}>
                                        {displayName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={[styles.previewName, { color: theme.colors.textPrimary }]}>
                                    {displayName || 'Display Name'}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {loading && (
                        <ActivityIndicator size="large" color={theme.colors.actionPrimary} style={styles.loader} />
                    )}

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.colors.actionPrimary },
                        ]}
                        onPress={handleSubmit}
                        disabled={loading || !displayName.trim()}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Linking...' : 'Link Child'}
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
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
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
        marginBottom: 24,
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        marginTop: 4,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    colorCheckmark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    previewCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    previewContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    previewAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewAvatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    previewName: {
        fontSize: 18,
        fontWeight: '600',
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
