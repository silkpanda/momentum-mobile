// src/components/streaks/StreakProgress.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrentTier, getNextTier, getDaysToNextTier } from '../../utils/streakCalculator';

interface StreakProgressProps {
    currentStreak: number;
}

export default function StreakProgress({ currentStreak = 0 }: StreakProgressProps) {
    const { currentTheme: theme } = useTheme();
    const currentTier = getCurrentTier(currentStreak);
    const nextTier = getNextTier(currentStreak);
    const daysToNext = getDaysToNextTier(currentStreak);

    if (!nextTier) {
        // At max tier
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={styles.header}>
                    <Text style={[styles.tierLabel, { color: theme.colors.textPrimary }]}>
                        {currentTier.emoji} {currentTier.label}
                    </Text>
                    <Text style={[styles.maxTier, { color: theme.colors.actionPrimary }]}>
                        MAX TIER! 🎉
                    </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.borderSubtle }]}>
                    <View style={[
                        styles.progressFill,
                        {
                            width: '100%',
                            backgroundColor: theme.colors.actionPrimary,
                        }
                    ]} />
                </View>
            </View>
        );
    }

    const progress = currentStreak - currentTier.days;
    const total = nextTier.days - currentTier.days;
    const percentage = (progress / total) * 100;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
            <View style={styles.header}>
                <Text style={[styles.tierLabel, { color: theme.colors.textPrimary }]}>
                    {currentTier.emoji} {currentTier.label}
                </Text>
                <Text style={[styles.nextTier, { color: theme.colors.textSecondary }]}>
                    {daysToNext} {daysToNext === 1 ? 'day' : 'days'} to {nextTier.emoji} {nextTier.label}
                </Text>
            </View>

            <View style={[styles.progressBar, { backgroundColor: theme.colors.borderSubtle }]}>
                <View style={[
                    styles.progressFill,
                    {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: theme.colors.actionPrimary,
                    }
                ]} />
            </View>

            <View style={styles.multiplierInfo}>
                <Text style={[styles.multiplierText, { color: theme.colors.textSecondary }]}>
                    Current: <Text style={{ color: theme.colors.actionPrimary, fontWeight: 'bold' }}>
                        {currentTier.multiplier}x
                    </Text>
                </Text>
                <Text style={[styles.multiplierText, { color: theme.colors.textSecondary }]}>
                    Next: <Text style={{ color: theme.colors.actionPrimary, fontWeight: 'bold' }}>
                        {nextTier.multiplier}x
                    </Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tierLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextTier: {
        fontSize: 12,
        fontWeight: '600',
    },
    maxTier: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    multiplierInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    multiplierText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
