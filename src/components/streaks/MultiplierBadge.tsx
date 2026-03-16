// src/components/streaks/MultiplierBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface MultiplierBadgeProps {
    multiplier: number;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
}

export default function MultiplierBadge({
    multiplier = 1.0,
    size = 'medium',
    showLabel = true
}: MultiplierBadgeProps) {
    const { currentTheme: theme } = useTheme();

    const sizeStyles = {
        small: { container: 60, icon: 16, text: 16, label: 10 },
        medium: { container: 80, icon: 20, text: 20, label: 12 },
        large: { container: 100, icon: 24, text: 24, label: 14 },
    };

    const sizes = sizeStyles[size];

    // Color based on multiplier level
    const getMultiplierColor = () => {
        if (multiplier >= 3.0) return '#F59E0B'; // Gold
        if (multiplier >= 2.5) return '#8B5CF6'; // Purple
        if (multiplier >= 2.0) return '#EF4444'; // Red
        if (multiplier >= 1.5) return '#F97316'; // Orange
        return theme.colors.textSecondary; // Default
    };

    const multiplierColor = getMultiplierColor();
    const isActive = multiplier > 1.0;

    return (
        <View style={[
            styles.container,
            {
                width: sizes.container,
                height: sizes.container,
                backgroundColor: isActive ? multiplierColor + '15' : theme.colors.bgSurface,
                borderColor: isActive ? multiplierColor : theme.colors.borderSubtle,
            }
        ]}>
            <Zap
                size={sizes.icon}
                color={multiplierColor}
                fill={isActive ? multiplierColor : 'transparent'}
            />
            <Text style={[
                styles.multiplierText,
                {
                    fontSize: sizes.text,
                    color: multiplierColor,
                    fontWeight: isActive ? 'bold' : '600',
                }
            ]}>
                {multiplier.toFixed(1)}x
            </Text>
            {showLabel && (
                <Text style={[styles.label, { fontSize: sizes.label, color: theme.colors.textTertiary }]}>
                    {isActive ? 'BOOST' : 'BASE'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        gap: 2,
    },
    multiplierText: {
        fontWeight: 'bold',
    },
    label: {
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
