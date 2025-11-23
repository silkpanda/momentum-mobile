import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import { Plus, Trash2, ShoppingBag, Star, Edit2 } from 'lucide-react-native';
import CreateStoreItemModal from '../../components/parent/CreateStoreItemModal';
import EditStoreItemModal from '../../components/parent/EditStoreItemModal';
import { useSocket } from '../../contexts/SocketContext';
import { StoreItem } from '../../types';
import { StoreItemUpdatedEvent } from '../../constants/socketEvents';

export default function StoreScreen() {
    const { user } = useAuth();
    const { on, off } = useSocket();
    const [items, setItems] = useState<StoreItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
    const theme = themes.calmLight;

    const loadStoreData = async () => {
        try {
            const storeResponse = await api.getStoreItems();

            if (storeResponse.data && storeResponse.data.storeItems) {
                setItems(storeResponse.data.storeItems);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Error loading store data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStoreData();
        }, [])
    );

    // Real-time updates
    React.useEffect(() => {
        const handleUpdate = (data: StoreItemUpdatedEvent) => {
            console.log('🔄 Received real-time update in Store Manager, refreshing...', data);
            loadStoreData();
        };

        on('store_item_updated', handleUpdate);

        return () => {
            off('store_item_updated', handleUpdate);
        };
    }, [on, off]);

    const onRefresh = () => {
        setRefreshing(true);
        loadStoreData();
    };

    const performDelete = async (itemId: string) => {
        try {
            console.log('Deleting store item:', itemId);
            await api.deleteStoreItem(itemId);
            console.log('Delete successful');
            loadStoreData();
            if (Platform.OS === 'web') {
                alert('Item deleted successfully');
            } else {
                Alert.alert('Success', 'Item deleted successfully');
            }
        } catch (error: any) {
            console.error('Error deleting item:', error);
            const errorMessage = `Failed to delete item: ${error.message || 'Unknown error'}`;
            if (Platform.OS === 'web') {
                alert(errorMessage);
            } else {
                Alert.alert('Error', errorMessage);
            }
        }
    };

    const handleDelete = async (itemId: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to delete this item?');
            if (confirmed) {
                performDelete(itemId);
            }
        } else {
            Alert.alert(
                'Delete Item',
                'Are you sure you want to delete this item?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => performDelete(itemId)
                    }
                ]
            );
        }
    };

    if (isLoading && !items.length) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={themes.calmLight.colors.actionPrimary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Store</Text>
                <Text style={styles.subtitle}>Add and edit rewards</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <View style={styles.iconContainer}>
                                <ShoppingBag size={24} color={themes.calmLight.colors.textSecondary} />
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>
                                    {item.itemName || 'Untitled'}
                                </Text>
                                {item.description && (
                                    <Text style={styles.cardDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                                <View style={styles.priceRow}>
                                    <Star size={14} color={themes.calmLight.colors.actionPrimary} fill={themes.calmLight.colors.actionPrimary} />
                                    <Text style={styles.priceText}>{item.cost} pts</Text>
                                </View>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedItem(item);
                                        setIsEditModalVisible(true);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Edit2 size={20} color={themes.calmLight.colors.actionPrimary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log('🗑️ Delete button clicked for item:', item._id || item.id);
                                        handleDelete(item._id || item.id);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Trash2 size={20} color={themes.calmLight.colors.signalAlert} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No items in store.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsCreateModalVisible(true)}
            >
                <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <CreateStoreItemModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onItemCreated={() => {
                    loadStoreData();
                    setIsCreateModalVisible(false);
                }}
            />

            <EditStoreItemModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                onItemUpdated={() => {
                    loadStoreData();
                    setIsEditModalVisible(false);
                }}
                item={selectedItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themes.calmLight.colors.bgCanvas,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: themes.calmLight.colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: themes.calmLight.colors.textSecondary,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: themes.calmLight.colors.textSecondary,
    },
    card: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: themes.calmLight.colors.bgSurface,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themes.calmLight.colors.bgCanvas,
    },
    cardTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
        color: themes.calmLight.colors.textPrimary,
    },
    cardDescription: {
        fontSize: 14,
        lineHeight: 19,
        marginBottom: 6,
        color: themes.calmLight.colors.textSecondary,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    priceText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: themes.calmLight.colors.actionPrimary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 4,
    },
    actionButton: {
        padding: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        backgroundColor: themes.calmLight.colors.actionPrimary,
    },
});
