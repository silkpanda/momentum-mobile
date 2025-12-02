// =========================================================
// BriefingStoreModal - Store Management for Morning Briefing
// =========================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { ShoppingBag, Plus, DollarSign } from 'lucide-react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import BriefingBaseModal from './BriefingBaseModal';

interface BriefingStoreModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function BriefingStoreModal({ visible, onClose }: BriefingStoreModalProps) {
    const { currentTheme: theme } = useTheme();
    const { storeItems } = useData();

    const renderStoreItem = ({ item }: { item: typeof storeItems[0] }) => (
        <View style={[styles.itemRow, { borderBottomColor: theme.colors.borderSubtle }]}>
            {/* Icon/Image Placeholder */}
            <View style={[styles.iconBox, { backgroundColor: theme.colors.bgSurface }]}>
                <ShoppingBag size={20} color={theme.colors.textSecondary} />
            </View>

            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>{item.itemName}</Text>
                <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {item.description || 'No description'}
                </Text>
            </View>

            <View style={styles.itemMeta}>
                <View style={[styles.costBadge, { backgroundColor: theme.colors.bgCanvas }]}>
                    <Text style={[styles.costText, { color: theme.colors.textPrimary }]}>
                        {item.cost}
                    </Text>
                    <DollarSign size={10} color={theme.colors.textPrimary} />
                </View>
                <Text style={[styles.stockText, { color: theme.colors.textTertiary }]}>
                    {item.isInfinite ? '∞' : `${item.stock} left`}
                </Text>
            </View>
        </View>
    );

    return (
        <BriefingBaseModal
            visible={visible}
            onClose={onClose}
            title="The Bank & Store"
            scrollable={false}
            headerRight={
                <TouchableOpacity>
                    <Plus size={24} color={theme.colors.actionPrimary} />
                </TouchableOpacity>
            }
        >
            <View style={styles.container}>
                {storeItems.length > 0 ? (
                    <FlatList
                        data={storeItems}
                        renderItem={renderStoreItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <ShoppingBag size={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            Store is empty.
                        </Text>
                    </View>
                )}
            </View>
        </BriefingBaseModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'System',
    },
    itemDesc: {
        fontSize: 13,
        marginTop: 2,
    },
    itemMeta: {
        alignItems: 'flex-end',
        gap: 4,
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 2,
    },
    costText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    stockText: {
        fontSize: 11,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});
