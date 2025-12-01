import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import { spacing, shadows, borderRadius, bentoPalette, widgetSizes } from '../../theme/bentoTokens';

interface BentoCardProps {
    size: 'hero' | 'standard' | 'wide' | 'tall';
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
}

export default function BentoCard({ size, children, onPress, style }: BentoCardProps) {
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            damping: 15,
            stiffness: 200,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={[styles.container, styles[size], style]}
        >
            <Animated.View
                style={[
                    styles.card,
                    { transform: [{ scale }] }
                ]}
            >
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: widgetSizes.gutter,
    },
    card: {
        flex: 1,
        backgroundColor: bentoPalette.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.soft,
        overflow: 'hidden',
    },
    // Sizing logic will be handled by the Grid, but we define base aspect ratios or flex properties here if needed.
    // Actually, the grid usually controls the width. The card just fills it.
    // However, for 'hero' and 'wide' they span 2 columns.
    hero: {
        // Spans 2 columns
        width: '100%',
        aspectRatio: widgetSizes.aspectRatios.hero,
    },
    standard: {
        // Spans 1 column
        width: '47%', // Approx half minus gutter/2. Better handled by parent flex/grid, but this is a simple start.
        aspectRatio: widgetSizes.aspectRatios.standard,
    },
    wide: {
        // Spans 2 columns
        width: '100%',
        aspectRatio: widgetSizes.aspectRatios.wide,
    },
    tall: {
        // Spans 1 column
        width: '47%',
        aspectRatio: widgetSizes.aspectRatios.tall,
    },
});
