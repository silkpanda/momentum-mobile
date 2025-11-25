// src/components/routines/CreateRoutineModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Plus, Trash2, Sunrise, Sun, Moon } from 'lucide-react-native';
import { api } from '../../services/api';
import { logger } from '../../utils/logger';

interface CreateRoutineModalProps {
    visible: boolean;
    onClose: () => void;
    memberId: string;
    onSuccess: () => void;
}

type TimeOfDay = 'morning' | 'noon' | 'night';

export default function CreateRoutineModal({ visible, onClose, memberId, onSuccess }: CreateRoutineModalProps) {
    const { currentTheme: theme } = useTheme();
    const [title, setTitle] = useState('');
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
    const [items, setItems] = useState<{ title: string; order: number; isCompleted: boolean }[]>([{ title: '', order: 0, isCompleted: false }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            await api.createRoutine({
                memberId,
                title,
                timeOfDay,
                items: validItems,
                isActive: true
            });

            Alert.alert('Success', 'Routine created successfully!');
            onSuccess();
            onClose();
            // Reset form
            setTitle('');
            setTimeOfDay('morning');
            setItems([{ title: '', order: 0, isCompleted: false }]);
        } catch (error) {
            logger.error('Failed to create routine', error);
            Alert.alert('Error', 'Failed to create routine. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Create Routine</Text>
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
                            {isSubmitting ? 'Creating...' : 'Create Routine'}
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
