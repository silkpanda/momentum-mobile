// =========================================================
// Briefing Create Task Modal - Guided Task Creation
// =========================================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Check, Sun, Lightbulb } from 'lucide-react-native';
import { api } from '../../../../services/api';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
    validateForm,
    getInitialFormData,
    sanitizeFormData,
    type FormField,
    type FormData
} from 'momentum-shared';

interface BriefingCreateTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    members: any[];
    initialTask?: any;
}

const TASK_FORM_FIELDS: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, min: 3 },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'pointsValue', label: 'Points', type: 'number', required: true, min: 1, defaultValue: 10 },
];

export default function BriefingCreateTaskModal({ visible, onClose, onTaskCreated, members, initialTask }: BriefingCreateTaskModalProps) {
    const { currentTheme: theme } = useTheme();

    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Suggested tasks based on common patterns
    const taskSuggestions = [
        { title: 'Clean your room', points: 15 },
        { title: 'Do homework', points: 20 },
        { title: 'Take out trash', points: 10 },
        { title: 'Help with dishes', points: 10 },
    ];

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
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSuggestionSelect = (suggestion: typeof taskSuggestions[0]) => {
        setFormData(prev => ({
            ...prev,
            title: suggestion.title,
            pointsValue: suggestion.points,
        }));
    };

    const toggleAssignee = (memberId: string) => {
        if (selectedAssignees.includes(memberId)) {
            setSelectedAssignees(selectedAssignees.filter(id => id !== memberId));
        } else {
            setSelectedAssignees([...selectedAssignees, memberId]);
        }
    };

    const handleSubmit = async () => {
        const validation = validateForm(formData, TASK_FORM_FIELDS);

        if (selectedAssignees.length === 0) {
            Alert.alert('Who should do this?', 'Please select at least one family member');
            return;
        }

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsSubmitting(true);
        try {
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
            Alert.alert('Oops!', 'Something went wrong. Please try again.');
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
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={[styles.iconBadge, { backgroundColor: theme.colors.actionPrimary + '20' }]}>
                                    <Sun size={20} color={theme.colors.actionPrimary} />
                                </View>
                                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                    {initialTask ? 'Edit Task' : 'Create a Task'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Helper Text */}
                        <View style={[styles.helperCard, { backgroundColor: theme.colors.bgCanvas }]}>
                            <Lightbulb size={18} color={theme.colors.actionPrimary} />
                            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                                What would you like your family to accomplish today?
                            </Text>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            {/* Quick Suggestions */}
                            {!initialTask && !formData.title && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                        Quick Ideas
                                    </Text>
                                    <View style={styles.suggestionsContainer}>
                                        {taskSuggestions.map((suggestion, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.suggestionChip, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }]}
                                                onPress={() => handleSuggestionSelect(suggestion)}
                                            >
                                                <Text style={[styles.suggestionText, { color: theme.colors.textPrimary }]}>
                                                    {suggestion.title}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Title Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    Task Name
                                </Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: errors.title ? theme.colors.signalAlert : theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    placeholder="e.g., Clean your room"
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
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    Details (Optional)
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    placeholder="Add any helpful details..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={formData.description}
                                    onChangeText={(text) => handleChange('description', text)}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Points Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    Reward Points
                                </Text>
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
                                <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
                                    💡 Tip: Harder tasks deserve more points!
                                </Text>
                            </View>

                            {/* Assignees */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    Who should do this?
                                </Text>
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

                        {/* Footer */}
                        <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary }]}
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 20,
        paddingBottom: 40,
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
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    helperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    helperText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        height: 90,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    hintText: {
        fontSize: 13,
        marginTop: 8,
        fontStyle: 'italic',
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    suggestionChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    suggestionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    assigneesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    assigneeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    assigneeName: {
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        paddingTop: 16,
        borderTopWidth: 1,
        marginTop: 8,
    },
    createButton: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
