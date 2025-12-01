import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur'; // Use expo-blur for Expo projects instead of @react-native-community/blur
import { Grid, Plus, User } from 'lucide-react-native';
import { spacing, shadows, bentoPalette, dockConfig } from '../../theme/bentoTokens';

interface FloatingDockProps {
    onHomePress: () => void;
    onCreatePress: () => void;
    onSwitchPress: () => void;
}

export default function FloatingDock({
    onHomePress,
    onCreatePress,
    onSwitchPress,
}: FloatingDockProps) {
    // Use expo-blur which is compatible with Expo Go
    // If platform is android, we might need a fallback if expo-blur doesn't support it well, 
    // but expo-blur usually works or falls back gracefully.
    // However, let's stick to the plan's fallback logic just in case.

    const DockContainer = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: dockConfig.blur, tint: 'light' } : {};

    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' ? (
                <BlurView intensity={dockConfig.blur} tint="light" style={styles.dock}>
                    <DockContent
                        onHomePress={onHomePress}
                        onCreatePress={onCreatePress}
                        onSwitchPress={onSwitchPress}
                    />
                </BlurView>
            ) : (
                <View style={[styles.dock, styles.androidDock]}>
                    <DockContent
                        onHomePress={onHomePress}
                        onCreatePress={onCreatePress}
                        onSwitchPress={onSwitchPress}
                    />
                </View>
            )}
        </View>
    );
}

function DockContent({ onHomePress, onCreatePress, onSwitchPress }: FloatingDockProps) {
    return (
        <>
            <TouchableOpacity style={styles.button} onPress={onHomePress}>
                <Grid size={dockConfig.iconSize} color={bentoPalette.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} onPress={onCreatePress}>
                <Plus size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onSwitchPress}>
                <User size={dockConfig.iconSize} color={bentoPalette.textPrimary} />
            </TouchableOpacity>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: dockConfig.bottomOffset,
        left: spacing.xl,
        right: spacing.xl,
        alignItems: 'center',
    },
    dock: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: dockConfig.height,
        width: '100%', // Ensure it takes full width of container (which is constrained by left/right)
        borderRadius: 999,
        overflow: 'hidden', // Needed for BlurView to respect borderRadius
        ...shadows.float,
    },
    androidDock: {
        backgroundColor: bentoPalette.glassWhite,
        borderWidth: dockConfig.borderWidth,
        borderColor: bentoPalette.glassBorder,
    },
    button: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButton: {
        width: dockConfig.createButtonSize,
        height: dockConfig.createButtonSize,
        borderRadius: dockConfig.createButtonSize / 2,
        backgroundColor: bentoPalette.brandPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
});
