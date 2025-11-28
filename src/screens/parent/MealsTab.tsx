import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonList } from '../../components/SkeletonLoader';
import WeeklyScheduler from '../../components/meals/WeeklyScheduler';
import { Calendar, UtensilsCrossed, Plus, ChefHat, MapPin } from 'lucide-react-native';
import CreateRecipeModal from '../../components/meals/CreateRecipeModal';
import CreateRestaurantModal from '../../components/meals/CreateRestaurantModal';

export default function MealsTab() {
    const { currentTheme: theme } = useTheme();

    // Get data from global cache
    const { meals, restaurants, isInitialLoad, isRefreshing, refresh } = useData();

    const [activeTab, setActiveTab] = useState<'recipes' | 'restaurants' | 'plan'>('plan');
    const [recipeModalVisible, setRecipeModalVisible] = useState(false);
    const [restaurantModalVisible, setRestaurantModalVisible] = useState(false);

    const handleAddClick = () => {
        if (activeTab === 'recipes') {
            setRecipeModalVisible(true);
        } else if (activeTab === 'restaurants') {
            setRestaurantModalVisible(true);
        } else {
            // For plan, maybe scroll to today? Or just do nothing as the + buttons are inline
        }
    };

    const handleRecipeCreated = () => {
        refresh();
    };

    const handleRestaurantCreated = () => {
        refresh();
    };

    if (isInitialLoad) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                <SkeletonList count={4} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <UtensilsCrossed size={24} color={theme.colors.actionPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Meals
                    </Text>
                </View>
                {activeTab !== 'plan' && (
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={handleAddClick}
                    >
                        <Plus size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'plan' && { backgroundColor: theme.colors.actionPrimary }
                    ]}
                    onPress={() => setActiveTab('plan')}
                >
                    <Calendar size={18} color={activeTab === 'plan' ? '#FFFFFF' : theme.colors.textSecondary} />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'plan' ? '#FFFFFF' : theme.colors.textSecondary }
                    ]}>
                        Plan
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'recipes' && { backgroundColor: theme.colors.actionPrimary }
                    ]}
                    onPress={() => setActiveTab('recipes')}
                >
                    <ChefHat size={18} color={activeTab === 'recipes' ? '#FFFFFF' : theme.colors.textSecondary} />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'recipes' ? '#FFFFFF' : theme.colors.textSecondary }
                    ]}>
                        Recipes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'restaurants' && { backgroundColor: theme.colors.actionPrimary }
                    ]}
                    onPress={() => setActiveTab('restaurants')}
                >
                    <MapPin size={18} color={activeTab === 'restaurants' ? '#FFFFFF' : theme.colors.textSecondary} />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'restaurants' ? '#FFFFFF' : theme.colors.textSecondary }
                    ]}>
                        Dining Out
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'plan' ? (
                <WeeklyScheduler refreshTrigger={isRefreshing ? 1 : 0} />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={refresh}
                            tintColor={theme.colors.actionPrimary}
                        />
                    }
                >
                    {activeTab === 'recipes' ? (
                        meals.length > 0 ? (
                            meals.map((meal) => (
                                <View
                                    key={meal.id || meal._id}
                                    style={[styles.itemCard, { backgroundColor: theme.colors.bgSurface }]}
                                >
                                    <View style={styles.itemHeader}>
                                        <ChefHat size={20} color={theme.colors.actionPrimary} />
                                        <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                                            {meal.name}
                                        </Text>
                                    </View>
                                    {meal.description && (
                                        <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
                                            {meal.description}
                                        </Text>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <ChefHat size={48} color={theme.colors.borderSubtle} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    No recipes yet
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                                    Add your family's favorite recipes
                                </Text>
                            </View>
                        )
                    ) : (
                        restaurants.length > 0 ? (
                            restaurants.map((restaurant) => (
                                <View
                                    key={restaurant.id || restaurant._id}
                                    style={[styles.itemCard, { backgroundColor: theme.colors.bgSurface }]}
                                >
                                    <View style={styles.itemHeader}>
                                        <MapPin size={20} color={theme.colors.actionPrimary} />
                                        <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                                            {restaurant.name}
                                        </Text>
                                    </View>
                                    {restaurant.cuisine && (
                                        <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
                                            {restaurant.cuisine}
                                        </Text>
                                    )}
                                    <View style={styles.itemFooter}>
                                        {restaurant.isFavorite && (
                                            <View style={[styles.badge, { backgroundColor: theme.colors.actionPrimary + '20' }]}>
                                                <Text style={[styles.badgeText, { color: theme.colors.actionPrimary }]}>
                                                    Favorite
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MapPin size={48} color={theme.colors.borderSubtle} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    No restaurants yet
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                                    Add your family's favorite places to eat
                                </Text>
                            </View>
                        )
                    )}
                </ScrollView>
            )}

            {/* Modals */}
            <CreateRecipeModal
                visible={recipeModalVisible}
                onClose={() => setRecipeModalVisible(false)}
                onRecipeCreated={handleRecipeCreated}
            />

            <CreateRestaurantModal
                visible={restaurantModalVisible}
                onClose={() => setRestaurantModalVisible(false)}
                onRestaurantCreated={handleRestaurantCreated}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        padding: 16,
        paddingTop: 0,
    },
    itemCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    itemDescription: {
        fontSize: 14,
    },
    itemFooter: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});

