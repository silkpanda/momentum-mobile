// =========================================================
// Bento Create Task Modal - Quick & Compact Task Creation
// =========================================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Check, Zap } from 'lucide-react-native';
import { api } from '../../../../services/api';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
    validateForm,
    getInitialFormData,
    sanitizeFormData,
    type FormField,
    type FormData
} from 'momentum-shared';

interface BentoCreateTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    members: any[];
    initialTask?: any;
}

const TASK_FORM_FIELDS: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, min: 3 },
    { name: 'pointsValue', label: 'Points', type: 'number', required: true, min: 1, defaultValue: 10 },
];

export default function BentoCreateTaskModal({ visible, onClose, onTaskCreated, members, initialTask }: BentoCreateTaskModalProps) {
    const { currentTheme: theme } = useTheme();

    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Quick point presets
    const QUICK_POINTS = [5, 10, 15, 20, 25, 50];

    useEffect(() => {
        if (visible) {
            if (initialTask) {
                setFormData({
                    title: initialTask.title || '',
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
                                    <Zap size={20} color={theme.colors.actionPrimary} />
                                </View>
                                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                    {initialTask ? 'Edit Task' : 'Quick Task'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            {/* Title Input - Prominent */}
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.titleInput, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        borderColor: errors.title ? theme.colors.signalAlert : theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary
                                    }]}
                                    placeholder="What needs to be done?"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={formData.title}
                                    onChangeText={(text) => handleChange('title', text)}
                                    autoFocus
                                />
                                {errors.title && (
                                    <Text style={[styles.errorText, { color: theme.colors.signalAlert }]}>{errors.title}</Text>
                                )}
                            </View>

                            {/* Quick Points Selector */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Points</Text>
                                <View style={styles.quickPointsContainer}>
                                    {QUICK_POINTS.map(points => (
                                        <TouchableOpacity
                                            key={points}
                                            style={[
                                                styles.quickPointChip,
                                                formData.pointsValue === points
                                                    ? { backgroundColor: theme.colors.actionPrimary, borderColor: theme.colors.actionPrimary }
                                                    : { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }
                                            ]}
                                            onPress={() => handleChange('pointsValue', points)}
                                        >
                                            <Text style={[
                                                styles.quickPointText,
                                                formData.pointsValue === points
                                                    ? { color: '#FFFFFF' }
                                                    : { color: theme.colors.textPrimary }
                                            ]}>
                                                {points}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Assignees - Compact */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Assign To</Text>
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
                                                <Check size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer - Single Action */}
                        <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary }]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Zap size={18} color="#FFFFFF" />
                                        <Text style={styles.createButtonText}>
                                            {initialTask ? 'Save' : 'Create Task'}
                                        </Text>
                                    </>
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
        height: '65%',
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    titleInput: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 18,
        fontSize: 18,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    quickPointsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    quickPointChip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1.5,
        minWidth: 60,
        alignItems: 'center',
    },
    quickPointText: {
        fontSize: 16,
        fontWeight: '700',
    },
    assigneesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    assigneeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    assigneeName: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        paddingTop: 16,
        borderTopWidth: 1,
        marginTop: 8,
    },
    createButton: {
        flexDirection: 'row',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
