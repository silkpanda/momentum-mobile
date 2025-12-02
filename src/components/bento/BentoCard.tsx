
import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import { spacing, shadows, borderRadius, bentoPalette, widgetSizes, animations } from '../../theme/bentoTokens';

interface BentoCardProps {
    size: 'hero' | 'standard' | 'wide' | 'tall';
    mode?: 'parent' | 'family'; // Default to 'parent'
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
}

export default function BentoCard({ size, mode = 'parent', children, onPress, style }: BentoCardProps) {
    const scale = React.useRef(new Animated.Value(1)).current;

    // Determine physics based on mode
    const pressScale = mode === 'family' ? animations.squishPress.pressed : animations.scalePress.pressed;
    const springConfig = mode === 'family' ? animations.bouncySpring : animations.springBounce;
    const cardRadius = mode === 'family' ? borderRadius.round : borderRadius.xl;
    const cardShadow = mode === 'family' ? shadows.float : shadows.soft;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: pressScale,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            ...springConfig,
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
                    {
                        borderRadius: cardRadius,
                        ...cardShadow,
                        transform: [{ scale }]
                    }
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
        padding: spacing.xl,
        overflow: 'hidden', // Ensure content respects rounded corners
    },
    // Sizing logic
    hero: {
        width: '100%',
        aspectRatio: widgetSizes.aspectRatios.hero,
    },
    standard: {
        width: '47%',
        aspectRatio: widgetSizes.aspectRatios.standard,
    },
    wide: {
        width: '100%',
        aspectRatio: widgetSizes.aspectRatios.wide,
    },
    tall: {
        width: '47%',
        aspectRatio: widgetSizes.aspectRatios.tall,
    },
});

