import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle, Pencil, Trash2 } from 'lucide-react-native';
import { themes } from '../../theme/colors';
import MemberAvatar from '../family/MemberAvatar';

interface TaskCardProps {
    task: any;
    onPress?: () => void;
    onComplete?: () => void;
    onEdit?: (task: any) => void;
    onDelete?: (task: any) => void;
    members?: any[];
}

export default function TaskCard({ task, onPress, onComplete, onEdit, onDelete, members = [] }: TaskCardProps) {
    const theme = themes.calmLight;
    const isCompleted = task.status === 'Approved';
    const isPendingApproval = task.status === 'PendingApproval';
    const isPending = task.status === 'Pending';

    const assignedMembers = members.filter(m =>
        task.assignedTo && task.assignedTo.includes(m.id || m._id)
    );

    const handleCardPress = () => {
        if (isPending && onComplete) {
            onComplete();
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}
            onPress={handleCardPress}
            activeOpacity={0.7}
            disabled={isPendingApproval}
        >
            <View style={styles.checkContainer}>
                {isCompleted ? (
                    <CheckCircle size={24} color={theme.colors.signalSuccess} />
                ) : isPendingApproval ? (
                    <Circle size={24} color="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                ) : (
                    <Circle size={24} color={theme.colors.borderSubtle} />
                )}
            </View>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        { color: theme.colors.textPrimary },
                        isCompleted && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }
                    ]}
                >
                    {task.title}
                </Text>
                <View style={styles.bottomRow}>
                    {task.pointsValue && (
                        <Text style={[styles.points, { color: theme.colors.actionPrimary }]}>
                            +{task.pointsValue} pts
                        </Text>
                    )}
                    {isPendingApproval && (
                        <Text style={[styles.statusBadge, { color: '#F59E0B' }]}>
                            ⏳ Waiting for approval
                        </Text>
                    )}
                </View>

                {assignedMembers.length > 0 && (
                    <View style={styles.assignees}>
                        {assignedMembers.map(member => (
                            <View key={member.id || member._id} style={styles.avatarContainer}>
                                <MemberAvatar
                                    name={member.firstName}
                                    color={member.profileColor}
                                    size={24}
                                    showName={false}
                                />
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.actions}>
                {onEdit && (
                    <TouchableOpacity
                        onPress={() => onEdit(task)}
                        style={styles.actionButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Pencil size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity
                        onPress={() => onDelete(task)}
                        style={[styles.actionButton, { marginLeft: 8 }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Trash2 size={20} color={theme.colors.signalAlert || '#EF4444'} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    checkContainer: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    points: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: '500',
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    actionButton: {
        padding: 8,
    },
    assignees: {
        flexDirection: 'row',
        marginTop: 8,
        flexWrap: 'wrap',
    },
    avatarContainer: {
        marginRight: -8, // Overlap effect
    }
});
