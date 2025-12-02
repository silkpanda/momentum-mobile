// =========================================================
// EditTaskModal - Create/Edit Task with Full Form
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
} from 'react-native';
import { X, Users, DollarSign, Target } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { api } from '../../../../services/api';
import { Task, Member } from '../../../../types';

interface EditTaskModalProps {
    visible: boolean;
    onClose: () => void;
    task?: Task | null;
    onSaved: () => void;
}

export default function EditTaskModal({ visible, onClose, task, onSaved }: EditTaskModalProps) {
    const { currentTheme: theme } = useTheme();
    const { members } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pointsValue: 10,
        assignedTo: [] as string[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form when task changes
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                pointsValue: task.pointsValue || 10,
                assignedTo: task.assignedTo || [],
            });
        } else {
            setFormData({
                title: '',
                description: '',
                pointsValue: 10,
                assignedTo: [],
            });
        }
        setErrors({});
    }, [task, visible]);

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        if (formData.pointsValue < 1) {
            newErrors.pointsValue = 'Points must be at least 1';
        }

        if (formData.assignedTo.length === 0) {
            newErrors.assignedTo = 'Please assign to at least one member';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            if (task) {
                // Update existing task
                await api.updateTask(task._id || '', formData);
            } else {
                // Create new task
                await api.createTask(formData);
            }

            onSaved();
        } catch (error) {
            console.error('Save task error:', error);
            Alert.alert('Error', `Failed to ${task ? 'update' : 'create'} task`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = () => {
        if (!task) return;

        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteTask(task._id || '');
                        onSaved();
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete task');
                    }
                },
            },
        ]);
    };

    // Toggle member assignment
    const toggleMember = (memberId: string) => {
        setFormData((prev) => ({
            ...prev,
            assignedTo: prev.assignedTo.includes(memberId)
                ? prev.assignedTo.filter((id) => id !== memberId)
                : [...prev.assignedTo, memberId],
        }));
        // Clear error when user selects a member
        if (errors.assignedTo) {
            setErrors((prev) => ({ ...prev, assignedTo: '' }));
        }
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={task ? 'Edit Task' : 'Create Task'}
            headerRight={
                <View style={styles.headerActions}>
                    {task && (
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
            <View style={styles.form}>
                {/* Title */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                        Title <Text style={styles.required}>*</Text>
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
                        placeholder="e.g., Clean your room"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={formData.title}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, title: text }));
                            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                        }}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Description</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.borderSubtle,
                            },
                        ]}
                        placeholder="Add details (optional)"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={formData.description}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Points */}
                <View style={styles.field}>
                    <View style={styles.labelRow}>
                        <DollarSign size={18} color={theme.colors.actionPrimary} />
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                            Points <Text style={styles.required}>*</Text>
                        </Text>
                    </View>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                color: theme.colors.textPrimary,
                                borderColor: errors.pointsValue ? '#EF4444' : theme.colors.borderSubtle,
                            },
                        ]}
                        placeholder="10"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={String(formData.pointsValue)}
                        onChangeText={(text) => {
                            const value = parseInt(text) || 0;
                            setFormData((prev) => ({ ...prev, pointsValue: value }));
                            if (errors.pointsValue) setErrors((prev) => ({ ...prev, pointsValue: '' }));
                        }}
                        keyboardType="number-pad"
                    />
                    {errors.pointsValue && <Text style={styles.errorText}>{errors.pointsValue}</Text>}
                </View>

                {/* Assign to Members */}
                <View style={styles.field}>
                    <View style={styles.labelRow}>
                        <Users size={18} color={theme.colors.actionPrimary} />
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                            Assign To <Text style={styles.required}>*</Text>
                        </Text>
                    </View>
                    <View style={styles.memberGrid}>
                        {members.map((member) => {
                            const memberId = member.id || member._id || '';
                            const isSelected = formData.assignedTo.includes(memberId);
                            return (
                                <TouchableOpacity
                                    key={member.id || member._id}
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
                                    onPress={() => toggleMember(member.id || member._id || '')}
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
                    {errors.assignedTo && <Text style={styles.errorText}>{errors.assignedTo}</Text>}
                </View>

                {/* Focus Mode Info (if editing) */}
                {task && (
                    <View
                        style={[
                            styles.infoBox,
                            { backgroundColor: theme.colors.actionPrimary + '10', borderColor: theme.colors.actionPrimary + '30' },
                        ]}
                    >
                        <Target size={16} color={theme.colors.actionPrimary} />
                        <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>
                            To set this as a focus task, use the Member Detail screen
                        </Text>
                    </View>
                )}
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: 20,
    },
    field: {
        gap: 8,
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
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    errorText: {
        fontSize: 13,
        color: '#EF4444',
        marginTop: 4,
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
    },
});
