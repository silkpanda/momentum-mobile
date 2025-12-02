import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Star, AlertCircle } from 'lucide-react-native';
import { api } from '../../services/api';
import { logger } from '../../utils/logger';

interface CreateWishlistItemModalProps {
    visible: boolean;
    onClose: () => void;
    memberId: string;
    householdId: string;
    onSuccess: () => void;
}

export default function CreateWishlistItemModal({
    visible,
    onClose,
    memberId,
    householdId,
    onSuccess
}: CreateWishlistItemModalProps) {
    const { currentTheme: theme } = useTheme();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pointsCost, setPointsCost] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter an item title');
            return;
        }

        const points = parseInt(pointsCost);
        if (!pointsCost || isNaN(points) || points <= 0) {
            Alert.alert('Error', 'Please enter a valid point cost');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.createWishlistItem({
                memberId,
                householdId,
                title: title.trim(),
                description: description.trim() || undefined,
                pointsCost: points,
                priority
            });

            Alert.alert('Success', 'Wishlist item added!');
            onSuccess();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setPointsCost('');
            setPriority('medium');
        } catch (error) {
            logger.error('Failed to create wishlist item', error);
            Alert.alert('Error', 'Failed to add wishlist item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const PriorityOption = ({ value, label, color }: { value: 'low' | 'medium' | 'high', label: string, color: string }) => (
        <TouchableOpacity
            style={[
                styles.priorityOption,
                {
                    backgroundColor: priority === value ? color + '20' : theme.colors.bgSurface,
                    borderColor: priority === value ? color : theme.colors.borderSubtle,
                    borderWidth: 1.5
                }
            ]}
            onPress={() => setPriority(value)}
        >
            <Text style={[
                styles.priorityLabel,
                { color: priority === value ? color : theme.colors.textSecondary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle, backgroundColor: theme.colors.bgSurface }]}>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Add to Wishlist</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                        {/* Title Input */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Item Name *</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgSurface,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                placeholder="e.g., New Bike, Video Game, etc."
                                placeholderTextColor={theme.colors.textTertiary}
                                value={title}
                                onChangeText={setTitle}
                                returnKeyType="next"
                                blurOnSubmit={false}
                            />
                        </View>

                        {/* Description Input */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.textArea, {
                                    backgroundColor: theme.colors.bgSurface,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                placeholder="Add details about this item..."
                                placeholderTextColor={theme.colors.textTertiary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Points Cost */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Point Cost *</Text>
                            <View style={styles.pointsInputContainer}>
                                <Star size={20} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                                <TextInput
                                    style={[styles.pointsInput, {
                                        backgroundColor: theme.colors.bgSurface,
                                        color: theme.colors.textPrimary,
                                        borderColor: theme.colors.borderSubtle
                                    }]}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={pointsCost}
                                    onChangeText={setPointsCost}
                                    keyboardType="number-pad"
                                />
                                <Text style={[styles.pointsLabel, { color: theme.colors.textSecondary }]}>points</Text>
                            </View>
                        </View>

                        {/* Priority */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Priority</Text>
                            <View style={styles.priorityContainer}>
                                <PriorityOption value="low" label="Low" color={theme.colors.textTertiary} />
                                <PriorityOption value="medium" label="Medium" color={'#F59E0B'} />
                                <PriorityOption value="high" label="High" color={theme.colors.signalAlert} />
                            </View>
                        </View>

                        {/* Info Box */}
                        <View style={[styles.infoBox, { backgroundColor: theme.colors.actionPrimary + '10', borderColor: theme.colors.actionPrimary + '30' }]}>
                            <AlertCircle size={16} color={theme.colors.actionPrimary} />
                            <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>
                                Save up points by completing tasks to purchase this item!
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle, backgroundColor: theme.colors.bgSurface }]}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: theme.colors.actionPrimary,
                                    opacity: isSubmitting ? 0.7 : 1
                                }
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? 'Adding...' : 'Add to Wishlist'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 80,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    pointsInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    pointsInput: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    pointsLabel: {
        fontSize: 16,
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    priorityLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        paddingBottom: 40,
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
