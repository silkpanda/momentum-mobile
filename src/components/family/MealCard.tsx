import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Utensils } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface MealCardProps {
    todaysMeal: { main: string; side: string } | null;
}

export default function MealCard({ todaysMeal }: MealCardProps) {
    const { currentTheme: theme } = useTheme();

    return (
        <View style={[styles.mealCard, { backgroundColor: theme.colors.bgSurface }]}>
            <View style={styles.mealHeader}>
                <Utensils size={24} color={theme.colors.signalSuccess} />
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Today's Menu</Text>
            </View>
            <View style={styles.mealContent}>
                <Text style={[styles.mealMain, { color: theme.colors.textPrimary }]}>
                    {todaysMeal?.main || 'Loading...'}
                </Text>
                <Text style={[styles.mealSide, { color: theme.colors.textSecondary }]}>
                    {todaysMeal?.side || ''}
                </Text>
            </View>
            <TouchableOpacity style={styles.rateMealButton}>
                <Text style={[styles.rateMealText, { color: theme.colors.actionPrimary }]}>Rate Meal</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    mealCard: {
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    mealContent: {
        marginBottom: 16,
    },
    mealMain: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 6,
    },
    mealSide: {
        fontSize: 16,
    },
    rateMealButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    rateMealText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
