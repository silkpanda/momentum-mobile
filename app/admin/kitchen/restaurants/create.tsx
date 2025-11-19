import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../src/lib/api';

export default function CreateRestaurant() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [location, setLocation] = useState('');
    const [favoriteOrders, setFavoriteOrders] = useState<string[]>(['']);

    const createRestaurantMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/api/v1/meals/restaurants', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            router.back();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create restaurant');
        },
    });

    const handleAddOrder = () => {
        setFavoriteOrders([...favoriteOrders, '']);
    };

    const handleRemoveOrder = (index: number) => {
        setFavoriteOrders(favoriteOrders.filter((_, i) => i !== index));
    };

    const handleOrderChange = (text: string, index: number) => {
        const updated = [...favoriteOrders];
        updated[index] = text;
        setFavoriteOrders(updated);
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Restaurant name is required');
            return;
        }

        const filteredOrders = favoriteOrders
            .filter(o => o.trim())
            .map(itemName => ({ itemName }));

        const restaurantData = {
            name: name.trim(),
            cuisine: cuisine.trim() || undefined,
            location: location.trim() || undefined,
            favoriteOrders: filteredOrders,
        };

        createRestaurantMutation.mutate(restaurantData);
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
                <Text style={styles.headerTitle}>New Restaurant</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.saveButton, createRestaurantMutation.isPending && styles.saveButtonDisabled]}
                    disabled={createRestaurantMutation.isPending}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Basic Info */}
                <BlurView intensity={20} tint="dark" style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Info</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Restaurant Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Pizza Palace"
                            placeholderTextColor="#64748b"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Cuisine Type</Text>
                        <TextInput
                            style={styles.input}
                            value={cuisine}
                            onChangeText={setCuisine}
                            placeholder="e.g., Italian, Chinese, Mexican"
                            placeholderTextColor="#64748b"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location / Address</Text>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="e.g., 123 Main St or DoorDash"
                            placeholderTextColor="#64748b"
                        />
                    </View>
                </BlurView>

                {/* Favorite Orders */}
                <BlurView intensity={20} tint="dark" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Favorite Orders</Text>
                            <Text style={styles.sectionSubtitle}>Track what your family loves</Text>
                        </View>
                        <TouchableOpacity onPress={handleAddOrder} style={styles.addItemButton}>
                            <Ionicons name="add-circle" size={24} color="#F59E0B" />
                        </TouchableOpacity>
                    </View>

                    {favoriteOrders.map((order, index) => (
                        <View key={index} style={styles.listItem}>
                            <Ionicons name="heart-outline" size={20} color="#EF4444" />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={order}
                                onChangeText={(text) => handleOrderChange(text, index)}
                                placeholder="e.g., Large Pepperoni Pizza"
                                placeholderTextColor="#64748b"
                            />
                            {favoriteOrders.length > 1 && (
                                <TouchableOpacity onPress={() => handleRemoveOrder(index)}>
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <Text style={styles.helpText}>
                        💡 Tip: Add family member names to remember who likes what!
                    </Text>
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
        backgroundColor: '#F59E0B',
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
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
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
    addItemButton: {
        padding: 4,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    helpText: {
        fontSize: 13,
        color: '#94a3b8',
        fontStyle: 'italic',
        marginTop: 8,
    },
});
