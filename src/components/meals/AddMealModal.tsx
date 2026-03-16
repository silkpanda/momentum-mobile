import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { X, ChefHat, MapPin, Type } from 'lucide-react-native';

interface AddMealModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (mealData: any) => void;
}

export default function AddMealModal({ visible, onClose, onAdd }: AddMealModalProps) {
    const { currentTheme: theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'recipe' | 'restaurant' | 'custom'>('recipe');
    const [recipes, setRecipes] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [customTitle, setCustomTitle] = useState('');

    useEffect(() => {
        if (visible) {
            loadData();
            setCustomTitle('');
        }
    }, [visible]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [recipesRes, restaurantsRes] = await Promise.all([
                api.getMeals(),
                api.getRestaurants()
            ]);
            setRecipes(recipesRes.data?.recipes || []);
            setRestaurants(restaurantsRes.data?.restaurants || []);
        } catch (error) {
            console.error('Error loading meal options:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (item: any, type: 'recipe' | 'restaurant') => {
        onAdd({
            itemType: type,
            itemId: item._id || item.id
        });
    };

    const handleCustomAdd = () => {
        if (!customTitle.trim()) return;
        onAdd({
            itemType: 'custom',
            customTitle: customTitle.trim()
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}
            onPress={() => handleSelect(item, activeTab as 'recipe' | 'restaurant')}
        >
            <View style={styles.itemIcon}>
                {activeTab === 'recipe' ? (
                    <ChefHat size={20} color={theme.colors.actionPrimary} />
                ) : (
                    <MapPin size={20} color={theme.colors.actionPrimary} />
                )}
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>{item.name}</Text>
                {item.description && (
                    <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {item.description || item.cuisine}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Add Meal</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'recipe' && { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={() => setActiveTab('recipe')}
                        >
                            <ChefHat size={16} color={activeTab === 'recipe' ? '#FFF' : theme.colors.textSecondary} />
                            <Text style={[styles.tabText, { color: activeTab === 'recipe' ? '#FFF' : theme.colors.textSecondary }]}>Recipes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'restaurant' && { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={() => setActiveTab('restaurant')}
                        >
                            <MapPin size={16} color={activeTab === 'restaurant' ? '#FFF' : theme.colors.textSecondary} />
                            <Text style={[styles.tabText, { color: activeTab === 'restaurant' ? '#FFF' : theme.colors.textSecondary }]}>Dining Out</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'custom' && { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={() => setActiveTab('custom')}
                        >
                            <Type size={16} color={activeTab === 'custom' ? '#FFF' : theme.colors.textSecondary} />
                            <Text style={[styles.tabText, { color: activeTab === 'custom' ? '#FFF' : theme.colors.textSecondary }]}>Custom</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
                        ) : activeTab === 'custom' ? (
                            <View style={styles.customInputContainer}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Meal Name</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.bgSurface,
                                        color: theme.colors.textPrimary,
                                        borderColor: theme.colors.borderSubtle
                                    }]}
                                    placeholder="e.g. Leftovers, Pizza Night..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={customTitle}
                                    onChangeText={setCustomTitle}
                                />
                                <TouchableOpacity
                                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                                    onPress={handleCustomAdd}
                                >
                                    <Text style={styles.addButtonText}>Add to Schedule</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={activeTab === 'recipe' ? recipes : restaurants}
                                renderItem={renderItem}
                                keyExtractor={(item) => item._id || item.id}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                            No {activeTab}s found.
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    listContent: {
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    customInputContainer: {
        gap: 16,
        marginTop: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    addButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
