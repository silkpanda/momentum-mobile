import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Pressable } from 'react-native';
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
    description?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    tags?: string[];
}

export default function RecipeBook() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: recipes, isLoading } = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            const response = await api.get('/api/v1/meals/recipes');
            return response.data.data.recipes as Recipe[];
        },
    });

    const deleteRecipeMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/v1/meals/recipes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
        },
    });

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Recipe', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteRecipeMutation.mutate(id) },
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
                            <Text className="text-2xl font-bold text-white">Recipe Book</Text>
                        </View>
                        <Pressable
                            onPress={() => router.push('/admin/kitchen/recipes/create')}
                            className="bg-indigo-600 p-3 rounded-full shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </Pressable>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {isLoading ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <Ionicons name="restaurant" size={48} color="rgba(255,255,255,0.2)" />
                            <Text className="text-indigo-200 mt-4">Loading recipes...</Text>
                        </View>
                    ) : recipes && recipes.length > 0 ? (
                        recipes.map((recipe) => (
                            <BlurView key={recipe._id} intensity={20} tint="light" style={styles.recipeCard} className="border border-white/10">
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="text-xl font-bold text-white mb-1">{recipe.name}</Text>
                                        {recipe.description && (
                                            <Text className="text-indigo-200 mb-2" numberOfLines={2}>{recipe.description}</Text>
                                        )}
                                        <View className="flex-row flex-wrap gap-2 mt-2">
                                            {recipe.prepTime && (
                                                <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-lg">
                                                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                                    <Text className="text-xs text-indigo-100 ml-1">Prep: {recipe.prepTime}m</Text>
                                                </View>
                                            )}
                                            {recipe.cookTime && (
                                                <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-lg">
                                                    <Ionicons name="flame-outline" size={14} color="#94a3b8" />
                                                    <Text className="text-xs text-indigo-100 ml-1">Cook: {recipe.cookTime}m</Text>
                                                </View>
                                            )}
                                            {recipe.servings && (
                                                <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-lg">
                                                    <Ionicons name="people-outline" size={14} color="#94a3b8" />
                                                    <Text className="text-xs text-indigo-100 ml-1">{recipe.servings} ppl</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View className="flex-row gap-2 ml-4">
                                        <Pressable
                                            onPress={() => router.push(`/admin/kitchen/recipes/${recipe._id}`)}
                                            className="bg-white/10 p-2 rounded-full active:bg-white/20 border border-white/5"
                                        >
                                            <Ionicons name="pencil" size={20} color="white" />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleDelete(recipe._id, recipe.name)}
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
                            <View className="w-16 h-16 rounded-full bg-indigo-500/20 items-center justify-center mb-4 border border-indigo-500/30">
                                <Ionicons name="restaurant-outline" size={32} color="#818cf8" />
                            </View>
                            <Text className="text-xl font-bold text-white">No Recipes Yet</Text>
                            <Text className="text-white/40 mt-2 text-center px-10">
                                Start building your family cookbook by adding your favorite recipes.
                            </Text>
                            <Pressable
                                onPress={() => router.push('/admin/kitchen/recipes/create')}
                                className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 active:bg-indigo-700"
                            >
                                <Text className="text-white font-bold">Add First Recipe</Text>
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
    recipeCard: {
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
