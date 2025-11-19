import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../src/lib/api';

export default function CreateRecipe() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [ingredients, setIngredients] = useState<string[]>(['']);
    const [instructions, setInstructions] = useState<string[]>(['']);
    const [tags, setTags] = useState('');

    const createRecipeMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/api/v1/meals/recipes', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            router.back();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create recipe');
        },
    });

    const handleAddIngredient = () => {
        setIngredients([...ingredients, '']);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (text: string, index: number) => {
        const updated = [...ingredients];
        updated[index] = text;
        setIngredients(updated);
    };

    const handleAddInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const handleRemoveInstruction = (index: number) => {
        setInstructions(instructions.filter((_, i) => i !== index));
    };

    const handleInstructionChange = (text: string, index: number) => {
        const updated = [...instructions];
        updated[index] = text;
        setInstructions(updated);
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Recipe name is required');
            return;
        }

        const filteredIngredients = ingredients.filter(i => i.trim());
        const filteredInstructions = instructions.filter(i => i.trim());

        const recipeData = {
            name: name.trim(),
            description: description.trim() || undefined,
            ingredients: filteredIngredients,
            instructions: filteredInstructions,
            prepTimeMinutes: prepTime ? parseInt(prepTime) : undefined,
            cookTimeMinutes: cookTime ? parseInt(cookTime) : undefined,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            image: 'restaurant', // Default icon
        };

        createRecipeMutation.mutate(recipeData);
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
                <Text style={styles.headerTitle}>New Recipe</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.saveButton, createRecipeMutation.isPending && styles.saveButtonDisabled]}
                    disabled={createRecipeMutation.isPending}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Basic Info */}
                <BlurView intensity={20} tint="dark" style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Info</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Recipe Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Grandma's Spaghetti"
                            placeholderTextColor="#64748b"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Brief description..."
                            placeholderTextColor="#64748b"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Prep (min)</Text>
                            <TextInput
                                style={styles.input}
                                value={prepTime}
                                onChangeText={setPrepTime}
                                placeholder="15"
                                placeholderTextColor="#64748b"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Cook (min)</Text>
                            <TextInput
                                style={styles.input}
                                value={cookTime}
                                onChangeText={setCookTime}
                                placeholder="30"
                                placeholderTextColor="#64748b"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tags (comma separated)</Text>
                        <TextInput
                            style={styles.input}
                            value={tags}
                            onChangeText={setTags}
                            placeholder="Dinner, Italian, Quick"
                            placeholderTextColor="#64748b"
                        />
                    </View>
                </BlurView>

                {/* Ingredients */}
                <BlurView intensity={20} tint="dark" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        <TouchableOpacity onPress={handleAddIngredient} style={styles.addItemButton}>
                            <Ionicons name="add-circle" size={24} color="#10B981" />
                        </TouchableOpacity>
                    </View>

                    {ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.listItem}>
                            <Text style={styles.listNumber}>{index + 1}.</Text>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={ingredient}
                                onChangeText={(text) => handleIngredientChange(text, index)}
                                placeholder="e.g., 2 cups flour"
                                placeholderTextColor="#64748b"
                            />
                            {ingredients.length > 1 && (
                                <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </BlurView>

                {/* Instructions */}
                <BlurView intensity={20} tint="dark" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <TouchableOpacity onPress={handleAddInstruction} style={styles.addItemButton}>
                            <Ionicons name="add-circle" size={24} color="#10B981" />
                        </TouchableOpacity>
                    </View>

                    {instructions.map((instruction, index) => (
                        <View key={index} style={styles.listItem}>
                            <Text style={styles.listNumber}>{index + 1}.</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { flex: 1 }]}
                                value={instruction}
                                onChangeText={(text) => handleInstructionChange(text, index)}
                                placeholder="Describe this step..."
                                placeholderTextColor="#64748b"
                                multiline
                            />
                            {instructions.length > 1 && (
                                <TouchableOpacity onPress={() => handleRemoveInstruction(index)}>
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </BlurView>
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
    saveButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#10B981',
        borderRadius: 12,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    content: {
        padding: 20,
        gap: 16,
    },
    section: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        fontSize: 16,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    addItemButton: {
        padding: 4,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    listNumber: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
        width: 24,
    },
});
