import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Target, Star, Link } from 'lucide-react-native';
import MemberAvatar from './MemberAvatar';
import { Member, Task } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface MemberColumnProps {
    member: Member;
    allTasks: Task[];
    onPress: (member: Member) => void;
}

export default function MemberColumn({ member, allTasks, onPress }: MemberColumnProps) {
    const { currentTheme: theme } = useTheme();

    // Filter tasks assigned to this member
    const memberTasks = allTasks.filter((t: Task) => {
        if (!t.assignedTo || t.assignedTo.length === 0) return false;
        if (t.status !== 'Pending' && t.status !== 'PendingApproval') return false;

        const firstItem = t.assignedTo[0];
        if (typeof firstItem === 'string') {
            return t.assignedTo.includes(member.id);
        } else {
            return t.assignedTo.some((assigned: any) => assigned._id === member.id || assigned.id === member.id);
        }
    });

    // Check if member is in focus mode
    const isFocusMode = !!member.focusedTaskId;
    const focusedTask = isFocusMode
        ? allTasks.find(t => (t._id || t.id) === member.focusedTaskId)
        : null;

    return (
        <TouchableOpacity
            style={[
                styles.memberColumn,
                { backgroundColor: isFocusMode ? theme.colors.actionPrimary : theme.colors.bgSurface }
            ]}
            onPress={() => onPress(member)}
            activeOpacity={0.9}
        >
            <View style={styles.columnHeader}>
                <View style={styles.avatarContainer}>
                    <MemberAvatar
                        name={`${member.firstName} ${member.lastName || ''}`.trim()}
                        color={member.profileColor}
                        size={56}
                    />
                    {member.isLinkedChild && (
                        <View style={[styles.linkBadge, { backgroundColor: theme.colors.actionPrimary }]}>
                            <Link size={12} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                    )}
                </View>
                <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.memberName, { color: isFocusMode ? '#FFFFFF' : theme.colors.textPrimary }]}>
                            {member.firstName}
                        </Text>
                    </View>
                    <View style={styles.pointsRow}>
                        <Star size={12} color={isFocusMode ? '#FFFFFF' : theme.colors.actionPrimary} fill={isFocusMode ? '#FFFFFF' : theme.colors.actionPrimary} />
                        <Text style={[styles.memberPoints, { color: isFocusMode ? '#FFFFFF' : theme.colors.textSecondary }]}>
                            {member.pointsTotal || 0} points
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.tasksContainer}>
                {isFocusMode && focusedTask ? (
                    <View style={styles.focusTask}>
                        <View style={styles.targetIcon}>
                            <Target size={32} color="#FFFFFF" strokeWidth={3} />
                        </View>
                        <Text style={styles.focusTaskTitle}>
                            {focusedTask.title}
                        </Text>
                        {focusedTask.description && (
                            <Text style={styles.focusTaskDescription} numberOfLines={2}>
                                {focusedTask.description}
                            </Text>
                        )}
                        <Text style={styles.focusPoints}>
                            {focusedTask.value} points
                        </Text>
                    </View>
                ) : (
                    <>
                        {memberTasks.slice(0, 3).map((task: Task) => (
                            <View key={task._id || task.id} style={styles.taskItem}>
                                <View style={[styles.taskBullet, { backgroundColor: member.profileColor }]} />
                                <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                    {task.title}
                                </Text>
                            </View>
                        ))}
                        {memberTasks.length > 3 && (
                            <Text style={[styles.moreTasks, { color: theme.colors.textSecondary }]}>
                                + {memberTasks.length - 3} more
                            </Text>
                        )}
                        {memberTasks.length === 0 && (
                            <View style={styles.emptyTasks}>
                                <CheckCircle size={32} color={theme.colors.signalSuccess} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    All done!
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    memberColumn: {
        width: 240,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        minHeight: 220,
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    linkBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    memberName: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 3,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberPoints: {
        fontSize: 13,
        fontWeight: '500',
    },
    tasksContainer: {
        flex: 1,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    taskBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    moreTasks: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
        marginLeft: 16,
    },
    emptyTasks: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '500',
    },
    // Focus mode - clean and simple
    focusTask: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    targetIcon: {
        marginBottom: 8,
    },
    focusTaskTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        color: '#FFFFFF',
        lineHeight: 24,
    },
    focusTaskDescription: {
        fontSize: 14,
        textAlign: 'center',
        color: '#FFFFFF',
        opacity: 0.9,
        lineHeight: 20,
    },
    focusPoints: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 4,
    },
});
