import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { X, Plus, Trash2, Sunrise, Sun, Moon } from 'lucide-react-native';
import { api } from '../../services/api';
import { logger } from '../../utils/logger';
import MemberAvatar from '../family/MemberAvatar';

interface CreateRoutineModalProps {
    visible: boolean;
    onClose: () => void;
    memberId?: string;
    onSuccess: () => void;
}

type TimeOfDay = 'morning' | 'noon' | 'night';

export default function CreateRoutineModal({ visible, onClose, memberId, onSuccess }: CreateRoutineModalProps) {
    const { currentTheme: theme } = useTheme();
    const { members } = useData();

    const [title, setTitle] = useState('');
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
    const [items, setItems] = useState<{ title: string; order: number; isCompleted: boolean }[]>([{ title: '', order: 0, isCompleted: false }]);
    const [selectedMemberId, setSelectedMemberId] = useState(memberId || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (memberId) setSelectedMemberId(memberId);
    }, [memberId]);

    const handleAddItem = () => {
        setItems([...items, { title: '', order: items.length, isCompleted: false }]);
        // Don't blur - let keyboard stay open for next input
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        const reordered = newItems.map((item, i) => ({ ...item, order: i }));
        setItems(reordered);
    };

    const handleItemChange = (text: string, index: number) => {
        const newItems = [...items];
        newItems[index].title = text;
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!selectedMemberId) {
            Alert.alert('Error', 'Please select a family member');
            return;
        }

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
                memberId: selectedMemberId,
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
            if (!memberId) setSelectedMemberId('');
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

                    {/* Member Selection (if not pre-selected) */}
                    {!memberId && (
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Assign To</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {members.map(member => (
                                    <TouchableOpacity
                                        key={member.id || member._id}
                                        style={[
                                            styles.memberOption,
                                            {
                                                borderColor: selectedMemberId === (member.id || member._id) ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                                backgroundColor: selectedMemberId === (member.id || member._id) ? theme.colors.actionPrimary + '10' : theme.colors.bgSurface
                                            }
                                        ]}
                                        onPress={() => setSelectedMemberId(member.id || member._id || '')}
                                    >
                                        <MemberAvatar
                                            name={member.firstName}
                                            color={member.profileColor}
                                            size={40}
                                        />
                                        <Text style={[
                                            styles.memberName,
                                            { color: theme.colors.textPrimary, fontWeight: selectedMemberId === (member.id || member._id) ? 'bold' : 'normal' }
                                        ]}>
                                            {member.firstName}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

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
                                    blurOnSubmit={false}
                                    returnKeyType="next"
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
    memberOption: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
        minWidth: 80,
    },
    memberName: {
        fontSize: 12,
    },
});
