import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { Star, ChefHat, MapPin } from 'lucide-react-native';

interface MealRatingModalProps {
    visible: boolean;
    meal: any;
    onClose: () => void;
    onRated: () => void;
}

export default function MealRatingModal({ visible, meal, onClose, onRated }: MealRatingModalProps) {
    const { currentTheme: theme } = useTheme();
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!meal) return null;

    const handleRate = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            await api.rateMeal(meal._id, rating);
            onRated();
        } catch (error) {
            console.error('Error rating meal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = meal.customTitle || meal.itemId?.name || 'Unknown Meal';
    const isRecipe = meal.itemType === 'Recipe' || meal.itemType === 'recipe';
    const isRestaurant = meal.itemType === 'Restaurant' || meal.itemType === 'restaurant';

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={() => { }}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                    <Text style={[styles.header, { color: theme.colors.textPrimary }]}>
                        How was {meal.mealType}?
                    </Text>

                    <View style={styles.mealInfo}>
                        {isRecipe && <ChefHat size={24} color={theme.colors.actionPrimary} />}
                        {isRestaurant && <MapPin size={24} color={theme.colors.actionPrimary} />}
                        <Text style={[styles.mealTitle, { color: theme.colors.textPrimary }]}>
                            {title}
                        </Text>
                    </View>

                    <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
                        Rate this meal to complete your profile check-in!
                    </Text>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Star
                                    size={40}
                                    color={star <= rating ? '#FFD700' : theme.colors.borderSubtle}
                                    fill={star <= rating ? '#FFD700' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            { backgroundColor: rating > 0 ? theme.colors.actionPrimary : theme.colors.borderSubtle }
                        ]}
                        disabled={rating === 0 || isSubmitting}
                        onPress={handleRate}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>Submit Rating</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        gap: 16,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    mealInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 8,
    },
    mealTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    subtext: {
        textAlign: 'center',
        fontSize: 14,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginVertical: 16,
    },
    submitBtn: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
