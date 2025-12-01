import React from 'react';
import { ScrollView, View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, bentoPalette, widgetSizes } from '../../theme/bentoTokens';

interface BentoGridProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function BentoGrid({ children, style }: BentoGridProps) {
    return (
        <ScrollView
            style={[styles.canvas, style]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.grid}>
                {children}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    canvas: {
        flex: 1,
        backgroundColor: bentoPalette.canvas,
    },
    contentContainer: {
        paddingTop: widgetSizes.outerPadding,
        paddingHorizontal: widgetSizes.outerPadding,
        paddingBottom: 120, // Space for FloatingDock
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        // gap is supported in React Native 0.71+
        gap: widgetSizes.gutter,
    },
});
