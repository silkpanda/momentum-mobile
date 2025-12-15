import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { bentoPalette, borderRadius, spacing, typography, shadows } from '../../../theme/bentoTokens';
import { format } from 'date-fns';

interface EnvironmentColumnProps {
    todaysMeal: { main: string; side: string } | null;
    questProgress: number; // 0-100
    questTitle: string;
}

export default function EnvironmentColumn({ todaysMeal, questProgress, questTitle }: EnvironmentColumnProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* Widget A: The Temporal Anchor (Clock) */}
            <View style={[styles.widget, styles.clockWidget]}>
                <Text style={styles.timeText}>{format(currentTime, 'h:mm')}</Text>
                <Text style={styles.ampmText}>{format(currentTime, 'a')}</Text>
                <Text style={styles.dateText}>{format(currentTime, 'EEEE, MMMM do')}</Text>
            </View>

            {/* Widget B: Fuel (Meal Plan) */}
            <View style={[styles.widget, styles.mealWidget]}>
                <View style={styles.headerRow}>
                    <Text style={styles.widgetLabel}>FUEL</Text>
                </View>
                <View style={styles.mealContent}>
                    <Text style={styles.mealTitle} numberOfLines={2}>
                        {todaysMeal?.main || 'No Meal Planned'}
                    </Text>
                    <Text style={styles.mealSide} numberOfLines={1}>
                        {todaysMeal?.side || 'Tap to plan'}
                    </Text>
                </View>
            </View>

            {/* Widget C: Family Quest */}
            <View style={[styles.widget, styles.questWidget]}>
                <Text style={styles.widgetLabel}>FAMILY QUEST</Text>
                <Text style={styles.questTitle} numberOfLines={1}>{questTitle}</Text>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${Math.min(100, Math.max(0, questProgress))}%` }]} />
                </View>
                <Text style={styles.progressText}>{questProgress}% Complete</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacing.lg,
    },
    widget: {
        backgroundColor: bentoPalette.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.soft,
        overflow: 'hidden',
    },
    clockWidget: {
        backgroundColor: bentoPalette.brandPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
    },
    timeText: {
        ...typography.bigNumber,
        fontSize: 64,
        lineHeight: 64,
        color: '#FFFFFF',
    },
    ampmText: {
        ...typography.bigNumber,
        fontSize: 24,
        lineHeight: 32,
        color: 'rgba(255,255,255,0.8)',
    },
    dateText: {
        ...typography.body,
        color: 'rgba(255,255,255,0.9)',
        marginTop: spacing.xs,
        fontSize: 16,
    },
    mealWidget: {
        backgroundColor: bentoPalette.alert, // Amber/Orange
        minHeight: 140,
    },
    questWidget: {
        backgroundColor: bentoPalette.surface,
        flex: 1, // fill remaining space? or fixed? Spec says 25% width column, height depends on content.
        minHeight: 120,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    widgetLabel: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
    },
    mealContent: {
        flex: 1,
        justifyContent: 'center',
    },
    mealTitle: {
        ...typography.heroGreeting, // Reuse bold font
        color: '#FFFFFF',
        fontSize: 24,
        lineHeight: 28,
        marginBottom: spacing.xs,
    },
    mealSide: {
        ...typography.body,
        color: 'rgba(255,255,255,0.9)',
    },
    questTitle: {
        ...typography.widgetTitle,
        color: bentoPalette.textPrimary,
        marginBottom: spacing.md,
    },
    progressContainer: {
        height: 12,
        backgroundColor: bentoPalette.canvas,
        borderRadius: 6,
        marginBottom: spacing.xs,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: bentoPalette.brandPrimary,
        borderRadius: 6,
    },
    progressText: {
        ...typography.caption,
        color: bentoPalette.textSecondary,
        textAlign: 'right',
    },
});

