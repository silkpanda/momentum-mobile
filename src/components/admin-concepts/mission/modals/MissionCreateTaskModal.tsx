// =========================================================
// Mission Create Task Modal - Full-Featured Task Creation
// =========================================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { X, Check, Rocket, Calendar, Repeat } from 'lucide-react-native';
import { api } from '../../../../services/api';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
    validateForm,
    getInitialFormData,
    sanitizeFormData,
    type FormField,
    type FormData
} from 'momentum-shared';

interface MissionCreateTaskModalProps {
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

export default function MissionCreateTaskModal({ visible, onClose, onTaskCreated, members, initialTask }: MissionCreateTaskModalProps) {
    const { currentTheme: theme } = useTheme();

    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced options
    const [isRecurring, setIsRecurring] = useState(false);
    const [requiresApproval, setRequiresApproval] = useState(true);

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
            setShowAdvanced(false);
            setIsRecurring(false);
            setRequiresApproval(true);
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

    const toggleAssignee = (memberId: string) => {
        if (selectedAssignees.includes(memberId)) {
            setSelectedAssignees(selectedAssignees.filter(id => id !== memberId));
        } else {
            setSelectedAssignees([...selectedAssignees, memberId]);
        }
    };

    const selectAllMembers = () => {
        if (selectedAssignees.length === members.length) {
            setSelectedAssignees([]);
        } else {
            setSelectedAssignees(members.map(m => m.id || m._id));
        }
    };

    const handleSubmit = async () => {
        const validation = validateForm(formData, TASK_FORM_FIELDS);

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
            const sanitizedData = sanitizeFormData(formData, TASK_FORM_FIELDS);
            const taskData = {
                ...sanitizedData,
                assignedTo: selectedAssignees,
                // Advanced options would be added here
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
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={[styles.iconBadge, { backgroundColor: theme.colors.actionPrimary + '20' }]}>
                                    <Rocket size={20} color={theme.colors.actionPrimary} />
                                </View>
                                <View>
                                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                        {initialTask ? 'Edit Task' : 'New Task'}
                                    </Text>
                                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                        Full configuration
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            {/* Title Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    TASK TITLE *
                                </Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: errors.title ? theme.colors.signalAlert : theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    placeholder="Enter task name"
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
                                    DESCRIPTION
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    placeholder="Add task details and instructions"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={formData.description}
                                    onChangeText={(text) => handleChange('description', text)}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            {/* Points Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    POINT VALUE *
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
                            </View>

                            {/* Assignees */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                        ASSIGN TO *
                                    </Text>
                                    <TouchableOpacity onPress={selectAllMembers}>
                                        <Text style={[styles.selectAllText, { color: theme.colors.actionPrimary }]}>
                                            {selectedAssignees.length === members.length ? 'Deselect All' : 'Select All'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.assigneesGrid}>
                                    {members.map(member => (
                                        <TouchableOpacity
                                            key={member.id || member._id}
                                            style={[
                                                styles.assigneeCard,
                                                selectedAssignees.includes(member.id || member._id)
                                                    ? { backgroundColor: theme.colors.actionPrimary, borderColor: theme.colors.actionPrimary }
                                                    : { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }
                                            ]}
                                            onPress={() => toggleAssignee(member.id || member._id)}
                                        >
                                            <View style={[
                                                styles.assigneeAvatar,
                                                { backgroundColor: selectedAssignees.includes(member.id || member._id) ? '#FFF' : theme.colors.actionPrimary + '20' }
                                            ]}>
                                                <Text style={[
                                                    styles.assigneeInitial,
                                                    { color: selectedAssignees.includes(member.id || member._id) ? theme.colors.actionPrimary : theme.colors.actionPrimary }
                                                ]}>
                                                    {member.firstName.charAt(0)}
                                                </Text>
                                            </View>
                                            <Text style={[
                                                styles.assigneeName,
                                                { color: selectedAssignees.includes(member.id || member._id) ? '#FFFFFF' : theme.colors.textPrimary }
                                            ]}>
                                                {member.firstName}
                                            </Text>
                                            {selectedAssignees.includes(member.id || member._id) && (
                                                <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Advanced Options Toggle */}
                            <TouchableOpacity
                                style={[styles.advancedToggle, { borderColor: theme.colors.borderSubtle }]}
                                onPress={() => setShowAdvanced(!showAdvanced)}
                            >
                                <Text style={[styles.advancedText, { color: theme.colors.textPrimary }]}>
                                    Advanced Options
                                </Text>
                                <Text style={[styles.advancedArrow, { color: theme.colors.textSecondary }]}>
                                    {showAdvanced ? '▼' : '▶'}
                                </Text>
                            </TouchableOpacity>

                            {/* Advanced Options */}
                            {showAdvanced && (
                                <View style={[styles.advancedSection, { backgroundColor: theme.colors.bgCanvas }]}>
                                    <View style={styles.switchRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
                                                Recurring Task
                                            </Text>
                                            <Text style={[styles.switchHint, { color: theme.colors.textSecondary }]}>
                                                Task repeats daily
                                            </Text>
                                        </View>
                                        <Switch
                                            value={isRecurring}
                                            onValueChange={setIsRecurring}
                                            trackColor={{ false: '#D1D5DB', true: theme.colors.actionPrimary }}
                                        />
                                    </View>

                                    <View style={styles.switchRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
                                                Requires Approval
                                            </Text>
                                            <Text style={[styles.switchHint, { color: theme.colors.textSecondary }]}>
                                                Parent must approve completion
                                            </Text>
                                        </View>
                                        <Switch
                                            value={requiresApproval}
                                            onValueChange={setRequiresApproval}
                                            trackColor={{ false: '#D1D5DB', true: theme.colors.actionPrimary }}
                                        />
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer */}
                        <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: theme.colors.borderSubtle }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme.colors.textPrimary }]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary }]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.createButtonText}>
                                        {initialTask ? 'Save' : 'Create'}
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
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
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectAllText: {
        fontSize: 12,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 11,
        marginTop: 4,
        marginLeft: 4,
    },
    assigneesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    assigneeCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 10,
    },
    assigneeAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assigneeInitial: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    assigneeName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    checkIcon: {
        marginLeft: 'auto',
    },
    advancedToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        marginVertical: 12,
    },
    advancedText: {
        fontSize: 14,
        fontWeight: '600',
    },
    advancedArrow: {
        fontSize: 12,
    },
    advancedSection: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    switchHint: {
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        paddingTop: 16,
        borderTopWidth: 1,
        marginTop: 8,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    createButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
