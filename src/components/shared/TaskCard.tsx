import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import { themes } from '../../theme/colors';

interface TaskCardProps {
    task: any;
    onPress?: () => void;
    onComplete?: () => void;
}

export default function TaskCard({ task, onPress, onComplete }: TaskCardProps) {
    const theme = themes.calmLight;
    const isCompleted = task.status === 'COMPLETED';

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <TouchableOpacity onPress={onComplete} style={styles.checkContainer}>
                {isCompleted ? (
                    <CheckCircle size={24} color={theme.colors.signalSuccess} />
                ) : (
                    <Circle size={24} color={theme.colors.borderSubtle} />
                )}
            </TouchableOpacity>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        { color: theme.colors.textPrimary },
                        isCompleted && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }
                    ]}
                >
                    {task.title}
                </Text>
                {task.value && (
                    <Text style={[styles.points, { color: theme.colors.actionPrimary }]}>
                        +{task.value} pts
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    checkContainer: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    points: {
        fontSize: 14,
        fontWeight: '600',
    },
});
