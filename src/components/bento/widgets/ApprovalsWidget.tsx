import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import BentoCard from '../BentoCard';
import { useData } from '../../../contexts/DataContext';
import { bentoPalette, spacing, typography } from '../../../theme/bentoTokens';

export default function ApprovalsWidget() {
    const { tasks } = useData();

    // Filter for pending approvals
    const pendingApprovals = tasks.filter(t => t.status === 'PendingApproval');
    const count = pendingApprovals.length;
    const hasPending = count > 0;

    return (
        <BentoCard
            size="standard"
            mode="parent"
            onPress={() => console.log('Navigate to Approvals')}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={[
                        styles.iconContainer,
                        hasPending ? styles.iconAlert : styles.iconSuccess
                    ]}>
                        {hasPending ? (
                            <AlertCircle size={24} color={bentoPalette.alert} />
                        ) : (
                            <CheckCircle size={24} color={bentoPalette.success} />
                        )}
                    </View>
                    {hasPending && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{count}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>Approvals</Text>
                    <Text style={styles.subtitle}>
                        {hasPending
                            ? `${count} item${count === 1 ? '' : 's'} waiting`
                            : 'All caught up!'}
                    </Text>
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
    iconContainer: {
        padding: spacing.sm,
        borderRadius: 999,
    },
    iconAlert: {
        backgroundColor: bentoPalette.alertLight,
    },
    iconSuccess: {
        backgroundColor: bentoPalette.successLight,
    },
    badge: {
        backgroundColor: bentoPalette.alert,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        marginTop: spacing.md,
    },
    title: {
        ...typography.widgetTitle,
        color: bentoPalette.textPrimary,
    },
    subtitle: {
        ...typography.caption,
        color: bentoPalette.textSecondary,
        marginTop: 2,
        textTransform: 'none',
    },
});
