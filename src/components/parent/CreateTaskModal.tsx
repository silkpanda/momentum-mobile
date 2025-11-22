import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';

interface CreateTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    members: any[];
    initialTask?: any; // Optional task to edit
}

export default function CreateTaskModal({ visible, onClose, onTaskCreated, members, initialTask }: CreateTaskModalProps) {
    const theme = themes.calmLight;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState('10');
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset or populate form when modal opens
    useEffect(() => {
        if (visible) {
            if (initialTask) {
                setTitle(initialTask.title || '');
                setDescription(initialTask.description || '');
                setPoints(String(initialTask.pointsValue || '10'));
                setSelectedAssignees(initialTask.assignedTo || []);
            } else {
                setTitle('');
                setDescription('');
                setPoints('10');
                setSelectedAssignees([]);
            }
            setIsSubmitting(false);
        }
    }, [visible, initialTask]);

    const toggleAssignee = (memberId: string) => {
        if (selectedAssignees.includes(memberId)) {
            setSelectedAssignees(selectedAssignees.filter(id => id !== memberId));
        } else {
            setSelectedAssignees([...selectedAssignees, memberId]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('Please enter a task title');
            return;
        }
        if (selectedAssignees.length === 0) {
            alert('Please select at least one assignee');
            return;
        }

        setIsSubmitting(true);
        try {
            const taskData = {
                title,
                description,
                pointsValue: parseInt(points) || 0,
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
            alert('Failed to save task');
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
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                placeholder="e.g. Clean your room"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

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
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Points Value</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                value={points}
                                onChangeText={setPoints}
                                keyboardType="numeric"
                            />
                        </View>

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
