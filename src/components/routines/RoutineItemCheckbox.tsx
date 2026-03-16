// src/components/routines/RoutineItemCheckbox.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RoutineItem } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Check } from 'lucide-react-native';

interface RoutineItemCheckboxProps {
    item: RoutineItem;
    onToggle: () => void;
    disabled?: boolean;
}

export default function RoutineItemCheckbox({ item, onToggle, disabled = false }: RoutineItemCheckboxProps) {
    const { currentTheme: theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { borderBottomColor: theme.colors.borderSubtle }
            ]}
            onPress={onToggle}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.checkbox,
                    {
                        backgroundColor: item.isCompleted ? theme.colors.signalSuccess : theme.colors.bgSurface,
                        borderColor: item.isCompleted ? theme.colors.signalSuccess : theme.colors.borderSubtle,
                    }
                ]}
            >
                {item.isCompleted && (
                    <Check size={18} color="#FFFFFF" strokeWidth={3} />
                )}
            </View>
            <Text
                style={[
                    styles.title,
                    {
                        color: item.isCompleted ? theme.colors.textSecondary : theme.colors.textPrimary,
                        textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                    }
                ]}
            >
                {item.title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        flex: 1,
    },
});
