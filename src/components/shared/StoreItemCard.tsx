import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ShoppingBag, Star } from 'lucide-react-native';
import { themes } from '../../theme/colors';
import { StoreItem } from '../../types';

interface StoreItemCardProps {
    item: StoreItem;
    userPoints: number;
    onPurchase: () => void;
}

export default function StoreItemCard({ item, userPoints, onPurchase }: StoreItemCardProps) {
    const theme = themes.calmLight;
    const canAfford = userPoints >= item.cost;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
            <View style={[styles.imageContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                {/* Placeholder for item image */}
                <ShoppingBag size={32} color={theme.colors.textSecondary} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                    {item.itemName}
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        <Star size={16} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                        <Text style={[styles.priceText, { color: theme.colors.actionPrimary }]}>
                            {item.cost}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: canAfford ? theme.colors.actionPrimary : theme.colors.bgCanvas },
                            !canAfford && { borderWidth: 1, borderColor: theme.colors.borderSubtle }
                        ]}
                        onPress={onPurchase}
                        disabled={!canAfford}
                    >
                        <Text style={[
                            styles.buttonText,
                            { color: canAfford ? '#FFFFFF' : theme.colors.textSecondary }
                        ]}>
                            {canAfford ? 'Redeem' : 'Need Points'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
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
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        marginLeft: 4,
        fontWeight: 'bold',
        fontSize: 16,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 12,
    },
});
