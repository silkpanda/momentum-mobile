import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2, ChefHat, MapPin } from 'lucide-react-native';
import AddMealModal from './AddMealModal';

interface WeeklySchedulerProps {
    refreshTrigger: number;
}

export default function WeeklyScheduler({ refreshTrigger }: WeeklySchedulerProps) {
    const { currentTheme: theme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start
    const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: Date; type: string } | null>(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    useEffect(() => {
        loadWeeklyPlan();
    }, [weekStart, refreshTrigger]);

    const loadWeeklyPlan = async () => {
        setIsLoading(true);
        try {
            // In a real app, we'd fetch by date range. 
            // For now, we fetch all and find the one matching this week, or create one.
            const response = await api.getMealPlans();
            const plans = response.data?.mealPlans || [];

            const currentWeekPlan = plans.find((p: any) =>
                isSameDay(new Date(p.startDate), weekStart)
            );

            if (currentWeekPlan) {
                setWeeklyPlan(currentWeekPlan);
            } else {
                // No plan for this week? We can create one on the fly or just show empty state
                // Let's try to create one if it doesn't exist
                try {
                    const end = endOfWeek(weekStart, { weekStartsOn: 1 });
                    const createResponse = await api.createMealPlan(weekStart.toISOString(), end.toISOString());
                    setWeeklyPlan(createResponse.data?.mealPlan);
                } catch (err) {
                    console.log('Error creating plan:', err);
                    setWeeklyPlan(null);
                }
            }
        } catch (error) {
            console.error('Error loading meal plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevWeek = () => {
        setWeekStart(addDays(weekStart, -7));
    };

    const handleNextWeek = () => {
        setWeekStart(addDays(weekStart, 7));
    };

    const handleAddMeal = (day: Date, type: string) => {
        setSelectedSlot({ day, type });
        setAddModalVisible(true);
    };

    const handleMealAdded = async (mealData: any) => {
        if (!weeklyPlan || !selectedSlot) return;

        try {
            await api.addMealToPlan(weeklyPlan._id, {
                dayOfWeek: format(selectedSlot.day, 'EEEE'), // 'Monday'
                mealType: selectedSlot.type.toLowerCase() as any,
                ...mealData
            });
            loadWeeklyPlan();
            setAddModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add meal');
        }
    };

    const handleDeleteMeal = async (mealId: string) => {
        if (!weeklyPlan) return;
        try {
            await api.removeMealFromPlan(weeklyPlan._id, mealId);
            loadWeeklyPlan();
        } catch (error) {
            Alert.alert('Error', 'Failed to remove meal');
        }
    };

    const getMealForSlot = (day: string, type: string) => {
        if (!weeklyPlan || !weeklyPlan.meals) return null;
        return weeklyPlan.meals.find((m: any) =>
            m.dayOfWeek === day && m.mealType === type.toLowerCase()
        );
    };

    const renderMealCard = (meal: any) => {
        const isRecipe = meal.itemType === 'recipe';
        const isRestaurant = meal.itemType === 'restaurant';
        const title = meal.customTitle || meal.itemId?.name || 'Unknown Meal';

        return (
            <View style={[styles.mealCard, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}>
                <View style={styles.mealContent}>
                    {isRecipe && <ChefHat size={14} color={theme.colors.actionPrimary} />}
                    {isRestaurant && <MapPin size={14} color={theme.colors.actionPrimary} />}
                    <Text style={[styles.mealTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                        {title}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteMeal(meal._id)} style={styles.deleteBtn}>
                    <Trash2 size={14} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Week Navigation */}
            <View style={styles.weekNav}>
                <TouchableOpacity onPress={handlePrevWeek} style={styles.navBtn}>
                    <ChevronLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.weekText, { color: theme.colors.textPrimary }]}>
                    {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d')}
                </Text>
                <TouchableOpacity onPress={handleNextWeek} style={styles.navBtn}>
                    <ChevronRight size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} style={{ marginTop: 20 }} />
            ) : (
                <ScrollView style={styles.scrollView}>
                    {days.map((dayName, index) => {
                        const dayDate = addDays(weekStart, index);
                        const isToday = isSameDay(dayDate, new Date());

                        return (
                            <View key={dayName} style={[styles.dayContainer, isToday && { backgroundColor: theme.colors.bgSurface }]}>
                                <View style={styles.dayHeader}>
                                    <Text style={[styles.dayName, { color: theme.colors.textPrimary, fontWeight: isToday ? 'bold' : 'normal' }]}>
                                        {dayName}
                                    </Text>
                                    <Text style={[styles.dayDate, { color: theme.colors.textSecondary }]}>
                                        {format(dayDate, 'MMM d')}
                                    </Text>
                                </View>

                                <View style={styles.slotsContainer}>
                                    {mealTypes.map((type) => {
                                        const meal = getMealForSlot(dayName, type);
                                        return (
                                            <View key={type} style={styles.slotRow}>
                                                <Text style={[styles.slotLabel, { color: theme.colors.textSecondary }]}>{type}</Text>
                                                <View style={styles.slotContent}>
                                                    {meal ? (
                                                        renderMealCard(meal)
                                                    ) : (
                                                        <TouchableOpacity
                                                            style={[styles.addSlotBtn, { borderColor: theme.colors.borderSubtle }]}
                                                            onPress={() => handleAddMeal(dayDate, type)}
                                                        >
                                                            <Plus size={16} color={theme.colors.textSecondary} />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            <AddMealModal
                visible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                onAdd={handleMealAdded}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    weekNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    navBtn: {
        padding: 8,
    },
    weekText: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    dayContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dayName: {
        fontSize: 18,
    },
    dayDate: {
        fontSize: 16,
    },
    slotsContainer: {
        gap: 8,
    },
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
    },
    slotLabel: {
        width: 70,
        fontSize: 14,
    },
    slotContent: {
        flex: 1,
    },
    addSlotBtn: {
        height: 36,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    mealContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    mealTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    deleteBtn: {
        padding: 4,
    },
});
