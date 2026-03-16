import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Map, Star, CheckCircle, Clock, Compass } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
    getQuestCardState,
    formatQuestPoints,
    type QuestCardProps
} from 'momentum-shared';

export default function QuestCard({ quest, onPress, onClaim, onComplete, showActions = true }: QuestCardProps) {
    const { currentTheme: theme } = useTheme();
    const {
        isAvailable,
        isActive,
        isCompleted,
        isPendingApproval,
        statusColor,
        statusLabel,
        actionLabel
    } = getQuestCardState(quest);

    const renderIcon = () => {
        if (isCompleted) return <CheckCircle size={24} color={statusColor} />;
        if (isActive) return <Compass size={24} color={statusColor} />;
        if (isPendingApproval) return <Clock size={24} color={statusColor} />;
        return <Map size={24} color={statusColor} />;
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                {renderIcon()}
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
                        <Star size={16} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                        <Text style={[styles.rewardText, { color: theme.colors.actionPrimary }]}>
                            {formatQuestPoints(quest.pointsValue || quest.rewardValue || 0)}
                        </Text>
                    </View>

                    {showActions && (
                        <>
                            {isAvailable && onClaim && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.colors.actionPrimary }]}
                                    onPress={onClaim}
                                >
                                    <Text style={styles.actionButtonText}>{actionLabel || 'Start Quest'}</Text>
                                </TouchableOpacity>
                            )}

                            {isActive && onComplete && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.colors.signalSuccess }]}
                                    onPress={onComplete}
                                >
                                    <Text style={styles.actionButtonText}>{actionLabel || 'Complete'}</Text>
                                </TouchableOpacity>
                            )}

                            {isPendingApproval && (
                                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                                </View>
                            )}
                        </>
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
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    }
});
