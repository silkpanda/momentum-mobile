// src/components/pin/PINPromptBanner.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface PINPromptBannerProps {
    onSetupPress: () => void;
    onDismiss: () => void;
}

const PINPromptBanner: React.FC<PINPromptBannerProps> = ({ onSetupPress, onDismiss }) => {
    const { currentTheme: theme } = useTheme();

    return (
        <View style={[styles.banner, { backgroundColor: theme.colors.actionPrimary }]}>
            <Shield size={20} color="#FFFFFF" />
            <View style={styles.textContainer}>
                <Text style={styles.title}>Secure your account</Text>
                <Text style={styles.subtitle}>Set up a 4-digit PIN for quick access</Text>
            </View>
            <TouchableOpacity onPress={onSetupPress} style={styles.button}>
                <Text style={styles.buttonText}>Set Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
});

export default PINPromptBanner;
