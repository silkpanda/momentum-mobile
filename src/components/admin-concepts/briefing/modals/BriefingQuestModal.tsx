// =========================================================
// BriefingQuestModal - Quest Management for Morning Briefing
// =========================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Scroll, Plus, Map, Trophy } from 'lucide-react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import BriefingBaseModal from './BriefingBaseModal';

interface BriefingQuestModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function BriefingQuestModal({ visible, onClose }: BriefingQuestModalProps) {
    const { currentTheme: theme } = useTheme();
    const { quests } = useData();

    const renderQuestItem = ({ item }: { item: typeof quests[0] }) => (
        <View style={[styles.questCard, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}>
            <View style={styles.questHeader}>
                <Trophy size={20} color={theme.colors.actionPrimary} />
                <Text style={[styles.questTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
            </View>
            <Text style={[styles.questDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {item.description}
            </Text>
            <View style={styles.questFooter}>
                <View style={[styles.rewardBadge, { backgroundColor: theme.colors.bgCanvas }]}>
                    <Text style={[styles.rewardText, { color: theme.colors.actionPrimary }]}>
                        {item.rewardPoints} PTS
                    </Text>
                </View>
                {item.xpReward > 0 && (
                    <View style={[styles.rewardBadge, { backgroundColor: theme.colors.bgCanvas, marginLeft: 8 }]}>
                        <Text style={[styles.rewardText, { color: theme.colors.actionSecondary || theme.colors.actionPrimary }]}>
                            {item.xpReward} XP
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <BriefingBaseModal
            visible={visible}
            onClose={onClose}
            title="Active Quests"
            scrollable={false}
            headerRight={
                <TouchableOpacity>
                    <Plus size={24} color={theme.colors.actionPrimary} />
                </TouchableOpacity>
            }
        >
            <View style={styles.container}>
                {quests.length > 0 ? (
                    <FlatList
                        data={quests}
                        renderItem={renderQuestItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Map size={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No active quests.
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                            The map is blank. Start a new adventure!
                        </Text>
                    </View>
                )}
            </View>
        </BriefingBaseModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 10,
    },
    questCard: {
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderRadius: 4, // Slightly rounded for cards
    },
    questHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    questTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'System', // Keep system font for readability in cards
    },
    questDesc: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    questFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rewardBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    rewardText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
