import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, User, Award } from 'lucide-react-native';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';
import { Member } from '../../types';
import CreateMemberModal from '../../components/parent/CreateMemberModal';
import EditMemberModal from '../../components/parent/EditMemberModal';

export default function MembersTab() {
    const theme = themes.calmLight;
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [householdId, setHouseholdId] = useState<string>('');

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await api.getFamilyData();
            if (response.data?.household) {
                setMembers(response.data.household.members || []);
                setHouseholdId(response.data.household.id || response.data.household._id || '');
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleMemberPress = (member: Member) => {
        setEditingMember(member);
    };

    const renderMemberItem = ({ item }: { item: Member }) => (
        <TouchableOpacity
            style={[styles.memberCard, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}
            onPress={() => handleMemberPress(item)}
        >
            <View style={styles.memberInfo}>
                <View style={[styles.avatar, { backgroundColor: item.profileColor || theme.colors.textTertiary }]}>
                    {item.role === 'Parent' ? (
                        <User size={24} color="#FFF" />
                    ) : (
                        <Text style={styles.avatarText}>{item.firstName.charAt(0).toUpperCase()}</Text>
                    )}
                </View>
                <View>
                    <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>{item.firstName}</Text>
                    <Text style={[styles.memberRole, { color: theme.colors.textSecondary }]}>{item.role}</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: theme.colors.actionPrimary }]}>{item.pointsTotal}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <FlatList
                data={members}
                renderItem={renderMemberItem}
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.actionPrimary} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Family Team</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                            Manage your household members
                        </Text>
                    </View>
                }
            />

            {/* FAB to Add Member */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.actionPrimary }]}
                onPress={() => setIsCreateModalOpen(true)}
            >
                <Plus size={24} color="#FFF" />
                <Text style={styles.fabText}>Add Member</Text>
            </TouchableOpacity>

            {/* Modals */}
            <CreateMemberModal
                visible={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
                householdId={householdId}
                usedColors={members.map(m => m.profileColor).filter(Boolean)}
            />

            <EditMemberModal
                visible={!!editingMember}
                member={editingMember}
                onClose={() => setEditingMember(null)}
                onSuccess={fetchData}
                householdId={householdId}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    memberCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberName: {
        fontSize: 18,
        fontWeight: '600',
    },
    memberRole: {
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        alignItems: 'flex-end',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    fabText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});
