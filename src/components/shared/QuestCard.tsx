import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Map, Trophy } from 'lucide-react-native';
import { themes } from '../../theme/colors';

interface QuestCardProps {
    quest: any;
    onPress?: () => void;
    onClaim?: () => void;
    onComplete?: () => void;
}

export default function QuestCard({ quest, onPress, onClaim, onComplete }: QuestCardProps) {
    const theme = themes.calmLight;
    const isCompleted = quest.status === 'COMPLETED';
    const isActive = quest.status === 'ACTIVE';

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                <Map size={24} color={theme.colors.actionPrimary} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                    {quest.title}
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {quest.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.rewardContainer}>
                        <Trophy size={16} color={theme.colors.actionPrimary} />
                        <Text style={[styles.rewardText, { color: theme.colors.actionPrimary }]}>
                            {quest.pointsValue || quest.rewardValue} pts
                        </Text>
                    </View>

                    {onClaim && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={onClaim}
                        >
                            <Text style={styles.actionButtonText}>Start Quest</Text>
                        </TouchableOpacity>
                    )}

                    {onComplete && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.signalSuccess }]}
                            onPress={onComplete}
                        >
                            <Text style={styles.actionButtonText}>Complete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rewardText: {
        marginLeft: 4,
        fontWeight: '600',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },
});
