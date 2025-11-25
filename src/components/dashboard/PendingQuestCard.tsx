// src/components/dashboard/PendingQuestCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, Clock, Map as MapIcon } from 'lucide-react-native';
import { Quest, QuestClaim } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface PendingQuestCardProps {
    quest: Quest;
    memberName: string;
    memberId: string;
    onApprove: () => void;
    onReject: () => void;
}

export default function PendingQuestCard({ quest, memberName, onApprove, onReject }: PendingQuestCardProps) {
    const { currentTheme: theme } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
            <View style={styles.info}>
                <View style={styles.typeRow}>
                    <MapIcon size={14} color={theme.colors.actionPrimary} />
                    <Text style={[styles.typeLabel, { color: theme.colors.actionPrimary }]}>QUEST</Text>
                </View>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                    {quest.title}
                </Text>
                <Text style={[styles.memberName, { color: theme.colors.textSecondary }]}>
                    by {memberName}
                </Text>
                <View style={styles.meta}>
                    <Text style={[styles.points, { color: theme.colors.actionPrimary }]}>
                        +{quest.pointsValue || 0} pts
                    </Text>
                    <View style={styles.statusBadge}>
                        <Clock size={12} color="#F59E0B" />
                        <Text style={[styles.statusText, { color: '#F59E0B' }]}>Pending</Text>
                    </View>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.colors.signalAlert + '20' }]}
                    onPress={onReject}
                >
                    <XCircle size={20} color={theme.colors.signalAlert} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.colors.signalSuccess + '20' }]}
                    onPress={onApprove}
                >
                    <CheckCircle size={20} color={theme.colors.signalSuccess} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    info: {
        flex: 1,
        gap: 6,
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    typeLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    memberName: {
        fontSize: 13,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    points: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actions: {
        gap: 8,
        justifyContent: 'center',
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
