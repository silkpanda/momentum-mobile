// src/components/routines/EditRoutineModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Plus, Trash2, Sunrise, Sun, Moon } from 'lucide-react-native';
import { api } from '../../services/api';
import { logger } from '../../utils/logger';
import { Routine } from '../../types';

interface EditRoutineModalProps {
    visible: boolean;
    onClose: () => void;
    routine: Routine;
    onSuccess: () => void;
}

type TimeOfDay = 'morning' | 'noon' | 'night';

export default function EditRoutineModal({ visible, onClose, routine, onSuccess }: EditRoutineModalProps) {
    const { currentTheme: theme } = useTheme();
    const [title, setTitle] = useState(routine.title);
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(routine.timeOfDay as TimeOfDay);
    const [items, setItems] = useState<{ title: string; order: number; isCompleted: boolean; _id?: string }[]>(
        routine.items.map(i => ({ ...i }))
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            setTitle(routine.title);
            setTimeOfDay(routine.timeOfDay as TimeOfDay);
            setItems(routine.items.map(i => ({ ...i })));
        }
    }, [visible, routine]);

    const handleAddItem = () => {
        setItems([...items, { title: '', order: items.length, isCompleted: false }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        // Reorder
        const reordered = newItems.map((item, i) => ({ ...item, order: i }));
        setItems(reordered);
    };

    const handleItemChange = (text: string, index: number) => {
        const newItems = [...items];
        newItems[index].title = text;
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a routine title');
            return;
        }

        const validItems = items.filter(i => i.title.trim().length > 0);
        if (validItems.length === 0) {
            Alert.alert('Error', 'Please add at least one item');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.updateRoutine(routine._id || routine.id, {
                title,
                timeOfDay,
                items: validItems,
                isActive: true
            });

            Alert.alert('Success', 'Routine updated successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            logger.error('Failed to update routine', error);
            Alert.alert('Error', 'Failed to update routine. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Routine',
            'Are you sure you want to delete this routine? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSubmitting(true);
                            await api.deleteRoutine(routine._id || routine.id);
                            onSuccess();
                            onClose();
                        } catch (error) {
                            logger.error('Failed to delete routine', error);
                            Alert.alert('Error', 'Failed to delete routine.');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const TimeOption = ({ value, icon: Icon, label }: { value: TimeOfDay, icon: any, label: string }) => (
        <TouchableOpacity
            style={[
                styles.timeOption,
                {
                    backgroundColor: timeOfDay === value ? theme.colors.actionPrimary : theme.colors.bgSurface,
                    borderColor: theme.colors.borderSubtle,
                    borderWidth: 1
                }
            ]}
            onPress={() => setTimeOfDay(value)}
        >
            <Icon size={20} color={timeOfDay === value ? '#FFFFFF' : theme.colors.textSecondary} />
            <Text style={[
                styles.timeLabel,
                { color: timeOfDay === value ? '#FFFFFF' : theme.colors.textSecondary }
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
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle, backgroundColor: theme.colors.bgSurface }]}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Edit Routine</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Title Input */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Routine Title</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.colors.bgSurface,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.borderSubtle
                            }]}
                            placeholder="e.g., Morning Routine"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Time of Day */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Time of Day</Text>
                        <View style={styles.timeOptionsContainer}>
                            <TimeOption value="morning" icon={Sunrise} label="Morning" />
                            <TimeOption value="noon" icon={Sun} label="Noon" />
                            <TimeOption value="night" icon={Moon} label="Night" />
                        </View>
                    </View>

                    {/* Items */}
                    <View style={styles.section}>
                        <View style={styles.itemsHeader}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Checklist Items</Text>
                        </View>

                        {items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <TextInput
                                    style={[styles.itemInput, {
                                        backgroundColor: theme.colors.bgSurface,
                                        color: theme.colors.textPrimary,
                                        borderColor: theme.colors.borderSubtle
                                    }]}
                                    placeholder={`Item ${index + 1}`}
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={item.title}
                                    onChangeText={(text) => handleItemChange(text, index)}
                                />
                                {items.length > 1 && (
                                    <TouchableOpacity
                                        onPress={() => handleRemoveItem(index)}
                                        style={styles.removeButton}
                                    >
                                        <Trash2 size={20} color={theme.colors.signalAlert} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.addButton, { borderColor: theme.colors.actionPrimary }]}
                            onPress={handleAddItem}
                        >
                            <Plus size={20} color={theme.colors.actionPrimary} />
                            <Text style={[styles.addButtonText, { color: theme.colors.actionPrimary }]}>Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={[styles.deleteButton, { borderColor: theme.colors.signalAlert }]}
                        onPress={handleDelete}
                    >
                        <Text style={[styles.deleteButtonText, { color: theme.colors.signalAlert }]}>Delete Routine</Text>
                    </TouchableOpacity>
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
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    timeOptionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    timeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    timeLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    itemInput: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    removeButton: {
        padding: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 8,
        marginTop: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 24,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
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
