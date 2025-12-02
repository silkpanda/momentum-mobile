import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Utensils } from 'lucide-react-native';
import BentoCard from '../BentoCard';
import { bentoPalette, spacing, typography } from '../../../theme/bentoTokens';

interface MealPlannerWidgetProps {
    style?: ViewStyle;
}

export default function MealPlannerWidget({ style }: MealPlannerWidgetProps) {
    // In a real implementation, we would fetch today's meal from the plan
    const todaysMeal = null; // Placeholder

    return (
        <BentoCard
            size="standard"
            mode="parent"
            onPress={() => console.log('Navigate to Meals')}
            style={style}
        >
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Utensils size={24} color="#F97316" />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>Dinner</Text>
                    <Text style={styles.subtitle} numberOfLines={2}>
                        {todaysMeal ? todaysMeal : 'Tap to plan'}
                    </Text>
                </View>
            </View>
        </BentoCard>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    iconContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF7ED', // Orange-50
        padding: spacing.sm,
        borderRadius: 999,
    },
    content: {
        marginTop: spacing.sm,
    },
    title: {
        ...typography.widgetTitle,
        color: bentoPalette.textPrimary,
    },
    subtitle: {
        ...typography.caption,
        color: bentoPalette.textSecondary,
        textTransform: 'none',
        marginTop: 2,
    },
});
