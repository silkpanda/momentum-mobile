import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../src/lib/api';

interface Recipe {
    _id: string;
    name: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    image?: string;
    tags: string[];
}

export default function RecipeBook() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: recipesData, isLoading } = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            const response = await api.get('/api/v1/meals/recipes');
            return response.data;
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

    const recipes: Recipe[] = recipesData?.data?.recipes || [];

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Recipe',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteRecipeMutation.mutate(id),
                },
            ]
        );
    };

    const getTotalTime = (recipe: Recipe) => {
        const prep = recipe.prepTimeMinutes || 0;
        const cook = recipe.cookTimeMinutes || 0;
        return prep + cook;
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
                <Text style={styles.headerTitle}>Recipe Book</Text>
                <TouchableOpacity
                    onPress={() => router.push('/admin/kitchen/recipes/create')}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {isLoading ? (
                    <Text style={styles.emptyText}>Loading recipes...</Text>
                ) : recipes.length === 0 ? (
                    <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
                        <Ionicons name="book-outline" size={48} color="#64748b" />
                        <Text style={styles.emptyTitle}>No Recipes Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Add your first family recipe to get started
                        </Text>
                    </BlurView>
                ) : (
                    <View style={styles.recipeGrid}>
                        {recipes.map((recipe) => (
                            <TouchableOpacity
                                key={recipe._id}
                                style={styles.recipeCard}
                                onPress={() => router.push(`/admin/kitchen/recipes/${recipe._id}` as any)}
                            >
                                <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.iconCircle}>
                                            <Ionicons name={recipe.image as any || 'restaurant'} size={24} color="#10B981" />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(recipe._id, recipe.name)}
                                            style={styles.deleteButton}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.recipeName} numberOfLines={2}>
                                        {recipe.name}
                                    </Text>

                                    {recipe.description && (
                                        <Text style={styles.recipeDescription} numberOfLines={2}>
                                            {recipe.description}
                                        </Text>
                                    )}

                                    <View style={styles.cardFooter}>
                                        {getTotalTime(recipe) > 0 && (
                                            <View style={styles.timeTag}>
                                                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                                <Text style={styles.timeText}>{getTotalTime(recipe)} min</Text>
                                            </View>
                                        )}
                                        {recipe.tags.length > 0 && (
                                            <View style={styles.tag}>
                                                <Text style={styles.tagText}>{recipe.tags[0]}</Text>
                                            </View>
                                        )}
                                    </View>
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
        backgroundColor: '#10B981',
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
    recipeGrid: {
        gap: 16,
    },
    recipeCard: {
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
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    recipeDescription: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 12,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderRadius: 8,
    },
    timeText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
});
