import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Flame, Sun, Moon, CloudSun } from 'lucide-react-native';
import BentoCard from '../BentoCard';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { bentoPalette, spacing, typography, animations } from '../../../theme/bentoTokens';

export default function MorningBriefWidget() {
    const { user } = useAuth();
    const { members } = useData();

    // 1. Determine Greeting based on time
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    let Icon = Sun;

    if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
        Icon = CloudSun;
    } else if (hour >= 17) {
        greeting = 'Good Evening';
        Icon = Moon;
    }

    // 2. Find current user's member profile for streak
    // Note: Parent might not have a "member" profile in some setups, but usually they do.
    // If not found, default to 0.
    const currentMember = members.find(m => m.userId === user?._id || m.userId === user?.id);
    const streak = currentMember?.currentStreak || 0;

    // 3. Mock Household Mood (for now)
    const mood = "Energetic";

    return (
        <BentoCard size="hero" mode="parent">
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: bentoPalette.textSecondary }]}>
                            {format(new Date(), 'EEEE, MMMM do')}
                        </Text>
                        <Text style={[styles.title, { color: bentoPalette.textPrimary }]}>
                            {greeting}, {user?.firstName}
                        </Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Icon size={32} color={bentoPalette.brandPrimary} />
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    {/* Streak Badge */}
                    <View style={styles.statBadge}>
                        <Flame size={20} color={bentoPalette.alert} fill={bentoPalette.alert} />
                        <Text style={styles.statValue}>{streak}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>

                    {/* Mood Badge (Placeholder) */}
                    <View style={[styles.statBadge, styles.moodBadge]}>
                        <Text style={styles.statValue}>⚡ {mood}</Text>
                        <Text style={styles.statLabel}>Household Mood</Text>
                    </View>
                </View>
            </View>
        </BentoCard>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greeting: {
        ...typography.caption,
        marginBottom: spacing.xs,
    },
    title: {
        ...typography.heroGreeting,
        fontSize: 24, // Slightly smaller for mobile fit
    },
    iconContainer: {
        backgroundColor: bentoPalette.brandLight + '20', // 20% opacity
        padding: spacing.sm,
        borderRadius: 999,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bentoPalette.canvas,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: 999,
        gap: spacing.xs,
    },
    moodBadge: {
        backgroundColor: bentoPalette.successLight,
    },
    statValue: {
        ...typography.button,
        color: bentoPalette.textPrimary,
    },
    statLabel: {
        ...typography.caption,
        color: bentoPalette.textSecondary,
        textTransform: 'none',
    },
});
