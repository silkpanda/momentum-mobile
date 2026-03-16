// src/components/pin/PINKeypad.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Platform } from 'react-native';
import { Delete } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface PINKeypadProps {
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
}

const PINKeypad: React.FC<PINKeypadProps> = ({ onKeyPress, onBackspace }) => {
    const { currentTheme: theme } = useTheme();

    const handlePress = (key: string) => {
        // Haptic feedback
        if (Platform.OS !== 'web') {
            Vibration.vibrate(10);
        }
        onKeyPress(key);
    };

    const handleBackspace = () => {
        if (Platform.OS !== 'web') {
            Vibration.vibrate(10);
        }
        onBackspace();
    };

    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'backspace'],
    ];

    return (
        <View style={styles.container}>
            {keys.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((key, keyIndex) => {
                        if (key === '') {
                            return <View key={keyIndex} style={styles.key} />;
                        }

                        if (key === 'backspace') {
                            return (
                                <TouchableOpacity
                                    key={keyIndex}
                                    style={[styles.key, { backgroundColor: theme.colors.bgSurface }]}
                                    onPress={handleBackspace}
                                    activeOpacity={0.7}
                                >
                                    <Delete size={24} color={theme.colors.textPrimary} />
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <TouchableOpacity
                                key={keyIndex}
                                style={[styles.key, { backgroundColor: theme.colors.bgSurface }]}
                                onPress={() => handlePress(key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>
                                    {key}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 300,
        alignSelf: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    key: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    keyText: {
        fontSize: 28,
        fontWeight: '600',
    },
});

export default PINKeypad;
