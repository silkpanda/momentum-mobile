import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { WishlistItem } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Star, ShoppingCart, Edit2, Trash2, AlertCircle } from 'lucide-react-native';
import { api } from '../../services/api';
import { logger } from '../../utils/logger';

interface WishlistDetailModalProps {
    visible: boolean;
    onClose: () => void;
    item: WishlistItem;
    currentPoints: number;
    onSuccess: () => void;
    onEdit?: () => void;
    isParent: boolean;
}

export default function WishlistDetailModal({
    visible,
    onClose,
    item,
    currentPoints,
    onSuccess,
    onEdit,
    isParent
}: WishlistDetailModalProps) {
    const { currentTheme: theme } = useTheme();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const getPriorityLabel = () => {
        return item.priority.charAt(0).toUpperCase() + item.priority.slice(1);
    };

    const handlePurchase = async () => {
        if (!canAfford) {
            Alert.alert('Not Enough Points', `You need ${pointsNeeded} more points to purchase this item.`);
            return;
        }

        Alert.alert(
            'Purchase Item',
            `Are you sure you want to purchase "${item.title}" for ${item.pointsCost} points?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Purchase',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsPurchasing(true);
                            await api.purchaseWishlistItem(item.id || item._id || '');
                            Alert.alert('Success!', `You purchased "${item.title}"! 🎉`);
                            onSuccess();
                            onClose();
                        } catch (error) {
                            logger.error('Failed to purchase wishlist item', error);
                            Alert.alert('Error', 'Failed to purchase item. Please try again.');
                        } finally {
                            setIsPurchasing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to remove "${item.title}" from the wishlist?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            await api.deleteWishlistItem(item.id || item._id || '');
                            Alert.alert('Deleted', 'Item removed from wishlist');
                            onSuccess();
                            onClose();
                        } catch (error) {
                            logger.error('Failed to delete wishlist item', error);
                            Alert.alert('Error', 'Failed to delete item. Please try again.');
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle, backgroundColor: theme.colors.bgSurface }]}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Wishlist Item</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Title */}
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        {item.title}
                    </Text>

                    {/* Priority Badge */}
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
                            {getPriorityLabel()} Priority
                        </Text>
                    </View>

                    {/* Description */}
                    {item.description && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Description</Text>
                            <Text style={[styles.description, { color: theme.colors.textPrimary }]}>
                                {item.description}
                            </Text>
                        </View>
                    )}

                    {/* Points Cost */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Cost</Text>
                        <View style={styles.pointsRow}>
                            <Star size={24} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                            <Text style={[styles.pointsCost, { color: theme.colors.textPrimary }]}>
                                {item.pointsCost} points
                            </Text>
                        </View>
                    </View>

                    {/* Progress */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Progress</Text>

                        <View style={styles.progressStats}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Current Points</Text>
                                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{currentPoints}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points Needed</Text>
                                <Text style={[styles.statValue, { color: canAfford ? theme.colors.signalSuccess : theme.colors.textPrimary }]}>
                                    {canAfford ? '0' : pointsNeeded}
                                </Text>
                            </View>
                        </View>

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

                        {canAfford && (
                            <View style={[styles.affordableBox, { backgroundColor: theme.colors.signalSuccess + '10', borderColor: theme.colors.signalSuccess + '30' }]}>
                                <AlertCircle size={16} color={theme.colors.signalSuccess} />
                                <Text style={[styles.affordableText, { color: theme.colors.signalSuccess }]}>
                                    You have enough points to purchase this item!
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Footer Actions */}
                <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle, backgroundColor: theme.colors.bgSurface }]}>
                    {/* Parent Actions */}
                    {isParent && (
                        <View style={styles.parentActions}>
                            {onEdit && (
                                <TouchableOpacity
                                    style={[styles.secondaryButton, { borderColor: theme.colors.borderSubtle }]}
                                    onPress={onEdit}
                                >
                                    <Edit2 size={18} color={theme.colors.textPrimary} />
                                    <Text style={[styles.secondaryButtonText, { color: theme.colors.textPrimary }]}>Edit</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.secondaryButton, { borderColor: theme.colors.signalAlert }]}
                                onPress={handleDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 size={18} color={theme.colors.signalAlert} />
                                <Text style={[styles.secondaryButtonText, { color: theme.colors.signalAlert }]}>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Purchase Button (for family members) */}
                    {!isParent && (
                        <TouchableOpacity
                            style={[
                                styles.purchaseButton,
                                {
                                    backgroundColor: canAfford ? theme.colors.signalSuccess : theme.colors.borderSubtle,
                                    opacity: isPurchasing ? 0.7 : 1
                                }
                            ]}
                            onPress={handlePurchase}
                            disabled={!canAfford || isPurchasing}
                        >
                            <ShoppingCart size={20} color="#FFFFFF" />
                            <Text style={styles.purchaseButtonText}>
                                {isPurchasing ? 'Purchasing...' : canAfford ? 'Purchase Now' : 'Not Enough Points'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    priorityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 24,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pointsCost: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
    },
    affordableBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        alignItems: 'flex-start',
        marginTop: 16,
    },
    affordableText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        paddingBottom: 40,
    },
    parentActions: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1.5,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    purchaseButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    purchaseButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
