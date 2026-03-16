// src/components/streaks/StreakBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrentTier } from '../../utils/streakCalculator';

interface StreakBadgeProps {
    streak: number;
    size?: 'small' | 'medium' | 'large';
}

export default function StreakBadge({ streak = 0, size = 'medium' }: StreakBadgeProps) {
    const { currentTheme: theme } = useTheme();
    const tier = getCurrentTier(streak);

    const sizeStyles = {
        small: { container: 60, emoji: 20, number: 18, label: 10 },
        medium: { container: 80, emoji: 28, number: 24, label: 12 },
        large: { container: 100, emoji: 36, number: 32, label: 14 },
    };

    const sizes = sizeStyles[size];

    if (streak === 0) {
        return (
            <View style={[
                styles.container,
                {
                    width: sizes.container,
                    height: sizes.container,
                    backgroundColor: theme.colors.bgSurface,
                    borderColor: theme.colors.borderSubtle,
                }
            ]}>
                <Text style={[styles.emoji, { fontSize: sizes.emoji }]}>🌱</Text>
                <Text style={[styles.number, { fontSize: sizes.number, color: theme.colors.textSecondary }]}>
                    0
                </Text>
                <Text style={[styles.label, { fontSize: sizes.label, color: theme.colors.textTertiary }]}>
                    Start
                </Text>
            </View>
        );
    }

    return (
        <View style={[
            styles.container,
            {
                width: sizes.container,
                height: sizes.container,
                backgroundColor: theme.colors.actionPrimary + '15',
                borderColor: theme.colors.actionPrimary,
            }
        ]}>
            <Text style={[styles.emoji, { fontSize: sizes.emoji }]}>{tier.emoji}</Text>
            <Text style={[styles.number, { fontSize: sizes.number, color: theme.colors.actionPrimary }]}>
                {streak}
            </Text>
            <Text style={[styles.label, { fontSize: sizes.label, color: theme.colors.textSecondary }]}>
                {streak === 1 ? 'day' : 'days'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    emoji: {
        marginBottom: 4,
    },
    number: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    label: {
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
