// =========================================================
// RoutineManagerModal - Manage Family Routines
// =========================================================
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Search, X, Plus, Edit2, Trash2, Calendar, Sunrise, Sun, Moon, CheckCircle } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { api } from '../../../../services/api';
import { Routine } from '../../../../types';
import EditRoutineModal from './EditRoutineModal';

interface RoutineManagerModalProps {
    visible: boolean;
    onClose: () => void;
}

type TimeFilter = 'all' | 'morning' | 'noon' | 'night';

const TIME_FILTERS: { id: TimeFilter; label: string; icon: any }[] = [
    { id: 'all', label: 'All Times', icon: Calendar },
    { id: 'morning', label: 'Morning', icon: Sunrise },
    { id: 'noon', label: 'Noon', icon: Sun },
    { id: 'night', label: 'Night', icon: Moon },
];

export default function RoutineManagerModal({ visible, onClose }: RoutineManagerModalProps) {
    const { currentTheme: theme } = useTheme();
    const { routines, members, refresh, isRefreshing } = useData();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>('all');
    const [activeMemberFilter, setActiveMemberFilter] = useState<string>('all');
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Filter routines
    const filteredRoutines = useMemo(() => {
        return routines
            .filter((routine) => {
                // Apply time filter
                if (activeTimeFilter !== 'all' && routine.timeOfDay !== activeTimeFilter) return false;

                // Apply member filter
                if (activeMemberFilter !== 'all' && routine.memberId !== activeMemberFilter) return false;

                return true;
            })
            .filter((routine) => {
                // Apply search
                if (!searchQuery) return true;
                return routine.title.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => {
                // Sort by time of day (morning -> noon -> night)
                const timeOrder = { morning: 0, noon: 1, night: 2 };
                return (timeOrder[a.timeOfDay] || 0) - (timeOrder[b.timeOfDay] || 0);
            });
    }, [routines, activeTimeFilter, activeMemberFilter, searchQuery]);

    // Render routine card
    const renderRoutine = ({ item }: { item: Routine }) => {
        const member = members.find(m => m.id === item.memberId || m._id === item.memberId);
        const TimeIcon = item.timeOfDay === 'morning' ? Sunrise : item.timeOfDay === 'noon' ? Sun : Moon;
        const timeColor = item.timeOfDay === 'morning' ? '#F59E0B' : item.timeOfDay === 'noon' ? '#F97316' : '#8B5CF6';

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.colors.bgSurface,
                        borderColor: theme.colors.borderSubtle,
                    },
                ]}
                onPress={() => {
                    setEditingRoutine(item);
                    setShowEditModal(true);
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: timeColor + '20' }]}>
                        <TimeIcon size={20} color={timeColor} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={[styles.routineTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.memberName, { color: theme.colors.textSecondary }]}>
                            {member ? member.firstName : 'Unknown Member'}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

                <View style={styles.cardContent}>
                    <View style={styles.statRow}>
                        <CheckCircle size={14} color={theme.colors.textSecondary} />
                        <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                            {item.items.length} items
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title="Routine Manager"
            scrollable={false}
            headerRight={
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={() => {
                        setEditingRoutine(null);
                        setShowEditModal(true);
                    }}
                >
                    <Plus size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Create</Text>
                </TouchableOpacity>
            }
        >
            <View style={styles.container}>
                {/* Search Bar */}
                <View style={[styles.searchBar, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }]}>
                    <Search size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                        placeholder="Search routines..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={16} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Member Filters */}
                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: activeMemberFilter === 'all' ? theme.colors.textPrimary : theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                },
                            ]}
                            onPress={() => setActiveMemberFilter('all')}
                        >
                            <Text style={[styles.filterText, { color: activeMemberFilter === 'all' ? theme.colors.bgCanvas : theme.colors.textPrimary }]}>
                                All Members
                            </Text>
                        </TouchableOpacity>
                        {members.map(member => (
                            <TouchableOpacity
                                key={member.id || member._id}
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: activeMemberFilter === (member.id || member._id) ? member.profileColor : theme.colors.bgCanvas,
                                        borderColor: theme.colors.borderSubtle,
                                    },
                                ]}
                                onPress={() => setActiveMemberFilter(member.id || member._id || '')}
                            >
                                <Text style={[
                                    styles.filterText,
                                    { color: activeMemberFilter === (member.id || member._id) ? '#FFF' : theme.colors.textPrimary }
                                ]}>
                                    {member.firstName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Filters */}
                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {TIME_FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: activeTimeFilter === filter.id ? theme.colors.actionPrimary : theme.colors.bgCanvas,
                                        borderColor: activeTimeFilter === filter.id ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                    },
                                ]}
                                onPress={() => setActiveTimeFilter(filter.id)}
                            >
                                <filter.icon size={14} color={activeTimeFilter === filter.id ? '#FFF' : theme.colors.textSecondary} />
                                <Text
                                    style={[
                                        styles.filterText,
                                        { color: activeTimeFilter === filter.id ? '#FFF' : theme.colors.textSecondary },
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Routines List */}
                {isRefreshing && routines.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredRoutines}
                        renderItem={renderRoutine}
                        keyExtractor={(item) => item._id || item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Calendar size={48} color={theme.colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    {searchQuery ? 'No routines found' : 'No routines yet'}
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                                    Create a routine to help structure the day
                                </Text>
                            </View>
                        }
                    />
                )}

                {/* Edit Modal */}
                <EditRoutineModal
                    visible={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    routine={editingRoutine}
                    onSaved={async () => {
                        await refresh();
                        setShowEditModal(false);
                    }}
                />
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    filterSection: {
        height: 36,
    },
    filterScroll: {
        gap: 8,
        paddingHorizontal: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
        gap: 12,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
    },
    routineTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    memberName: {
        fontSize: 13,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
