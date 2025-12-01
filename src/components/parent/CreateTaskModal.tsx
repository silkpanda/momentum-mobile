import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import {
    validateForm,
    getInitialFormData,
    sanitizeFormData,
    type FormField,
    type FormData
} from 'momentum-shared';

interface CreateTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    members: any[];
    initialTask?: any; // Optional task to edit
}

const TASK_FORM_FIELDS: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, min: 3 },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'pointsValue', label: 'Points Value', type: 'number', required: true, min: 1, defaultValue: 10 },
];

export default function CreateTaskModal({ visible, onClose, onTaskCreated, members, initialTask }: CreateTaskModalProps) {
    const { currentTheme: theme } = useTheme();

    // Form State
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset or populate form when modal opens
    useEffect(() => {
        if (visible) {
            if (initialTask) {
                setFormData({
                    title: initialTask.title || '',
                    description: initialTask.description || '',
                    pointsValue: initialTask.pointsValue || 10,
                });
                setSelectedAssignees(initialTask.assignedTo || []);
            } else {
                setFormData(getInitialFormData(TASK_FORM_FIELDS));
                setSelectedAssignees([]);
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [visible, initialTask]);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const toggleAssignee = (memberId: string) => {
        if (selectedAssignees.includes(memberId)) {
            setSelectedAssignees(selectedAssignees.filter(id => id !== memberId));
        } else {
            setSelectedAssignees([...selectedAssignees, memberId]);
        }
    };

    const handleSubmit = async () => {
        // 1. Validate Form Fields
        const validation = validateForm(formData, TASK_FORM_FIELDS);

        // 2. Custom Validation (Assignees)
        if (selectedAssignees.length === 0) {
            Alert.alert('Validation Error', 'Please select at least one assignee');
            return;
        }

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsSubmitting(true);
        try {
            // 3. Sanitize Data
            const sanitizedData = sanitizeFormData(formData, TASK_FORM_FIELDS);

            const taskData = {
                ...sanitizedData,
                assignedTo: selectedAssignees,
            };

            if (initialTask) {
                await api.updateTask(initialTask._id || initialTask.id, taskData);
            } else {
                await api.createTask(taskData);
            }

            onTaskCreated();
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            Alert.alert('Error', 'Failed to save task');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.bgSurface }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                {initialTask ? 'Edit Task' : 'New Task'}
                            </Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            {/* Title Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: errors.title ? theme.colors.signalAlert : theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    placeholder="e.g. Clean your room"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={formData.title}
                                    onChangeText={(text) => handleChange('title', text)}
                                />
                                {errors.title && (
                                    <Text style={[styles.errorText, { color: theme.colors.signalAlert }]}>{errors.title}</Text>
                                )}
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    placeholder="Add details..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={formData.description}
                                    onChangeText={(text) => handleChange('description', text)}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Points Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Points Value</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: errors.pointsValue ? theme.colors.signalAlert : theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    value={String(formData.pointsValue)}
                                    onChangeText={(text) => handleChange('pointsValue', text)}
                                    keyboardType="numeric"
                                />
                                {errors.pointsValue && (
                                    <Text style={[styles.errorText, { color: theme.colors.signalAlert }]}>{errors.pointsValue}</Text>
                                )}
                            </View>

                            {/* Assignees Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Assign To</Text>
                                <View style={styles.assigneesContainer}>
                                    {members.map(member => (
                                        <TouchableOpacity
                                            key={member.id || member._id}
                                            style={[
                                                styles.assigneeChip,
                                                selectedAssignees.includes(member.id || member._id)
                                                    ? { backgroundColor: theme.colors.actionPrimary, borderColor: theme.colors.actionPrimary }
                                                    : { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }
                                            ]}
                                            onPress={() => toggleAssignee(member.id || member._id)}
                                        >
                                            <Text style={[
                                                styles.assigneeName,
                                                selectedAssignees.includes(member.id || member._id)
                                                    ? { color: '#FFFFFF' }
                                                    : { color: theme.colors.textPrimary }
                                            ]}>
                                                {member.firstName}
                                            </Text>
                                            {selectedAssignees.includes(member.id || member._id) && (
                                                <Check size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
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
                                        {initialTask ? 'Save Changes' : 'Create Task'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        height: '80%',
        padding: 24,
        paddingBottom: 40, // Safe area
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
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    assigneesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    assigneeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    assigneeName: {
        fontSize: 14,
        fontWeight: '600',
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
