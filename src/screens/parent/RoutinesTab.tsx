import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useData } from '../../contexts/DataContext';
import { Routine } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonList } from '../../components/SkeletonLoader';
import { ListTodo, Plus, Sunrise, Sun, Moon } from 'lucide-react-native';
import CreateRoutineModal from '../../components/routines/CreateRoutineModal';
import EditRoutineModal from '../../components/routines/EditRoutineModal';
import MemberAvatar from '../../components/family/MemberAvatar';

export default function RoutinesTab() {
    const { currentTheme: theme } = useTheme();
    const { routines, members, isInitialLoad, isRefreshing, refresh } = useData();

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

    const handleRoutinePress = (routine: Routine) => {
        setSelectedRoutine(routine);
        setEditModalVisible(true);
    };

    const handleCreateNew = () => {
        setCreateModalVisible(true);
    };

    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setSelectedRoutine(null);
    };

    const getTimeIcon = (timeOfDay: string) => {
        switch (timeOfDay) {
            case 'morning': return <Sunrise size={20} color={theme.colors.actionPrimary} />;
            case 'noon': return <Sun size={20} color={theme.colors.actionPrimary} />;
            case 'night': return <Moon size={20} color={theme.colors.actionPrimary} />;
            default: return <ListTodo size={20} color={theme.colors.actionPrimary} />;
        }
    };

    const renderRoutineItem = ({ item }: { item: Routine }) => {
        const assignedMember = members.find(m => (m.id === item.memberId || m._id === item.memberId));
        const completedCount = item.items?.filter(i => i.isCompleted).length || 0;
        const totalCount = item.items?.length || 0;

        return (
            <TouchableOpacity
                style={[styles.routineCard, { backgroundColor: theme.colors.bgSurface }]}
                onPress={() => handleRoutinePress(item)}
            >
                <View style={styles.routineIcon}>
                    {getTimeIcon(item.timeOfDay)}
                </View>

                <View style={styles.routineInfo}>
                    <Text style={[styles.routineTitle, { color: theme.colors.textPrimary }]}>
                        {item.title}
                    </Text>

                    <View style={styles.routineMeta}>
                        {assignedMember && (
                            <View style={styles.memberChip}>
                                <MemberAvatar
                                    name={assignedMember.firstName}
                                    color={assignedMember.profileColor}
                                    size={20}
                                />
                                <Text style={[styles.memberText, { color: theme.colors.textSecondary }]}>
                                    {assignedMember.firstName}
                                </Text>
                            </View>
                        )}

                        <Text style={[styles.itemCount, { color: theme.colors.textSecondary }]}>
                            {totalCount} {totalCount === 1 ? 'item' : 'items'}
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.progressBadge,
                    { backgroundColor: theme.colors.actionPrimary + '20' }
                ]}>
                    <Text style={[styles.progressText, { color: theme.colors.actionPrimary }]}>
                        {completedCount}/{totalCount}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isInitialLoad) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
                <SkeletonList count={5} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <ListTodo size={24} color={theme.colors.actionPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Routines
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={handleCreateNew}
                >
                    <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Routines List */}
            <FlatList
                data={routines}
                renderItem={renderRoutineItem}
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
                        <ListTodo size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No routines yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            Tap the + button to create your first routine
                        </Text>
                    </View>
                }
            />

            {/* Create Modal */}
            <CreateRoutineModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSuccess={refresh}
            />

            {/* Edit Modal */}
            {selectedRoutine && (
                <EditRoutineModal
                    visible={editModalVisible}
                    onClose={handleCloseEditModal}
                    routine={selectedRoutine}
                    onSuccess={refresh}
                />
            )}
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
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    routineCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        gap: 12,
    },
    routineIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    routineInfo: {
        flex: 1,
        gap: 6,
    },
    routineTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    routineMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    memberChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    memberText: {
        fontSize: 13,
    },
    itemCount: {
        fontSize: 13,
    },
    progressBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    progressText: {
        fontSize: 14,
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
    },
});
