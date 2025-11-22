import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';

interface CreateQuestModalProps {
    visible: boolean;
    onClose: () => void;
    onQuestCreated: () => void;
    initialQuest?: any;
}

export default function CreateQuestModal({ visible, onClose, onQuestCreated, initialQuest }: CreateQuestModalProps) {
    const theme = themes.calmLight;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [reward, setReward] = useState('100');
    const [allowMultipleClaims, setAllowMultipleClaims] = useState(false);
    const [maxClaims, setMaxClaims] = useState('');
    const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            if (initialQuest) {
                setTitle(initialQuest.title || '');
                setDescription(initialQuest.description || '');
                setReward(String(initialQuest.pointsValue || '100'));

                // Determine if multiple claims are allowed
                const isMultiClaim = initialQuest.questType === 'limited' || initialQuest.questType === 'unlimited';
                setAllowMultipleClaims(isMultiClaim);
                setMaxClaims(initialQuest.maxClaims ? String(initialQuest.maxClaims) : '');

                setRecurrence(initialQuest.recurrence?.frequency || 'none');
            } else {
                setTitle('');
                setDescription('');
                setReward('100');
                setAllowMultipleClaims(false);
                setMaxClaims('');
                setRecurrence('none');
            }
            setIsSubmitting(false);
        }
    }, [visible, initialQuest]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('Please enter a quest title');
            return;
        }

        setIsSubmitting(true);
        try {
            // Determine the correct questType based on settings
            let questType: 'one-time' | 'limited' | 'unlimited' = 'one-time';
            if (allowMultipleClaims) {
                questType = maxClaims ? 'limited' : 'unlimited';
            }

            const questData: any = {
                title,
                description,
                pointsValue: parseInt(reward) || 0,
                questType,
                maxClaims: maxClaims ? parseInt(maxClaims) : undefined,
                recurrence: recurrence !== 'none' ? recurrence : undefined,
            };

            if (initialQuest) {
                await api.updateQuest(initialQuest._id || initialQuest.id, questData);
            } else {
                await api.createQuest(questData);
            }

            onQuestCreated();
            onClose();
        } catch (error) {
            console.error('Error saving quest:', error);
            alert('Failed to save quest');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderRecurrenceButton = (type: 'none' | 'daily' | 'weekly' | 'monthly', label: string) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                recurrence === type && { backgroundColor: theme.colors.actionPrimary },
                recurrence !== type && { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }
            ]}
            onPress={() => setRecurrence(type)}
        >
            <Text style={[
                styles.optionText,
                recurrence === type ? { color: '#FFFFFF' } : { color: theme.colors.textPrimary }
            ]}>
                {label}
            </Text>
            {recurrence === type && <Check size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.bgSurface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                            {initialQuest ? 'Edit Quest' : 'New Quest'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                placeholder="e.g. Read 5 Books"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                placeholder="Add details..."
                                placeholderTextColor={theme.colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Reward (Points)</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                value={reward}
                                onChangeText={setReward}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Who Can Claim?</Text>
                            <TouchableOpacity
                                style={[
                                    styles.checkboxRow,
                                    { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }
                                ]}
                                onPress={() => setAllowMultipleClaims(!allowMultipleClaims)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    allowMultipleClaims && { backgroundColor: theme.colors.actionPrimary, borderColor: theme.colors.actionPrimary }
                                ]}>
                                    {allowMultipleClaims && <Check size={16} color="#FFFFFF" />}
                                </View>
                                <Text style={[styles.checkboxLabel, { color: theme.colors.textPrimary }]}>
                                    Allow multiple people to claim this quest
                                </Text>
                            </TouchableOpacity>
                            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                                {allowMultipleClaims
                                    ? 'Multiple family members can work on this quest at the same time'
                                    : 'Only one person can claim this quest at a time'}
                            </Text>
                        </View>

                        {allowMultipleClaims && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Max People (Optional)</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    value={maxClaims}
                                    onChangeText={setMaxClaims}
                                    keyboardType="numeric"
                                    placeholder="Leave blank for unlimited"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                                <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                                    Limit how many people can claim this quest simultaneously
                                </Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Recurrence</Text>
                            <View style={styles.optionsRow}>
                                {renderRecurrenceButton('none', 'None')}
                                {renderRecurrenceButton('daily', 'Daily')}
                            </View>
                            <View style={styles.optionsRow}>
                                {renderRecurrenceButton('weekly', 'Weekly')}
                                {renderRecurrenceButton('monthly', 'Monthly')}
                            </View>
                            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                                {recurrence === 'none' ? 'Quest will not reset' : `Quest resets ${recurrence}`}
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary, flex: 1 }]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.createButtonText}>
                                    {initialQuest ? 'Save Changes' : 'Create Quest'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '85%',
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxLabel: {
        fontSize: 14,
        flex: 1,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    optionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    footer: {
        paddingTop: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
    },
    createButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
