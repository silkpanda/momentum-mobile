import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Target } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { textStyles } from '../../theme/typography';
import { Task } from '../../types';

interface TaskSelectionModalProps {
    visible: boolean;
    memberName: string;
    tasks: Task[];
    onSelect: (taskId: string) => void;
    onClose: () => void;
}

export default function TaskSelectionModal({
    visible,
    memberName,
    tasks,
    onSelect,
    onClose
}: TaskSelectionModalProps) {
    const { currentTheme: theme } = useTheme();
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const handleConfirm = () => {
        if (selectedTaskId) {
            onSelect(selectedTaskId);
            setSelectedTaskId(null);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, { backgroundColor: theme.colors.bgSurface }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <View style={styles.headerLeft}>
                            <Target size={24} color={theme.colors.actionPrimary} />
                            <Text style={[textStyles.h2, { color: theme.colors.textPrimary }]}>
                                Set Focus Task
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Subtitle */}
                    <Text style={[textStyles.body, { color: theme.colors.textSecondary, padding: 16 }]}>
                        Select which task {memberName} should focus on
                    </Text>

                    {/* Task List */}
                    <ScrollView style={styles.taskList}>
                        {tasks.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                                    No tasks available for {memberName}
                                </Text>
                            </View>
                        ) : (
                            tasks.map((task) => (
                                <TouchableOpacity
                                    key={task._id || task.id}
                                    style={[
                                        styles.taskItem,
                                        { borderColor: theme.colors.borderSubtle },
                                        selectedTaskId === (task._id || task.id) && {
                                            borderColor: theme.colors.actionPrimary,
                                            backgroundColor: theme.colors.actionPrimary + '10'
                                        }
                                    ]}
                                    onPress={() => setSelectedTaskId(task._id || task.id)}
                                >
                                    <View style={[
                                        styles.radio,
                                        { borderColor: selectedTaskId === (task._id || task.id) ? theme.colors.actionPrimary : '#D1D5DB' }
                                    ]}>
                                        {selectedTaskId === (task._id || task.id) && (
                                            <View style={[styles.radioInner, { backgroundColor: theme.colors.actionPrimary }]} />
                                        )}
                                    </View>
                                    <View style={styles.taskInfo}>
                                        <Text style={[textStyles.label, { color: theme.colors.textPrimary }]}>
                                            {task.title}
                                        </Text>
                                        {task.description && (
                                            <Text style={[textStyles.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                                                {task.description}
                                            </Text>
                                        )}
                                        <Text style={[textStyles.caption, { color: theme.colors.actionPrimary, marginTop: 4 }]}>
                                            +{task.value} pts
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: theme.colors.borderSubtle }]}
                            onPress={onClose}
                        >
                            <Text style={[textStyles.button, { color: theme.colors.textSecondary }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: theme.colors.actionPrimary },
                                !selectedTaskId && { opacity: 0.5 }
                            ]}
                            onPress={handleConfirm}
                            disabled={!selectedTaskId}
                        >
                            <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                                Set Focus
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    taskList: {
        maxHeight: 400,
        padding: 16,
    },
    emptyState: {
        padding: 32,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 12,
        gap: 12,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    taskInfo: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 2,
    },
    confirmButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
});
