// src/components/focus/FocusModeView.tsx
/**
 * Focus Mode Component
 * 
 * ADHD-friendly single-task display that prevents overwhelm.
 * Shows only ONE task at a time with large, clear UI.
 * 
 * Features:
 * - Large task display
 * - No distractions (hides task list)
 * - Clear action buttons
 * - Progress indicator
 * - Easy exit
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CheckCircle, XCircle, Target, Bell } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { textStyles } from '../../theme/typography';
import { Task } from '../../types';

const { width, height } = Dimensions.get('window');

interface FocusModeViewProps {
    task: Task;
    currentIndex: number;
    totalTasks: number;
    onComplete: () => void;
    onRequestHelp?: () => void;  // Optional: Child can request parent help
    onExit?: () => void;          // Optional: Only shown if parent allows child to exit
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
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.bgSurface, borderBottomColor: theme.colors.borderSubtle }]}>
                <View style={styles.headerLeft}>
                    <Target size={24} color={theme.colors.actionPrimary} />
                    <Text style={[textStyles.h2, { color: theme.colors.textPrimary }]}>
                        Focus Mode
                    </Text>
                </View>
                <TouchableOpacity onPress={onExit} style={styles.exitButton}>
                    <XCircle size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressSection}>
                <Text style={[textStyles.caption, { color: theme.colors.textSecondary }]}>
                    Task {currentIndex + 1} of {totalTasks}
                </Text>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.borderSubtle }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: theme.colors.actionPrimary,
                                width: `${((currentIndex + 1) / totalTasks) * 100}%`
                            }
                        ]}
                    />
                </View>
            </View>

            {/* Main Task Card */}
            <View style={styles.taskCardContainer}>
                <View style={[styles.taskCard, { backgroundColor: theme.colors.bgSurface }]}>
                    {/* Task Title */}
                    <Text style={[textStyles.displayMedium, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 24 }]}>
                        {task.title}
                    </Text>

                    {/* Task Description */}
                    {task.description && (
                        <Text style={[textStyles.bodyLarge, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            {task.description}
                        </Text>
                    )}

                    {/* Points Badge */}
                    <View style={[styles.pointsBadge, { backgroundColor: theme.colors.actionPrimary + '20' }]}>
                        <Text style={[textStyles.h1, { color: theme.colors.actionPrimary }]}>
                            +{task.value}
                        </Text>
                        <Text style={[textStyles.label, { color: theme.colors.actionPrimary }]}>
                            points
                        </Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                {/* Complete Button */}
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.colors.signalSuccess }]}
                    onPress={onComplete}
                >
                    <CheckCircle size={24} color="#FFFFFF" />
                    <Text style={[textStyles.button, { color: '#FFFFFF', fontSize: 18 }]}>
                        Mark Complete
                    </Text>
                </TouchableOpacity>

                {/* Ask for Help Button */}
                {onRequestHelp && (
                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: theme.colors.borderSubtle }]}
                        onPress={onRequestHelp}
                    >
                        <Bell size={20} color={theme.colors.textSecondary} />
                        <Text style={[textStyles.label, { color: theme.colors.textSecondary }]}>
                            Ask Parent for Help
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Motivational Message */}
            <View style={styles.motivationSection}>
                <Text style={[textStyles.body, { color: theme.colors.textTertiary, textAlign: 'center' }]}>
                    🎯 One task at a time. You've got this!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    exitButton: {
        padding: 4,
    },
    progressSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    taskCardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    taskCard: {
        width: '100%',
        maxWidth: 500,
        padding: 32,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    pointsBadge: {
        alignSelf: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 4,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
    },
    motivationSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
});
