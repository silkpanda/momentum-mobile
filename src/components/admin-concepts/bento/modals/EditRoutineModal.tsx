// =========================================================
// EditRoutineModal - Create/Edit Routine with Member Assignment
// =========================================================
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { X, Plus, Trash2, Sunrise, Sun, Moon, Users } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../services/api';
import { Routine } from '../../../../types';

interface EditRoutineModalProps {
    visible: boolean;
    onClose: () => void;
    routine?: Routine | null;
    onSaved: () => void;
}

type TimeOfDay = 'morning' | 'noon' | 'night';

export default function EditRoutineModal({ visible, onClose, routine, onSaved }: EditRoutineModalProps) {
    const { currentTheme: theme } = useTheme();
    const { members } = useData();
    const { householdId } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
    const [memberId, setMemberId] = useState<string>('');
    const [items, setItems] = useState<{ title: string; order: number; isCompleted: boolean; _id?: string }[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form
    useEffect(() => {
        if (routine) {
            setTitle(routine.title);
            setTimeOfDay(routine.timeOfDay as TimeOfDay);
            setMemberId(routine.memberId);
            setItems(routine.items.map(i => ({ ...i })));
        } else {
            setTitle('');
            setTimeOfDay('morning');
            setMemberId('');
            setItems([{ title: '', order: 0, isCompleted: false }]);
        }
        setErrors({});
    }, [routine, visible]);

    // Handle item changes
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

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!memberId) {
            newErrors.memberId = 'Please assign to a member';
        }

        const validItems = items.filter(i => i.title.trim().length > 0);
        if (validItems.length === 0) {
            newErrors.items = 'Add at least one item';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validate()) return;
        if (!householdId) return;

        setIsSubmitting(true);

        const validItems = items.filter(i => i.title.trim().length > 0);

        try {
            const payload = {
                householdId,
                memberId,
                title,
                timeOfDay,
                items: validItems,
                isActive: true,
            };

            if (routine) {
                await api.updateRoutine(routine._id || routine.id, payload);
            } else {
                await api.createRoutine(payload);
            }

            onSaved();
            onClose();
        } catch (error) {
            console.error('Save routine error:', error);
            Alert.alert('Error', `Failed to ${routine ? 'update' : 'create'} routine`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = () => {
        if (!routine) return;

        Alert.alert('Delete Routine', 'Are you sure you want to delete this routine?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteRoutine(routine._id || routine.id);
                        onSaved();
                        onClose();
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete routine');
                    }
                },
            },
        ]);
    };

    const TimeOption = ({ value, icon: Icon, label }: { value: TimeOfDay, icon: any, label: string }) => (
        <TouchableOpacity
            style={[
                styles.timeOption,
                {
                    backgroundColor: timeOfDay === value ? theme.colors.actionPrimary : theme.colors.bgCanvas,
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
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={routine ? 'Edit Routine' : 'Create Routine'}
            headerRight={
                <View style={styles.headerActions}>
                    {routine && (
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSubmitting}
                        style={[
                            styles.saveButton,
                            { backgroundColor: theme.colors.actionPrimary },
                            isSubmitting && { opacity: 0.6 },
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            }
        >
            <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Title */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                        Routine Title <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                color: theme.colors.textPrimary,
                                borderColor: errors.title ? '#EF4444' : theme.colors.borderSubtle,
                            },
                        ]}
                        placeholder="e.g., Morning Routine"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={title}
                        onChangeText={(text) => {
                            setTitle(text);
                            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                        }}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                </View>

                {/* Assign To */}
                <View style={styles.field}>
                    <View style={styles.labelRow}>
                        <Users size={18} color={theme.colors.actionPrimary} />
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                            Assign To <Text style={styles.required}>*</Text>
                        </Text>
                    </View>
                    <View style={styles.memberGrid}>
                        {members.map((member) => {
                            const mId = member.id || member._id || '';
                            const isSelected = memberId === mId;
                            return (
                                <TouchableOpacity
                                    key={mId}
                                    style={[
                                        styles.memberCard,
                                        {
                                            backgroundColor: theme.colors.bgCanvas,
                                            borderColor: isSelected
                                                ? theme.colors.actionPrimary
                                                : theme.colors.borderSubtle,
                                        },
                                        isSelected && { borderWidth: 2 },
                                    ]}
                                    onPress={() => {
                                        setMemberId(mId);
                                        if (errors.memberId) setErrors((prev) => ({ ...prev, memberId: '' }));
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.memberAvatar,
                                            {
                                                backgroundColor: isSelected
                                                    ? theme.colors.actionPrimary
                                                    : theme.colors.actionPrimary + '20',
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.memberInitial,
                                                { color: isSelected ? '#FFF' : theme.colors.actionPrimary },
                                            ]}
                                        >
                                            {member.firstName.charAt(0)}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.memberName,
                                            {
                                                color: isSelected ? theme.colors.actionPrimary : theme.colors.textPrimary,
                                            },
                                        ]}
                                    >
                                        {member.firstName}
                                    </Text>
                                    {isSelected && (
                                        <View style={[styles.checkmark, { backgroundColor: theme.colors.actionPrimary }]}>
                                            <Text style={styles.checkmarkText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {errors.memberId && <Text style={styles.errorText}>{errors.memberId}</Text>}
                </View>

                {/* Time of Day */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Time of Day</Text>
                    <View style={styles.timeOptionsContainer}>
                        <TimeOption value="morning" icon={Sunrise} label="Morning" />
                        <TimeOption value="noon" icon={Sun} label="Noon" />
                        <TimeOption value="night" icon={Moon} label="Night" />
                    </View>
                </View>

                {/* Items */}
                <View style={styles.field}>
                    <View style={styles.itemsHeader}>
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                            Checklist Items <Text style={styles.required}>*</Text>
                        </Text>
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <TextInput
                                style={[styles.itemInput, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                placeholder={`Item ${index + 1}`}
                                placeholderTextColor={theme.colors.textSecondary}
                                value={item.title}
                                onChangeText={(text) => handleItemChange(text, index)}
                            />
                            {items.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => handleRemoveItem(index)}
                                    style={styles.removeButton}
                                >
                                    <Trash2 size={20} color={theme.colors.signalAlert || '#EF4444'} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

                    <TouchableOpacity
                        style={[styles.addButton, { borderColor: theme.colors.actionPrimary }]}
                        onPress={handleAddItem}
                    >
                        <Plus size={20} color={theme.colors.actionPrimary} />
                        <Text style={[styles.addButtonText, { color: theme.colors.actionPrimary }]}>Add Item</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: 24,
    },
    field: {
        gap: 8,
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    errorText: {
        fontSize: 13,
        color: '#EF4444',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    deleteButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    memberGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    memberCard: {
        width: '48%',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        gap: 8,
        position: 'relative',
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberInitial: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberName: {
        fontSize: 14,
        fontWeight: '600',
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
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
});
