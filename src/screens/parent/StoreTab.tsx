import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import { Plus, Trash2, ShoppingBag, Star, Edit2 } from 'lucide-react-native';
import CreateStoreItemModal from '../../components/parent/CreateStoreItemModal';
import EditStoreItemModal from '../../components/parent/EditStoreItemModal';

export default function StoreScreen() {
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
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

    const onRefresh = () => {
        setRefreshing(true);
        loadStoreData();
    };

    const handleDelete = async (itemId: string) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteStoreItem(itemId);
                            loadStoreData();
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            alert('Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    if (isLoading && !items.length) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Manage Store</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Add and edit rewards</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                        <View style={styles.cardContent}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                                <ShoppingBag size={24} color={theme.colors.textSecondary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                                    {item.itemName || 'Untitled'}
                                </Text>
                                {item.description && (
                                    <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                                <View style={styles.priceRow}>
                                    <Star size={14} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                                    <Text style={[styles.priceText, { color: theme.colors.actionPrimary }]}>{item.cost} pts</Text>
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
                                    <Edit2 size={20} color={theme.colors.actionPrimary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDelete(item._id || item.id)}
                                    style={styles.actionButton}
                                >
                                    <Trash2 size={20} color={theme.colors.signalAlert} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No items in store.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.actionPrimary }]}
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
    },
    subtitle: {
        fontSize: 14,
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
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        lineHeight: 19,
        marginBottom: 6,
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
    },
});
