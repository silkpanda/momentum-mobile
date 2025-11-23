// src/components/focus/FocusModeView.tsx
/**
 * Focus Mode Component
 * 
 * ADHD-friendly single-task display that prevents overwhelm.
 * Shows only ONE task at a time with large, clear UI.
 * 
 * Features:
 * - ULTRA PROMINENT visual design with gradient background
 * - Large task display
 * - No distractions (hides task list)
 * - Clear action buttons
 * - Progress indicator
 * - Animated focus indicator
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { CheckCircle, Target, Bell, Zap } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { textStyles } from '../../theme/typography';
import { Task } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

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

    // Pulsing animation for focus indicator
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Ultra-prominent Focus Mode Banner */}
            <LinearGradient
                colors={[theme.colors.actionPrimary, theme.colors.actionPrimary + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.focusBanner}
            >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Target size={32} color="#FFFFFF" />
                </Animated.View>
                <View style={styles.bannerTextContainer}>
                    <Text style={styles.focusBannerTitle}>🎯 FOCUS MODE ACTIVE</Text>
                    <Text style={styles.focusBannerSubtitle}>
                        Complete this task to unlock everything else
                    </Text>
                </View>
            </LinearGradient>

            {/* Progress Indicator */}
            <View style={styles.progressSection}>
                <Text style={[textStyles.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    Task {currentIndex} of {totalTasks}
                </Text>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.borderSubtle }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: theme.colors.actionPrimary,
                                width: `${(currentIndex / totalTasks) * 100}%`
                            }
                        ]}
                    />
                </View>
            </View>

            {/* Main Task Card - HUGE and centered */}
            <View style={styles.taskCardContainer}>
                <View style={[styles.taskCard, {
                    backgroundColor: theme.colors.bgSurface,
                    borderColor: theme.colors.actionPrimary,
                    borderWidth: 3
                }]}>
                    {/* Zap Icon for Energy */}
                    <View style={[styles.zapBadge, { backgroundColor: theme.colors.actionPrimary }]}>
                        <Zap size={28} color="#FFFFFF" fill="#FFFFFF" />
                    </View>

                    {/* Task Title - MASSIVE */}
                    <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                        {task.title}
                    </Text>

                    {/* Task Description */}
                    {task.description && (
                        <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                            {task.description}
                        </Text>
                    )}

                    {/* Points Badge - HUGE */}
                    <View style={[styles.pointsBadge, { backgroundColor: theme.colors.actionPrimary }]}>
                        <Text style={styles.pointsValue}>
                            +{task.value}
                        </Text>
                        <Text style={styles.pointsLabel}>
                            POINTS
                        </Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons - MASSIVE */}
            <View style={styles.actionsContainer}>
                {/* Complete Button - GIANT */}
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.colors.signalSuccess }]}
                    onPress={onComplete}
                    activeOpacity={0.8}
                >
                    <CheckCircle size={32} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>
                        I FINISHED THIS!
                    </Text>
                </TouchableOpacity>

                {/* Ask for Help Button */}
                {onRequestHelp && (
                    <TouchableOpacity
                        style={[styles.secondaryButton, {
                            borderColor: theme.colors.textSecondary,
                            backgroundColor: theme.colors.bgSurface
                        }]}
                        onPress={onRequestHelp}
                        activeOpacity={0.8}
                    >
                        <Bell size={24} color={theme.colors.textSecondary} />
                        <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                            I Need Help
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Motivational Message */}
            <View style={styles.motivationSection}>
                <Text style={[styles.motivationText, { color: theme.colors.textTertiary }]}>
                    💪 You can do this! One step at a time.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    focusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    bannerTextContainer: {
        flex: 1,
    },
    focusBannerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    focusBannerSubtitle: {
        fontSize: 13,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 2,
    },
    progressSection: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    progressBar: {
        height: 12,
        borderRadius: 6,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    taskCardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    taskCard: {
        width: '100%',
        maxWidth: 600,
        padding: 40,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        alignItems: 'center',
    },
    zapBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    taskTitle: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 40,
    },
    taskDescription: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 26,
    },
    pointsBadge: {
        paddingHorizontal: 48,
        paddingVertical: 24,
        borderRadius: 24,
        alignItems: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    pointsValue: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    pointsLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    actionsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 16,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        borderRadius: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        borderWidth: 2,
        gap: 12,
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
    },
    motivationSection: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        alignItems: 'center',
    },
    motivationText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
});
