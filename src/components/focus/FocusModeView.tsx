// src/components/focus/FocusModeView.tsx
/**
 * Focus Mode Component
 * 
 * Clean, ADHD-friendly single-task display.
 * High contrast, minimal clutter, one task only.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Target, Bell } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Task } from '../../types';

interface FocusModeViewProps {
    task: Task;
    currentIndex: number;
    totalTasks: number;
    onComplete: () => void;
    onRequestHelp?: () => void;
    onExit?: () => void;
}

export default function FocusModeView({
    task,
    currentIndex,
    totalTasks,
    onComplete,
    onRequestHelp,
    onExit
}: FocusModeViewProps) {
    const { currentTheme: theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.actionPrimary }]}>
            {/* Simple progress */}
            <View style={styles.progressSection}>
                <Text style={styles.progressText}>
                    Task {currentIndex} of {totalTasks}
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${(currentIndex / totalTasks) * 100}%` }
                        ]}
                    />
                </View>
            </View>

            {/* Main task - centered */}
            <View style={styles.taskContainer}>
                <View style={styles.targetIcon}>
                    <Target size={64} color="#FFFFFF" strokeWidth={3} />
                </View>

                <Text style={styles.taskTitle}>
                    {task.title}
                </Text>

                {task.description && (
                    <Text style={styles.taskDescription}>
                        {task.description}
                    </Text>
                )}

                <Text style={styles.points}>
                    {task.value} points
                </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: theme.colors.signalSuccess }]}
                    onPress={onComplete}
                    activeOpacity={0.8}
                >
                    <CheckCircle size={24} color="#FFFFFF" />
                    <Text style={styles.completeButtonText}>
                        Done!
                    </Text>
                </TouchableOpacity>

                {onRequestHelp && (
                    <TouchableOpacity
                        style={styles.helpButton}
                        onPress={onRequestHelp}
                        activeOpacity={0.8}
                    >
                        <Bell size={20} color="#FFFFFF" />
                        <Text style={styles.helpButtonText}>
                            Need help
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressSection: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    progressText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
    },
    taskContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    targetIcon: {
        marginBottom: 32,
    },
    taskTitle: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        color: '#FFFFFF',
        marginBottom: 16,
        lineHeight: 40,
    },
    taskDescription: {
        fontSize: 18,
        textAlign: 'center',
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 24,
        lineHeight: 26,
    },
    points: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    actionsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 48,
        gap: 16,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        borderRadius: 16,
        gap: 12,
    },
    completeButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    helpButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
