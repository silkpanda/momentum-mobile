// src/components/common/Text.tsx
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { textStyles, TextStylePreset } from '../../theme/typography';
import { useTheme } from '../../contexts/ThemeContext';

interface TextProps extends RNTextProps {
    variant?: TextStylePreset;
    color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'alert' | 'action';
    children: React.ReactNode;
}

/**
 * Text Component
 * 
 * A themed text component that uses the unified typography system.
 * Automatically applies the correct font family, size, and color based on the variant.
 * 
 * @example
 * <Text variant="h1" color="primary">Welcome</Text>
 * <Text variant="body" color="secondary">This is body text</Text>
 * <Text variant="button">Click Me</Text>
 */
export default function Text({ variant = 'body', color = 'primary', style, children, ...props }: TextProps) {
    const { currentTheme } = useTheme();

    // Get color from theme
    const getColor = () => {
        switch (color) {
            case 'primary':
                return currentTheme.colors.textPrimary;
            case 'secondary':
                return currentTheme.colors.textSecondary;
            case 'tertiary':
                return currentTheme.colors.textTertiary;
            case 'success':
                return currentTheme.colors.signalSuccess;
            case 'alert':
                return currentTheme.colors.signalAlert;
            case 'action':
                return currentTheme.colors.actionPrimary;
            default:
                return currentTheme.colors.textPrimary;
        }
    };

    return (
        <RNText
            style={[
                textStyles[variant],
                { color: getColor() },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
}
