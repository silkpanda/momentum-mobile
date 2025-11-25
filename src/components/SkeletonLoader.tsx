// src/components/SkeletonLoader.tsx
import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonLoaderProps) {
    const { currentTheme } = useTheme();
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: currentTheme.colors.borderSubtle,
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function SkeletonCard() {
    const { currentTheme } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: currentTheme.colors.bgSurface }]}>
            <SkeletonBox width={48} height={48} borderRadius={24} style={{ marginBottom: 12 }} />
            <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBox width="60%" height={14} />
        </View>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <View style={styles.list}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </View>
    );
}

export function DashboardSkeleton() {
    const { currentTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={styles.section}>
                <SkeletonBox width={150} height={24} style={{ marginBottom: 8 }} />
                <SkeletonBox width={200} height={14} />
            </View>

            {/* Pending Approvals Section */}
            <View style={styles.section}>
                <SkeletonBox width={180} height={20} style={{ marginBottom: 12 }} />
                <SkeletonCard />
                <SkeletonCard />
            </View>

            {/* Family Members Section */}
            <View style={styles.section}>
                <SkeletonBox width={160} height={20} style={{ marginBottom: 12 }} />
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <SkeletonBox width="100%" height={120} borderRadius={12} />
                    </View>
                    <View style={styles.gridItem}>
                        <SkeletonBox width="100%" height={120} borderRadius={12} />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    list: {
        gap: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridItem: {
        width: '48%',
    },
});
