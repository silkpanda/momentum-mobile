import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import { Plus, Trash2, UtensilsCrossed, MapPin } from 'lucide-react-native';

export default function MealsTab() {
    const [meals, setMeals] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'meals' | 'restaurants'>('meals');
    const theme = themes.calmLight;

    const loadData = async () => {
        try {
            const [mealsResponse, restaurantsResponse] = await Promise.all([
                api.getMeals(),
                api.getRestaurants()
            ]);

            if (mealsResponse.data && mealsResponse.data.meals) {
                setMeals(mealsResponse.data.meals);
            } else {
                setMeals([]);
            }

            if (restaurantsResponse.data && restaurantsResponse.data.restaurants) {
                setRestaurants(restaurantsResponse.data.restaurants);
            } else {
                setRestaurants([]);
            }
        } catch (error) {
            console.error('Error loading meals data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleDeleteMeal = async (mealId: string) => {
        Alert.alert(
            'Delete Meal',
            'Are you sure you want to delete this meal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteMeal(mealId);
                            loadData();
                        } catch (error) {
                            console.error('Error deleting meal:', error);
                            alert('Failed to delete meal');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteRestaurant = async (restaurantId: string) => {
        Alert.alert(
            'Delete Restaurant',
            'Are you sure you want to delete this restaurant?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteRestaurant(restaurantId);
                            loadData();
                        } catch (error) {
                            console.error('Error deleting restaurant:', error);
                            alert('Failed to delete restaurant');
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    const currentData = activeTab === 'meals' ? meals : restaurants;
    const handleDelete = activeTab === 'meals' ? handleDeleteMeal : handleDeleteRestaurant;
    const icon = activeTab === 'meals' ? UtensilsCrossed : MapPin;
    const Icon = icon;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Meal Planner</Text>
                <Text style={{ color: theme.colors.textSecondary }}>Manage meals and restaurants</Text>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabSelector}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'meals' && { borderBottomColor: theme.colors.actionPrimary, borderBottomWidth: 2 }
                    ]}
                    onPress={() => setActiveTab('meals')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'meals' ? theme.colors.actionPrimary : theme.colors.textSecondary }
                    ]}>
                        Home Meals
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'restaurants' && { borderBottomColor: theme.colors.actionPrimary, borderBottomWidth: 2 }
                    ]}
                    onPress={() => setActiveTab('restaurants')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'restaurants' ? theme.colors.actionPrimary : theme.colors.textSecondary }
                    ]}>
                        Restaurants
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {currentData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.textSecondary }}>
                            No {activeTab === 'meals' ? 'meals' : 'restaurants'} added yet.
                        </Text>
                    </View>
                ) : (
                    currentData.map((item) => (
                        <View key={item._id || item.id} style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                            <View style={styles.cardContent}>
                                <View style={[styles.iconContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                                    <Icon size={24} color={theme.colors.textSecondary} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{item.name || item.title}</Text>
                                    {item.description && (
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
                                            {item.description}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDelete(item._id || item.id)}
                                    style={styles.deleteButton}
                                >
                                    <Trash2 size={20} color={theme.colors.signalAlert} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.actionPrimary }]}
                onPress={() => alert(`Create ${activeTab === 'meals' ? 'Meal' : 'Restaurant'} - Coming Soon`)}
            >
                <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
    tabSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
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
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    deleteButton: {
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
