import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, TextInput, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';

// --- TYPES ---
interface StoreItem {
    _id: string;
    itemName: string;
    description?: string;
    cost: number;
    isAvailable: boolean;
    category?: string;
}

export default function StoreListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

    // Form state
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    // --- FETCH DATA ---
    const { data: storeItems, isLoading: isStoreLoading, refetch: refetchStore } = useQuery({
        queryKey: ['store-items'],
        queryFn: async () => {
            const response = await api.get('/api/v1/store-items');
            return response.data.data.storeItems as StoreItem[];
        },
    });

    // Filter items by availability
    const availableItems = storeItems?.filter(item => item.isAvailable) || [];
    const unavailableItems = storeItems?.filter(item => !item.isAvailable) || [];

    // --- MUTATIONS ---
    const updateItemMutation = useMutation({
        mutationFn: async (data: { itemId: string; updates: Partial<StoreItem> }) => {
            return api.put(`/api/v1/admin/store-items/${data.itemId}`, data.updates);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Store item updated!');
            queryClient.invalidateQueries({ queryKey: ['store-items'] });
            setIsEditModalOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update item');
        },
    });

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            return api.delete(`/api/v1/admin/store-items/${itemId}`);
        },
        onSuccess: () => {
            Alert.alert('Success', 'Store item deleted!');
            queryClient.invalidateQueries({ queryKey: ['store-items'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete item');
        },
    });

    const toggleAvailabilityMutation = useMutation({
        mutationFn: async (data: { itemId: string; isAvailable: boolean }) => {
            return api.put(`/api/v1/admin/store-items/${data.itemId}`, {
                isAvailable: data.isAvailable,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-items'] });
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update availability');
        },
    });

    // --- HANDLERS ---
    const resetForm = () => {
        setItemName('');
        setDescription('');
        setCost('');
        setIsAvailable(true);
        setSelectedItem(null);
    };

    const openEditModal = (item: StoreItem) => {
        setSelectedItem(item);
        setItemName(item.itemName);
        setDescription(item.description || '');
        setCost(item.cost.toString());
        setIsAvailable(item.isAvailable);
        setIsEditModalOpen(true);
    };

    const handleUpdateItem = () => {
        if (!selectedItem || !itemName.trim() || !cost) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const costValue = parseInt(cost);
        if (isNaN(costValue) || costValue < 1) {
            Alert.alert('Error', 'Cost must be a positive number');
            return;
        }

        updateItemMutation.mutate({
            itemId: selectedItem._id,
            updates: {
                itemName: itemName.trim(),
                description: description.trim(),
                cost: costValue,
                isAvailable,
            },
        });
    };

    const handleDeleteItem = (item: StoreItem) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteItemMutation.mutate(item._id),
                },
            ]
        );
    };

    const handleToggleAvailability = (item: StoreItem) => {
        toggleAvailabilityMutation.mutate({
            itemId: item._id,
            isAvailable: !item.isAvailable,
        });
    };

    // --- STORE ITEM COMPONENT ---
    const StoreItemCard = ({ item }: { item: StoreItem }) => {
        return (
            <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-3">
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-3">
                        <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="gift" size={20} color="#EA580C" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900">{item.itemName}</Text>
                                {item.description && (
                                    <Text className="text-sm text-gray-500" numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View className="flex-row items-center gap-2">
                            <View className="bg-orange-100 px-3 py-1 rounded-lg">
                                <Text className="text-orange-700 text-sm font-bold">{item.cost} pts</Text>
                            </View>

                            <Pressable
                                onPress={() => handleToggleAvailability(item)}
                                disabled={toggleAvailabilityMutation.isPending}
                                className={`px-3 py-1 rounded-lg ${item.isAvailable ? 'bg-green-100' : 'bg-gray-100'
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${item.isAvailable ? 'text-green-700' : 'text-gray-500'
                                        }`}
                                >
                                    {item.isAvailable ? 'Available' : 'Hidden'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <View className="flex-row space-x-2">
                        <Pressable
                            onPress={() => openEditModal(item)}
                            className="p-2 bg-gray-100 rounded-lg active:bg-gray-200"
                        >
                            <Ionicons name="pencil" size={18} color="#6B7280" />
                        </Pressable>
                        <Pressable
                            onPress={() => handleDeleteItem(item)}
                            className="p-2 bg-gray-100 rounded-lg active:bg-gray-200"
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    // --- EDIT MODAL ---
    const EditModal = () => (
        <Modal visible={isEditModalOpen} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Edit Store Item</Text>
                        <Pressable onPress={() => { setIsEditModalOpen(false); resetForm(); }} className="p-2">
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Item Name */}
                        <Text className="text-sm font-bold text-gray-700 mb-2">Item Name *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                            placeholder="e.g., Extra Screen Time"
                            value={itemName}
                            onChangeText={setItemName}
                        />

                        {/* Description */}
                        <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                            placeholder="Optional details..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        {/* Cost */}
                        <Text className="text-sm font-bold text-gray-700 mb-2">Cost (Points) *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                            placeholder="e.g., 50"
                            value={cost}
                            onChangeText={setCost}
                            keyboardType="numeric"
                        />

                        {/* Availability Toggle */}
                        <View className="flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-gray-700">Available in Store</Text>
                                <Text className="text-xs text-gray-500 mt-1">
                                    {isAvailable ? 'Kids can see and purchase this item' : 'Hidden from store'}
                                </Text>
                            </View>
                            <Switch
                                value={isAvailable}
                                onValueChange={setIsAvailable}
                                trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                                thumbColor={isAvailable ? '#4F46E5' : '#F3F4F6'}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => { setIsEditModalOpen(false); resetForm(); }}
                                className="flex-1 bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200"
                            >
                                <Text className="font-bold text-gray-600">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleUpdateItem}
                                disabled={updateItemMutation.isPending}
                                className="flex-1 bg-orange-600 py-4 rounded-xl items-center active:bg-orange-700 shadow-md shadow-orange-200"
                            >
                                {updateItemMutation.isPending ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="font-bold text-white">Update Item</Text>
                                )}
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    if (isStoreLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#EA580C" />
                <Text className="mt-4 text-gray-500">Loading store items...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="p-6 border-b border-gray-200 bg-white">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full mr-4">
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </Pressable>
                        <View>
                            <Text className="text-xl font-bold text-gray-900">Reward Store</Text>
                            <Text className="text-gray-500 text-xs">
                                {storeItems?.length || 0} total items
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => router.push('/admin/store/create')}
                        className="bg-orange-600 px-4 py-2 rounded-xl flex-row items-center shadow-md shadow-orange-200 active:bg-orange-700"
                    >
                        <Ionicons name="add" size={18} color="white" />
                        <Text className="text-white font-bold ml-1">New</Text>
                    </Pressable>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={isStoreLoading} onRefresh={refetchStore} />}
            >
                {/* Available Items */}
                {availableItems.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="storefront" size={20} color="#10B981" />
                            <Text className="text-sm font-bold text-gray-500 uppercase ml-2 tracking-wider">
                                Available ({availableItems.length})
                            </Text>
                        </View>
                        {availableItems.map(item => <StoreItemCard key={item._id} item={item} />)}
                    </View>
                )}

                {/* Hidden Items */}
                {unavailableItems.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="eye-off-outline" size={20} color="#9CA3AF" />
                            <Text className="text-sm font-bold text-gray-500 uppercase ml-2 tracking-wider">
                                Hidden ({unavailableItems.length})
                            </Text>
                        </View>
                        {unavailableItems.map(item => <StoreItemCard key={item._id} item={item} />)}
                    </View>
                )}

                {/* Empty State */}
                {storeItems?.length === 0 && (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-10">
                        <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="gift-outline" size={32} color="#EA580C" />
                        </View>
                        <Text className="text-gray-500 font-medium mb-1">No rewards yet</Text>
                        <Text className="text-gray-400 text-xs text-center mb-4">
                            Create your first reward to motivate your family
                        </Text>
                        <Pressable
                            onPress={() => router.push('/admin/store/create')}
                            className="bg-orange-600 px-6 py-3 rounded-xl active:bg-orange-700"
                        >
                            <Text className="text-white font-bold">Create Reward</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {/* Edit Modal */}
            <EditModal />
        </SafeAreaView>
    );
}
