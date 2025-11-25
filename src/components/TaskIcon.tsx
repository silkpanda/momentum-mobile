// src/components/TaskIcon.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getTaskIcon } from '../constants/taskIcons';
import { useTheme } from '../contexts/ThemeContext';

interface TaskIconProps {
    iconName?: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    showBackground?: boolean;
}

export default function TaskIcon({
    iconName,
    size = 24,
    color,
    backgroundColor,
    showBackground = false
}: TaskIconProps) {
    const { currentTheme } = useTheme();
    const taskIcon = getTaskIcon(iconName);
    const IconComponent = taskIcon.component;

    const iconColor = color || taskIcon.color || currentTheme.colors.actionPrimary;
    const bgColor = backgroundColor || (taskIcon.color ? `${taskIcon.color}20` : `${currentTheme.colors.actionPrimary}20`);

    if (showBackground) {
        return (
            <View style={[
                styles.iconContainer,
                {
                    backgroundColor: bgColor,
                    width: size * 1.8,
                    height: size * 1.8,
                    borderRadius: size * 0.9,
                }
            ]}>
                <IconComponent size={size} color={iconColor} />
            </View>
        );
    }

    return <IconComponent size={size} color={iconColor} />;
}

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
