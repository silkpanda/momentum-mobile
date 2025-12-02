import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wallet } from 'lucide-react-native';
import BentoCard from '../BentoCard';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { bentoPalette, spacing, typography } from '../../../theme/bentoTokens';

export default function TheBankWidget() {
    const { user } = useAuth();
    const { members } = useData();

    const currentMember = members.find(m => m.userId === user?._id || m.userId === user?.id);
    const points = currentMember?.pointsTotal || 0;

    return (
        <BentoCard
            size="standard"
            mode="parent"
            onPress={() => console.log('Navigate to Store')}
        >
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Wallet size={24} color={bentoPalette.brandPrimary} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>The Bank</Text>
                    <Text style={styles.points}>{points}</Text>
                    <Text style={styles.subtitle}>pts available</Text>
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
    iconContainer: {
        alignSelf: 'flex-start',
        backgroundColor: bentoPalette.brandLight + '20',
        padding: spacing.sm,
        borderRadius: 999,
    },
    content: {
        marginTop: spacing.sm,
    },
    title: {
        ...typography.caption,
        color: bentoPalette.textSecondary,
        marginBottom: 4,
    },
    points: {
        ...typography.bigNumber,
        fontSize: 28, // Slightly smaller to fit
        color: bentoPalette.textPrimary,
    },
    subtitle: {
        ...typography.caption,
        fontSize: 10,
        color: bentoPalette.textTertiary,
        textTransform: 'none',
    },
});
