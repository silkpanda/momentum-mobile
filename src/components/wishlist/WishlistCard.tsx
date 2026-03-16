import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WishlistItem } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Star, ChevronRight } from 'lucide-react-native';

interface WishlistCardProps {
    item: WishlistItem;
    currentPoints: number;
    onPress: () => void;
}

export default function WishlistCard({ item, currentPoints, onPress }: WishlistCardProps) {
    const { currentTheme: theme } = useTheme();

    const progress = Math.min(100, Math.round((currentPoints / item.pointsCost) * 100));
    const canAfford = currentPoints >= item.pointsCost;
    const pointsNeeded = Math.max(0, item.pointsCost - currentPoints);

    const getPriorityColor = () => {
        switch (item.priority) {
            case 'high': return theme.colors.signalAlert;
            case 'medium': return theme.colors.signalWarning;
            case 'low': return theme.colors.textTertiary;
            default: return theme.colors.textSecondary;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {/* Priority Indicator */}
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />

                {/* Main Content */}
                <View style={styles.info}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {item.title}
                    </Text>

                    {item.description && (
                        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}

                    {/* Progress Info */}
                    <View style={styles.progressInfo}>
                        <View style={styles.pointsRow}>
                            <Star size={14} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                            <Text style={[styles.pointsText, { color: theme.colors.textPrimary }]}>
                                {item.pointsCost} points
                            </Text>
                        </View>

                        {!canAfford && (
                            <Text style={[styles.neededText, { color: theme.colors.textTertiary }]}>
                                {pointsNeeded} more needed
                            </Text>
                        )}

                        {canAfford && (
                            <View style={[styles.affordableBadge, { backgroundColor: theme.colors.signalSuccess + '20' }]}>
                                <Text style={[styles.affordableText, { color: theme.colors.signalSuccess }]}>
                                    Can afford!
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Progress Bar */}
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.borderSubtle }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${progress}%`,
                                    backgroundColor: canAfford ? theme.colors.signalSuccess : theme.colors.actionPrimary
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                        {progress}% saved
                    </Text>
                </View>

                {/* Chevron */}
                <ChevronRight size={20} color={theme.colors.textTertiary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    progressInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '600',
    },
    neededText: {
        fontSize: 12,
    },
    affordableBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    affordableText: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBarContainer: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        marginTop: 2,
    },
});
