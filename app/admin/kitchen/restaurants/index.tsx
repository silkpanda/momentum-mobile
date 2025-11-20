import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../src/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Restaurant {
    _id: string;
    name: string;
    cuisine?: string;
    location?: string;
    rating?: number;
    priceRange?: '$' | '$$' | '$$$' | '$$$$';
    isFavorite?: boolean;
}

export default function RestaurantBook() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: restaurants, isLoading } = useQuery({
        queryKey: ['restaurants'],
        queryFn: async () => {
            const response = await api.get('/api/v1/meals/restaurants');
            return response.data.data.restaurants as Restaurant[];
        },
    });

    const deleteRestaurantMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/v1/meals/restaurants/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
        },
    });

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Restaurant', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteRestaurantMutation.mutate(id) },
        ]);
    };

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient colors={['#1e1b4b', '#312e81']} style={StyleSheet.absoluteFill} />
            <SafeAreaView className="flex-1">
                <View className="p-6 border-b border-white/10">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </Pressable>
                            <Text className="text-2xl font-bold text-white">Restaurants</Text>
                        </View>
                        <Pressable
                            onPress={() => router.push('/admin/kitchen/restaurants/create')}
                            className="bg-indigo-600 p-3 rounded-full shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </Pressable>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {isLoading ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <Ionicons name="fast-food" size={48} color="rgba(255,255,255,0.2)" />
                            <Text className="text-indigo-200 mt-4">Loading restaurants...</Text>
                        </View>
                    ) : restaurants && restaurants.length > 0 ? (
                        restaurants.map((restaurant) => (
                            <BlurView key={restaurant._id} intensity={20} tint="light" style={styles.restaurantCard} className="border border-white/10">
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <Text className="text-xl font-bold text-white mr-2">{restaurant.name}</Text>
                                            {restaurant.isFavorite && (
                                                <Ionicons name="heart" size={16} color="#F43F5E" />
                                            )}
                                        </View>
                                        {restaurant.cuisine && (
                                            <Text className="text-indigo-200 mb-2">{restaurant.cuisine}</Text>
                                        )}
                                        <View className="flex-row flex-wrap gap-2 mt-2">
                                            {restaurant.priceRange && (
                                                <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-lg">
                                                    <Ionicons name="cash-outline" size={14} color="#94a3b8" />
                                                    <Text className="text-xs text-indigo-100 ml-1">{restaurant.priceRange}</Text>
                                                </View>
                                            )}
                                            {restaurant.rating && (
                                                <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-lg">
                                                    <Ionicons name="star" size={14} color="#F59E0B" />
                                                    <Text className="text-xs text-indigo-100 ml-1">{restaurant.rating}/5</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View className="flex-row gap-2 ml-4">
                                        <Pressable
                                            onPress={() => router.push(`/admin/kitchen/restaurants/${restaurant._id}`)}
                                            className="bg-white/10 p-2 rounded-full active:bg-white/20 border border-white/5"
                                        >
                                            <Ionicons name="pencil" size={20} color="white" />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleDelete(restaurant._id, restaurant.name)}
                                            className="bg-white/10 p-2 rounded-full active:bg-white/20 border border-white/5"
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
                                        </Pressable>
                                    </View>
                                </View>
                            </BlurView>
                        ))
                    ) : (
                        <BlurView intensity={20} tint="light" className="items-center py-12 rounded-3xl border border-white/10 border-dashed">
                            <View className="w-16 h-16 rounded-full bg-orange-500/20 items-center justify-center mb-4 border border-orange-500/30">
                                <Ionicons name="fast-food-outline" size={32} color="#F97316" />
                            </View>
                            <Text className="text-xl font-bold text-white">No Restaurants Yet</Text>
                            <Text className="text-white/40 mt-2 text-center px-10">
                                Add your favorite takeout spots and restaurants to the list.
                            </Text>
                            <Pressable
                                onPress={() => router.push('/admin/kitchen/restaurants/create')}
                                className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                            >
                                <Text className="text-white font-bold">Add First Restaurant</Text>
                            </Pressable>
                        </BlurView>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        gap: 16,
    },
    restaurantCard: {
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
