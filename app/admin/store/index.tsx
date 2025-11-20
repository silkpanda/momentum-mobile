import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, TextInput, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
            <BlurView intensity={20} tint="light" className="overflow-hidden rounded-2xl border border-white/10 mb-3">
                <View className="p-4 bg-white/5">
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1 mr-3">
                            <View className="flex-row items-center mb-2">
                                <View className="w-10 h-10 bg-orange-500/20 rounded-full items-center justify-center mr-3 border border-orange-500/30">
                                    <Ionicons name="gift" size={20} color="#F97316" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-white">{item.itemName}</Text>
                                    {item.description && (
                                        <Text className="text-sm text-indigo-200" numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View className="flex-row items-center gap-2">
                                <View className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-lg">
                                    <Text className="text-orange-300 text-sm font-bold">{item.cost} pts</Text>
                                </View>

                                <Pressable
                                    onPress={() => handleToggleAvailability(item)}
                                    disabled={toggleAvailabilityMutation.isPending}
                                    className={`px-3 py-1 rounded-lg border ${item.isAvailable ? 'bg-green-500/20 border-green-500/30' : 'bg-white/10 border-white/10'
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${item.isAvailable ? 'text-green-300' : 'text-white/50'
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
                                className="p-2 bg-white/10 rounded-lg active:bg-white/20 border border-white/5"
                            >
                                <Ionicons name="pencil" size={18} color="white" />
                            </Pressable>
                            <Pressable
                                onPress={() => handleDeleteItem(item)}
                                className="p-2 bg-white/10 rounded-lg active:bg-white/20 border border-white/5"
                            >
                                <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </BlurView>
        );
    };

    // --- EDIT MODAL ---
    const editModalContent = useMemo(() => (
        <Modal visible={isEditModalOpen} animationType="fade" transparent={true}>
            <BlurView intensity={40} tint="dark" className="flex-1 justify-end">
                <View className="bg-slate-900/90 rounded-t-3xl p-6 max-h-[80%] border-t border-white/10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-white">Edit Store Item</Text>
                        <Pressable onPress={() => { setIsEditModalOpen(false); resetForm(); }} className="p-2 bg-white/10 rounded-full">
                            <Ionicons name="close" size={24} color="white" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Item Name */}
                        <Text className="text-xs font-bold text-indigo-200 uppercase mb-2">Item Name *</Text>
                        <TextInput
                            className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 text-white placeholder:text-white/30"
                            placeholder="e.g., Extra Screen Time"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={itemName}
                            onChangeText={setItemName}
                        />

                        {/* Description */}
                        <Text className="text-xs font-bold text-indigo-200 uppercase mb-2">Description</Text>
                        <TextInput
                            className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 text-white placeholder:text-white/30"
                            placeholder="Optional details..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        {/* Cost */}
                        <Text className="text-xs font-bold text-indigo-200 uppercase mb-2">Cost (Points) *</Text>
                        <TextInput
                            className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 text-white placeholder:text-white/30"
                            placeholder="e.g., 50"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={cost}
                            onChangeText={setCost}
                            keyboardType="numeric"
                        />

                        {/* Availability Toggle */}
                        <View className="flex-row justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-white">Available in Store</Text>
                                <Text className="text-xs text-indigo-200 mt-1">
                                    {isAvailable ? 'Kids can see and purchase this item' : 'Hidden from store'}
                                </Text>
                            </View>
                            <Switch
                                value={isAvailable}
                                onValueChange={setIsAvailable}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#818CF8' }}
                                thumbColor={'white'}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mb-10">
                            <Pressable
                                onPress={() => { setIsEditModalOpen(false); resetForm(); }}
                                className="flex-1 bg-white/10 py-4 rounded-xl items-center active:bg-white/20 border border-white/5"
                            >
                                <Text className="font-bold text-white">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleUpdateItem}
                                disabled={updateItemMutation.isPending}
                                className="flex-1 bg-indigo-600 py-4 rounded-xl items-center active:bg-indigo-700 shadow-lg shadow-indigo-500/30"
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
            </BlurView>
        </Modal>
    ), [isEditModalOpen, itemName, description, cost, isAvailable, updateItemMutation.isPending]);

    if (isStoreLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-900">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="mt-4 text-indigo-200">Loading store items...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="p-6 border-b border-white/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                                    <Ionicons name="arrow-back" size={24} color="white" />
                                </Pressable>
                                <View>
                                    <Text className="text-xl font-bold text-white">Reward Store</Text>
                                    <Text className="text-indigo-200 text-xs">
                                        {storeItems?.length || 0} total items
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => router.push('/admin/store/create')}
                                className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                            >
                                <Ionicons name="add" size={18} color="white" />
                                <Text className="text-white font-bold ml-1">New</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView
                        contentContainerClassName="p-6"
                        refreshControl={<RefreshControl refreshing={isStoreLoading} onRefresh={refetchStore} tintColor="white" />}
                    >
                        {/* Available Items */}
                        {availableItems.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="storefront" size={20} color="#34d399" />
                                    <Text className="text-sm font-bold text-indigo-200 uppercase ml-2 tracking-wider">
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
                                    <Ionicons name="eye-off-outline" size={20} color="rgba(255,255,255,0.5)" />
                                    <Text className="text-sm font-bold text-white/50 uppercase ml-2 tracking-wider">
                                        Hidden ({unavailableItems.length})
                                    </Text>
                                </View>
                                {unavailableItems.map(item => <StoreItemCard key={item._id} item={item} />)}
                            </View>
                        )}

                        {/* Empty State */}
                        {storeItems?.length === 0 && (
                            <BlurView intensity={20} tint="light" className="p-8 rounded-2xl border border-white/10 border-dashed items-center mt-10">
                                <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4 border border-orange-500/30">
                                    <Ionicons name="gift-outline" size={32} color="#F97316" />
                                </View>
                                <Text className="text-white font-medium mb-1">No rewards yet</Text>
                                <Text className="text-white/40 text-xs text-center mb-4">
                                    Create your first reward to motivate your family
                                </Text>
                                <Pressable
                                    onPress={() => router.push('/admin/store/create')}
                                    className="bg-indigo-600 px-6 py-3 rounded-xl active:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                                >
                                    <Text className="text-white font-bold">Create Reward</Text>
                                </Pressable>
                            </BlurView>
                        )}
                    </ScrollView>

                    {/* Edit Modal */}
                    {editModalContent}
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
