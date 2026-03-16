// =========================================================
// MemberManagerModal - Manage Family Members
// =========================================================
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Users, Plus, Edit2, Shield, User } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useData } from '../../../../contexts/DataContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { Member } from '../../../../types';
import CreateMemberModal from '../../../parent/CreateMemberModal';
import EditMemberModal from '../../../parent/EditMemberModal';

interface MemberManagerModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function MemberManagerModal({ visible, onClose }: MemberManagerModalProps) {
    const { currentTheme: theme } = useTheme();
    const { members, refresh } = useData();
    const { householdId } = useAuth();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const handleMemberPress = (member: Member) => {
        setEditingMember(member);
    };

    return (
        <>
            <BaseModal
                visible={visible}
                onClose={onClose}
                title="Family Members"
                headerRight={
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Plus size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                }
                scrollable={false}
            >
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                        {members.map((member) => (
                            <TouchableOpacity
                                key={member.id || member._id}
                                style={[
                                    styles.memberCard,
                                    {
                                        backgroundColor: theme.colors.bgSurface,
                                        borderColor: theme.colors.borderSubtle,
                                    },
                                ]}
                                onPress={() => handleMemberPress(member)}
                            >
                                <View style={styles.cardLeft}>
                                    <View
                                        style={[
                                            styles.avatar,
                                            { backgroundColor: member.profileColor || theme.colors.actionPrimary },
                                        ]}
                                    >
                                        <Text style={styles.avatarText}>
                                            {member.firstName.charAt(0)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                                            {member.firstName}
                                        </Text>
                                        <View style={styles.roleContainer}>
                                            {member.role === 'Parent' ? (
                                                <Shield size={12} color={theme.colors.textSecondary} />
                                            ) : (
                                                <User size={12} color={theme.colors.textSecondary} />
                                            )}
                                            <Text style={[styles.role, { color: theme.colors.textSecondary }]}>
                                                {member.role}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <Edit2 size={16} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </BaseModal>

            {/* Create Member Modal */}
            {householdId && (
                <CreateMemberModal
                    visible={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={async () => {
                        await refresh();
                        setShowCreateModal(false);
                    }}
                    householdId={householdId}
                    usedColors={members.map(m => m.profileColor || '')}
                />
            )}

            {/* Edit Member Modal */}
            {householdId && (
                <EditMemberModal
                    visible={!!editingMember}
                    member={editingMember}
                    onClose={() => setEditingMember(null)}
                    onSuccess={async () => {
                        await refresh();
                        setEditingMember(null);
                    }}
                    householdId={householdId}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
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
    listContent: {
        paddingBottom: 20,
        gap: 12,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    role: {
        fontSize: 13,
    },
});
