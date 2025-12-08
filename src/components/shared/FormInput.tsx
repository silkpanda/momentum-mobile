import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FormInputProps extends TextInputProps {
    label: string;
    icon?: LucideIcon;
    error?: string;
}

export default function FormInput({ label, icon: Icon, error, style, ...props }: FormInputProps) {
    const { currentTheme: theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: theme.colors.bgCanvas,
                    borderColor: error ? theme.colors.signalAlert : theme.colors.borderSubtle,
                }
            ]}>
                {Icon && <Icon size={20} color={theme.colors.textSecondary} style={styles.icon} />}
                <TextInput
                    style={[styles.input, { color: theme.colors.textPrimary }]}
                    placeholderTextColor={theme.colors.textSecondary}
                    {...props}
                />
            </View>
            {error && <Text style={[styles.errorText, { color: theme.colors.signalAlert }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 4,
        height: 56,
    },
    icon: {
        marginLeft: 12,
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 18,
        paddingHorizontal: 12,
        paddingVertical: 0,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
});
