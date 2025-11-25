import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useData } from '../../contexts/DataContext';
import { api } from '../../services/api';
import { Member } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import CreateMemberModal from '../../components/parent/CreateMemberModal';
import EditMemberModal from '../../components/parent/EditMemberModal';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonList } from '../../components/SkeletonLoader';
import { Users, Plus, Edit } from 'lucide-react-native';
import MemberAvatar from '../../components/family/MemberAvatar';

type MembersTabNavigationProp = StackNavigationProp<RootStackParamList>;

export default function MembersTab() {
    const navigation = useNavigation<MembersTabNavigationProp>();
    const { currentTheme: theme } = useTheme();

    // Get data from global cache
    const { members, householdId, isInitialLoad, isRefreshing, refresh } = useData();

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const handleEditPress = (member: Member) => {
        setSelectedMember(member);
        setEditModalVisible(true);
    };

    const renderMemberItem = ({ item }: { item: Member }) => (
        <TouchableOpacity
            style={[styles.memberCard, { backgroundColor: theme.colors.bgSurface }]}
            onPress={() => navigation.navigate('MemberDetail', {
                memberId: item.id || item._id || '',
                userId: item.userId,
                memberName: item.firstName,
                memberColor: item.profileColor,
                memberPoints: item.pointsTotal
            })}
        >
            <MemberAvatar
                name={item.firstName}
                color={item.profileColor}
                size={56}
            />
            <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={[styles.memberRole, { color: theme.colors.textSecondary }]}>
                    {item.role === 'Parent' ? 'Parent' : 'Child'}
                </Text>
                <Text style={[styles.memberPoints, { color: theme.colors.actionPrimary }]}>
                    {item.pointsTotal || 0} points
                </Text>
            </View>
            <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => handleEditPress(item)}
            >
                <Edit size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

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
                    <Users size={24} color={theme.colors.actionPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Family Members
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                    onPress={() => setCreateModalVisible(true)}
                >
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Member</Text>
                </TouchableOpacity>
            </View>

            {/* Members List */}
            <FlatList
                data={members}
                renderItem={renderMemberItem}
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
                        <Users size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No family members yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            Tap "Add Member" to get started
                        </Text>
                    </View>
                }
            />

            {/* Modals */}
            <CreateMemberModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSuccess={refresh}
                householdId={householdId}
            />

            {selectedMember && (
                <EditMemberModal
                    visible={editModalVisible}
                    onClose={() => {
                        setEditModalVisible(false);
                        setSelectedMember(null);
                    }}
                    onSuccess={refresh}
                    member={selectedMember}
                    householdId={householdId}
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
    memberCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        gap: 16,
    },
    memberInfo: {
        flex: 1,
        gap: 4,
    },
    memberName: {
        fontSize: 18,
        fontWeight: '600',
    },
    memberRole: {
        fontSize: 14,
    },
    memberPoints: {
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
