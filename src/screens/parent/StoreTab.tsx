import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useData } from '../../contexts/DataContext';
import { StoreItem } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonList } from '../../components/SkeletonLoader';
import { ShoppingBag, Plus, Coins } from 'lucide-react-native';
import CreateStoreItemModal from '../../components/parent/CreateStoreItemModal';

export default function StoreTab() {
    const { currentTheme: theme } = useTheme();

    // Get data from global cache
    const { storeItems, isInitialLoad, isRefreshing, refresh } = useData();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

    const handleItemPress = (item: StoreItem) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const handleCreateNew = () => {
        setSelectedItem(null);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    const renderStoreItem = ({ item }: { item: StoreItem }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: theme.colors.bgSurface }]}
            onPress={() => handleItemPress(item)}
        >
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
                <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.colors.bgCanvas }]}>
                    <ShoppingBag size={32} color={theme.colors.borderSubtle} />
                </View>
            )}
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.textPrimary }]}>
                    {item.name}
                </Text>
                {item.description && (
                    <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <View style={styles.itemFooter}>
                    <View style={styles.priceContainer}>
                        <Coins size={16} color={theme.colors.actionPrimary} />
                        <Text style={[styles.itemPrice, { color: theme.colors.actionPrimary }]}>
                            {item.pointsCost} pts
                        </Text>
                    </View>
                    {item.stock !== undefined && (
                        <Text style={[styles.itemStock, { color: theme.colors.textSecondary }]}>
                            Stock: {item.stock}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (isInitialLoad) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                <SkeletonList count={4} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <ShoppingBag size={24} color={theme.colors.actionPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Store
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={handleCreateNew}
                >
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Item</Text>
                </TouchableOpacity>
            </View>

            {/* Store Items List */}
            <FlatList
                data={storeItems}
                renderItem={renderStoreItem}
                keyExtractor={(item) => item.id || item._id || ''}
                contentContainerStyle={styles.listContent}
                numColumns={2}
                columnWrapperStyle={styles.row}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        tintColor={theme.colors.actionPrimary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ShoppingBag size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No store items yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            Add rewards for your family to earn
                        </Text>
                    </View>
                }
            />

            {/* Combined Create/Edit Modal */}
            <CreateStoreItemModal
                visible={modalVisible}
                onClose={handleCloseModal}
                onItemCreated={refresh}
                initialItem={selectedItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemCard: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    itemImagePlaceholder: {
        width: '100%',
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        padding: 12,
        gap: 6,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemDescription: {
        fontSize: 13,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemStock: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
        width: '100%',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
