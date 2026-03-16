// src/components/routines/RoutineCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Routine } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Sunrise, Moon } from 'lucide-react-native';

interface RoutineCardProps {
    routine: Routine;
    onPress?: () => void;
}

const getTimeOfDayIcon = (timeOfDay: string, color: string, size: number) => {
    switch (timeOfDay) {
        case 'morning':
            return <Sunrise size={size} color={color} />;
        case 'noon':
            return <Sun size={size} color={color} />;
        case 'night':
            return <Moon size={size} color={color} />;
        default:
            return <Sun size={size} color={color} />;
    }
};

export default function RoutineCard({ routine, onPress }: RoutineCardProps) {
    const { currentTheme: theme } = useTheme();

    const completedCount = routine.items.filter(item => item.isCompleted).length;
    const totalCount = routine.items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const isComplete = completedCount === totalCount && totalCount > 0;

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.bgSurface,
                    borderColor: isComplete ? theme.colors.signalSuccess : theme.colors.borderSubtle,
                    borderWidth: isComplete ? 2 : 1,
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    {getTimeOfDayIcon(routine.timeOfDay, theme.colors.actionPrimary, 24)}
                </View>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        {routine.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        {completedCount} of {totalCount} completed
                    </Text>
                </View>
                {isComplete && (
                    <Text style={styles.checkmark}>✓</Text>
                )}
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.borderSubtle }]}>
                <View
                    style={[
                        styles.progressBarFill,
                        {
                            width: `${progress}%`,
                            backgroundColor: isComplete ? theme.colors.signalSuccess : theme.colors.actionPrimary,
                        }
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        marginRight: 12,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
    },
    checkmark: {
        fontSize: 24,
        color: '#22C55E',
    },
    progressBarContainer: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});
