import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../src/lib/api';

interface Restaurant {
    _id: string;
    name: string;
    cuisine?: string;
    location?: string;
    favoriteOrders: {
        itemName: string;
        forMemberId?: string;
    }[];
}

export default function RestaurantBook() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: restaurantsData, isLoading } = useQuery({
        queryKey: ['restaurants'],
        queryFn: async () => {
            const response = await api.get('/api/v1/meals/restaurants');
            return response.data;
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

    const restaurants: Restaurant[] = restaurantsData?.data?.restaurants || [];

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Restaurant',
            `Are you sure you want to remove "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteRestaurantMutation.mutate(id),
                },
            ]
        );
    };

    const getCuisineIcon = (cuisine?: string) => {
        const lower = cuisine?.toLowerCase() || '';
        if (lower.includes('pizza')) return 'pizza';
        if (lower.includes('chinese') || lower.includes('asian')) return 'restaurant';
        if (lower.includes('burger') || lower.includes('american')) return 'fast-food';
        if (lower.includes('mexican')) return 'restaurant';
        if (lower.includes('italian')) return 'wine';
        return 'restaurant-outline';
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Restaurant Book</Text>
                <TouchableOpacity
                    onPress={() => router.push('/admin/kitchen/restaurants/create')}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {isLoading ? (
                    <Text style={styles.emptyText}>Loading restaurants...</Text>
                ) : restaurants.length === 0 ? (
                    <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
                        <Ionicons name="fast-food-outline" size={48} color="#64748b" />
                        <Text style={styles.emptyTitle}>No Restaurants Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Add your favorite takeout spots
                        </Text>
                    </BlurView>
                ) : (
                    <View style={styles.restaurantGrid}>
                        {restaurants.map((restaurant) => (
                            <TouchableOpacity
                                key={restaurant._id}
                                style={styles.restaurantCard}
                                onPress={() => router.push(`/admin/kitchen/restaurants/${restaurant._id}` as any)}
                            >
                                <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.iconCircle}>
                                            <Ionicons
                                                name={getCuisineIcon(restaurant.cuisine) as any}
                                                size={24}
                                                color="#F59E0B"
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(restaurant._id, restaurant.name)}
                                            style={styles.deleteButton}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.restaurantName} numberOfLines={1}>
                                        {restaurant.name}
                                    </Text>

                                    {restaurant.cuisine && (
                                        <View style={styles.cuisineTag}>
                                            <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
                                        </View>
                                    )}

                                    {restaurant.location && (
                                        <View style={styles.locationRow}>
                                            <Ionicons name="location-outline" size={14} color="#94a3b8" />
                                            <Text style={styles.locationText} numberOfLines={1}>
                                                {restaurant.location}
                                            </Text>
                                        </View>
                                    )}

                                    {restaurant.favoriteOrders.length > 0 && (
                                        <View style={styles.ordersRow}>
                                            <Ionicons name="heart" size={14} color="#EF4444" />
                                            <Text style={styles.ordersText}>
                                                {restaurant.favoriteOrders.length} favorite{restaurant.favoriteOrders.length !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                    )}
                                </BlurView>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        marginLeft: 16,
    },
    addButton: {
        padding: 8,
        backgroundColor: '#F59E0B',
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    emptyCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
        textAlign: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 40,
    },
    restaurantGrid: {
        gap: 16,
    },
    restaurantCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardBlur: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    cuisineTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: 8,
        marginBottom: 8,
    },
    cuisineText: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#94a3b8',
        flex: 1,
    },
    ordersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    ordersText: {
        fontSize: 13,
        color: '#94a3b8',
    },
});
