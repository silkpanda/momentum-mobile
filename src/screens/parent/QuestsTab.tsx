import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useData } from '../../contexts/DataContext';
import { Quest } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonList } from '../../components/SkeletonLoader';
import { Map, Plus, Users } from 'lucide-react-native';
import CreateQuestModal from '../../components/parent/CreateQuestModal';

export default function QuestsTab() {
    const { currentTheme: theme } = useTheme();

    // Get data from global cache
    const { quests, isInitialLoad, isRefreshing, refresh } = useData();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

    const handleQuestPress = (quest: Quest) => {
        setSelectedQuest(quest);
        setModalVisible(true);
    };

    const handleCreateNew = () => {
        setSelectedQuest(null);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedQuest(null);
    };

    const renderQuestItem = ({ item }: { item: Quest }) => {
        const claimedCount = item.claims?.length || 0;
        const completedCount = item.claims?.filter(c => c.status === 'completed' || c.status === 'approved').length || 0;

        return (
            <TouchableOpacity
                style={[styles.questCard, { backgroundColor: theme.colors.bgSurface }]}
                onPress={() => handleQuestPress(item)}
            >
                <View style={styles.questHeader}>
                    <Map size={20} color={theme.colors.actionPrimary} />
                    <Text style={[styles.questTitle, { color: theme.colors.textPrimary }]}>
                        {item.title}
                    </Text>
                </View>

                {item.description && (
                    <Text style={[styles.questDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.questFooter}>
                    <View style={styles.questMeta}>
                        <Text style={[styles.questPoints, { color: theme.colors.actionPrimary }]}>
                            {item.pointsValue || 0} pts
                        </Text>
                        {claimedCount > 0 && (
                            <View style={styles.claimsContainer}>
                                <Users size={14} color={theme.colors.textSecondary} />
                                <Text style={[styles.claimsText, { color: theme.colors.textSecondary }]}>
                                    {completedCount}/{claimedCount} completed
                                </Text>
                            </View>
                        )}
                    </View>

                    {item.isActive ? (
                        <View style={[styles.statusBadge, { backgroundColor: '#10B981' + '20' }]}>
                            <Text style={[styles.statusText, { color: '#10B981' }]}>Active</Text>
                        </View>
                    ) : (
                        <View style={[styles.statusBadge, { backgroundColor: '#6B7280' + '20' }]}>
                            <Text style={[styles.statusText, { color: '#6B7280' }]}>Inactive</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (isInitialLoad) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                <SkeletonList count={4} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Map size={24} color={theme.colors.actionPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Quests
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={handleCreateNew}
                >
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>New Quest</Text>
                </TouchableOpacity>
            </View>

            {/* Quests List */}
            <FlatList
                data={quests}
                renderItem={renderQuestItem}
                keyExtractor={(item) => item.id || item._id || ''}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        tintColor={theme.colors.actionPrimary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Map size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No quests yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            Create special challenges for your family
                        </Text>
                    </View>
                }
            />

            {/* Combined Create/Edit Modal */}
            <CreateQuestModal
                visible={modalVisible}
                onClose={handleCloseModal}
                onQuestCreated={refresh}
                initialQuest={selectedQuest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    questCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    questHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    questTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    questDescription: {
        fontSize: 14,
    },
    questFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questMeta: {
        flex: 1,
        gap: 8,
    },
    questPoints: {
        fontSize: 16,
        fontWeight: '600',
    },
    claimsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    claimsText: {
        fontSize: 13,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
