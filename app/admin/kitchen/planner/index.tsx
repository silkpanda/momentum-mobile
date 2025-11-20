import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../src/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Recipe {
    _id: string;
    name: string;
}

interface Restaurant {
    _id: string;
    name: string;
}

interface MealPlan {
    _id: string;
    date: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    itemType: 'Recipe' | 'Restaurant' | 'Custom';
    itemId?: { name: string };
    customTitle?: string;
}

export default function WeeklyPlanner() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Dinner');
    const [selectedDay, setSelectedDay] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'recipes' | 'restaurants'>('recipes');

    const getWeekDates = () => {
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay());

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });
    };

    const weekDates = getWeekDates();

    const { data: mealPlansData } = useQuery({
        queryKey: ['meal-plans', weekDates[0].toISOString().split('T')[0]],
        queryFn: async () => {
            const startDate = weekDates[0].toISOString().split('T')[0];
            const endDate = weekDates[6].toISOString().split('T')[0];
            const response = await api.get('/api/v1/meals/plans', {
                params: { startDate, endDate }
            });
            return response.data.data.mealPlans as MealPlan[];
        },
    });

    const { data: recipesData } = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            const response = await api.get('/api/v1/meals/recipes');
            return response.data.data.recipes as Recipe[];
        },
    });

    const { data: restaurantsData } = useQuery({
        queryKey: ['restaurants'],
        queryFn: async () => {
            const response = await api.get('/api/v1/meals/restaurants');
            return response.data.data.restaurants as Restaurant[];
        },
    });

    const createMealPlanMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/api/v1/meals/plans', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
            setShowAddModal(false);
            setSearchQuery('');
        },
    });

    const deleteMealPlanMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/v1/meals/plans/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        },
    });

    const mealPlans = mealPlansData || [];
    const recipes = recipesData || [];
    const restaurants = restaurantsData || [];

    // Filter recipes and restaurants based on search
    const filteredRecipes = useMemo(() => {
        if (!searchQuery) return recipes;
        return recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [recipes, searchQuery]);

    const filteredRestaurants = useMemo(() => {
        if (!searchQuery) return restaurants;
        return restaurants.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [restaurants, searchQuery]);

    const getMealsForDay = (date: Date, mealType: string) => {
        const dateStr = date.toISOString().split('T')[0];
        return mealPlans.filter(
            (plan) => plan.date.split('T')[0] === dateStr && plan.mealType === mealType
        );
    };

    const handleAddMeal = (itemType: 'Recipe' | 'Restaurant', itemId: string) => {
        createMealPlanMutation.mutate({
            date: selectedDay,
            mealType: selectedMealType,
            itemType,
            itemId,
        });
    };

    const handleDeleteMeal = (id: string, name: string) => {
        Alert.alert('Remove Meal', `Remove "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => deleteMealPlanMutation.mutate(id) },
        ]);
    };

    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'] as const;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                            <Text className="text-2xl font-bold text-white">Weekly Planner</Text>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.weekNav}>
                        <Pressable
                            onPress={() => {
                                const prev = new Date(selectedDate);
                                prev.setDate(prev.getDate() - 7);
                                setSelectedDate(prev);
                            }}
                            className="bg-white/10 p-2 rounded-xl active:bg-white/20"
                        >
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </Pressable>

                        <Text className="text-lg font-bold text-white">
                            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>

                        <Pressable
                            onPress={() => {
                                const next = new Date(selectedDate);
                                next.setDate(next.getDate() + 7);
                                setSelectedDate(next);
                            }}
                            className="bg-white/10 p-2 rounded-xl active:bg-white/20"
                        >
                            <Ionicons name="chevron-forward" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    {weekDates.map((date, dayIndex) => (
                        <BlurView key={dayIndex} intensity={20} tint="light" style={styles.dayCard} className="border border-white/10">
                            <View style={styles.dayHeader}>
                                <Text className="text-xl font-bold text-white">{dayNames[dayIndex]}</Text>
                                <Text className="text-base font-medium text-indigo-200">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                            </View>

                            {mealTypes.map((mealType) => {
                                const meals = getMealsForDay(date, mealType);
                                const dateStr = date.toISOString().split('T')[0];

                                return (
                                    <View key={mealType} style={styles.mealSection}>
                                        <View style={styles.mealHeader}>
                                            <Ionicons
                                                name={
                                                    mealType === 'Breakfast' ? 'sunny' :
                                                        mealType === 'Lunch' ? 'partly-sunny' : 'moon'
                                                }
                                                size={18}
                                                color="#94a3b8"
                                            />
                                            <Text className="text-sm font-bold text-indigo-200 uppercase">{mealType}</Text>
                                        </View>

                                        {meals.length > 0 ? (
                                            meals.map((meal) => (
                                                <TouchableOpacity
                                                    key={meal._id}
                                                    style={styles.mealItem}
                                                    className="bg-white/5 border border-white/10"
                                                    onPress={() => handleDeleteMeal(
                                                        meal._id,
                                                        meal.itemId?.name || meal.customTitle || 'Meal'
                                                    )}
                                                >
                                                    <Ionicons
                                                        name={meal.itemType === 'Recipe' ? 'restaurant' : 'fast-food'}
                                                        size={16}
                                                        color={meal.itemType === 'Recipe' ? '#10B981' : '#F59E0B'}
                                                    />
                                                    <Text className="flex-1 text-base font-medium text-white ml-2">
                                                        {meal.itemId?.name || meal.customTitle}
                                                    </Text>
                                                    <Ionicons name="close-circle" size={18} color="#FCA5A5" />
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.addMealButton}
                                                className="bg-white/5 border border-white/10 border-dashed"
                                                onPress={() => {
                                                    setSelectedDay(dateStr);
                                                    setSelectedMealType(mealType);
                                                    setShowAddModal(true);
                                                    setActiveTab(recipes.length > 0 ? 'recipes' : 'restaurants');
                                                }}
                                            >
                                                <Ionicons name="add-circle-outline" size={20} color="#818cf8" />
                                                <Text className="text-sm font-medium text-indigo-300 ml-2">Add meal</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </BlurView>
                    ))}
                </ScrollView>

                <Modal visible={showAddModal} animationType="slide" transparent={true}>
                    <BlurView intensity={40} tint="dark" className="flex-1">
                        <View className="flex-1 bg-slate-900/90 mt-20 rounded-t-3xl border-t border-white/10">
                            <View className="flex-row justify-between items-start p-6 pb-4 border-b border-white/10">
                                <View>
                                    <Text className="text-2xl font-bold text-white mb-1">Add {selectedMealType}</Text>
                                    <Text className="text-base text-indigo-200">
                                        {selectedDay && new Date(selectedDay).toLocaleDateString('en-US', {
                                            weekday: 'long', month: 'short', day: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <Pressable onPress={() => {
                                    setShowAddModal(false);
                                    setSearchQuery('');
                                }} className="bg-white/10 p-2 rounded-full">
                                    <Ionicons name="close" size={24} color="#fff" />
                                </Pressable>
                            </View>

                            {/* Search Bar */}
                            <View className="px-6 py-4">
                                <View className="flex-row items-center bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                                    <Ionicons name="search" size={20} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-white text-base"
                                        placeholder="Search..."
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                                            <Ionicons name="close-circle" size={20} color="#64748b" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Tabs */}
                            <View className="flex-row px-6 mb-4 gap-3">
                                <Pressable
                                    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${activeTab === 'recipes' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10'}`}
                                    onPress={() => setActiveTab('recipes')}
                                >
                                    <Ionicons name="book" size={20} color={activeTab === 'recipes' ? '#fff' : '#94a3b8'} />
                                    <Text className={`ml-2 font-bold ${activeTab === 'recipes' ? 'text-white' : 'text-indigo-200'}`}>
                                        Recipes ({filteredRecipes.length})
                                    </Text>
                                </Pressable>
                                <Pressable
                                    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${activeTab === 'restaurants' ? 'bg-orange-600 border-orange-500' : 'bg-white/5 border-white/10'}`}
                                    onPress={() => setActiveTab('restaurants')}
                                >
                                    <Ionicons name="fast-food" size={20} color={activeTab === 'restaurants' ? '#fff' : '#94a3b8'} />
                                    <Text className={`ml-2 font-bold ${activeTab === 'restaurants' ? 'text-white' : 'text-indigo-200'}`}>
                                        Restaurants ({filteredRestaurants.length})
                                    </Text>
                                </Pressable>
                            </View>

                            <ScrollView contentContainerStyle={styles.modalContent}>
                                {activeTab === 'recipes' ? (
                                    filteredRecipes.length > 0 ? (
                                        filteredRecipes.map((recipe) => (
                                            <TouchableOpacity
                                                key={recipe._id}
                                                className="flex-row items-center p-4 bg-white/5 rounded-xl border border-white/10 mb-3"
                                                onPress={() => handleAddMeal('Recipe', recipe._id)}
                                            >
                                                <View className="w-12 h-12 rounded-xl bg-emerald-500/20 items-center justify-center border border-emerald-500/30">
                                                    <Ionicons name="restaurant" size={24} color="#10B981" />
                                                </View>
                                                <Text className="flex-1 text-lg font-bold text-white ml-4">{recipe.name}</Text>
                                                <Ionicons name="add-circle" size={28} color="#10B981" />
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View className="items-center py-10">
                                            <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.2)" />
                                            <Text className="text-xl font-bold text-white mt-4">
                                                {searchQuery ? 'No recipes found' : 'No recipes yet'}
                                            </Text>
                                            <Text className="text-indigo-200 mt-2 text-center px-10">
                                                {searchQuery ? 'Try a different search' : 'Add some from the Recipe Book first'}
                                            </Text>
                                        </View>
                                    )
                                ) : (
                                    filteredRestaurants.length > 0 ? (
                                        filteredRestaurants.map((restaurant) => (
                                            <TouchableOpacity
                                                key={restaurant._id}
                                                className="flex-row items-center p-4 bg-white/5 rounded-xl border border-white/10 mb-3"
                                                onPress={() => handleAddMeal('Restaurant', restaurant._id)}
                                            >
                                                <View className="w-12 h-12 rounded-xl bg-orange-500/20 items-center justify-center border border-orange-500/30">
                                                    <Ionicons name="fast-food" size={24} color="#F59E0B" />
                                                </View>
                                                <Text className="flex-1 text-lg font-bold text-white ml-4">{restaurant.name}</Text>
                                                <Ionicons name="add-circle" size={28} color="#F59E0B" />
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View className="items-center py-10">
                                            <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.2)" />
                                            <Text className="text-xl font-bold text-white mt-4">
                                                {searchQuery ? 'No restaurants found' : 'No restaurants yet'}
                                            </Text>
                                            <Text className="text-indigo-200 mt-2 text-center px-10">
                                                {searchQuery ? 'Try a different search' : 'Add some from the Restaurant Book first'}
                                            </Text>
                                        </View>
                                    )
                                )}
                            </ScrollView>
                        </View>
                    </BlurView>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        gap: 16,
    },
    weekNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayCard: {
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    mealSection: {
        marginBottom: 12,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 6,
    },
    addMealButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
    },
    modalContent: {
        padding: 24,
        paddingTop: 0,
    },
});
