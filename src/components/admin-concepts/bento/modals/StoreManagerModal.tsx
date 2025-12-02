// =========================================================
// StoreManagerModal - Manage Store Items and Inventory
// =========================================================
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Search, X, Plus, Edit2, Trash2, Package, DollarSign, Filter } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { api } from '../../../../services/api';
import { StoreItem } from '../../../../types';
import EditStoreItemModal from './EditStoreItemModal';

interface StoreManagerModalProps {
    visible: boolean;
    onClose: () => void;
}

type FilterType = 'all' | 'in_stock' | 'out_of_stock';

const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'in_stock', label: 'In Stock' },
    { id: 'out_of_stock', label: 'Out of Stock' },
];

export default function StoreManagerModal({ visible, onClose }: StoreManagerModalProps) {
    const { currentTheme: theme } = useTheme();
    const { storeItems, refresh, isRefreshing } = useData();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Filter and search items
    const filteredItems = useMemo(() => {
        return storeItems
            .filter((item) => {
                // Apply status filter
                if (activeFilter === 'in_stock') return item.isInfinite || (item.stock || 0) > 0;
                if (activeFilter === 'out_of_stock') return !item.isInfinite && (item.stock || 0) <= 0;
                return true;
            })
            .filter((item) => {
                // Apply search
                if (!searchQuery) return true;
                return item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => a.itemName.localeCompare(b.itemName));
    }, [storeItems, activeFilter, searchQuery]);

    // Handle delete
    const handleDeleteItem = (item: StoreItem) => {
        Alert.alert('Delete Item', `Are you sure you want to delete "${item.itemName}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteStoreItem(item._id || item.id);
                        await refresh();
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete item');
                    }
                },
            },
        ]);
    };

    // Render item card
    const renderItem = ({ item }: { item: StoreItem }) => {
        const isOutOfStock = !item.isInfinite && (item.stock || 0) <= 0;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.colors.bgSurface,
                        borderColor: theme.colors.borderSubtle,
                        opacity: isOutOfStock ? 0.7 : 1,
                    },
                ]}
                onPress={() => {
                    setEditingItem(item);
                    setShowEditModal(true);
                }}
            >
                {/* Image Placeholder or Image */}
                <View style={[styles.imageContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <Package size={32} color={theme.colors.textSecondary} />
                    )}
                    {isOutOfStock && (
                        <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>Out of Stock</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <Text style={[styles.itemName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {item.itemName}
                    </Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.costBadge}>
                            <DollarSign size={12} color={theme.colors.actionPrimary} />
                            <Text style={[styles.costText, { color: theme.colors.actionPrimary }]}>
                                {item.cost}
                            </Text>
                        </View>

                        <Text style={[styles.stockText, { color: theme.colors.textSecondary }]}>
                            {item.isInfinite ? '∞' : `${item.stock} left`}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title="Store Manager"
            scrollable={false}
            headerRight={
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={() => {
                        setEditingItem(null);
                        setShowEditModal(true);
                    }}
                >
                    <Plus size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Item</Text>
                </TouchableOpacity>
            }
        >
            <View style={styles.container}>
                {/* Search and Filter Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }]}>
                        <Search size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                            placeholder="Search items..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={16} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: activeFilter === filter.id ? theme.colors.actionPrimary : theme.colors.bgCanvas,
                                        borderColor: activeFilter === filter.id ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                    },
                                ]}
                                onPress={() => setActiveFilter(filter.id)}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        { color: activeFilter === filter.id ? '#FFF' : theme.colors.textSecondary },
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Items Grid */}
                {isRefreshing && storeItems.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredItems}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id || item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Package size={48} color={theme.colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    {searchQuery ? 'No items found' : 'No store items yet'}
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                                    Tap "Add Item" to create your first reward
                                </Text>
                            </View>
                        }
                    />
                )}

                {/* Edit Modal */}
                <EditStoreItemModal
                    visible={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    item={editingItem}
                    onSaved={async () => {
                        await refresh();
                        setShowEditModal(false);
                    }}
                />
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    filterContainer: {
        height: 36,
    },
    filterScroll: {
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
        gap: 12,
    },
    columnWrapper: {
        gap: 12,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        maxWidth: '48%', // Ensure 2 columns fit
    },
    imageContainer: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    outOfStockBadge: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    outOfStockText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 12,
        gap: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    costText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    stockText: {
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
