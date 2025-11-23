import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Target, Star } from 'lucide-react-native';
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
    // NOTE: assignedTo can be string[] (IDs) or object[] (populated with {_id, displayName, profileColor})
    const memberTasks = allTasks.filter((t: Task) => {
        if (!t.assignedTo || t.assignedTo.length === 0) return false;
        if (t.status !== 'Pending' && t.status !== 'PendingApproval') return false;

        // Check if assignedTo is populated (objects) or just IDs (strings)
        const firstItem = t.assignedTo[0];
        if (typeof firstItem === 'string') {
            return t.assignedTo.includes(member.id);
        } else {
            return t.assignedTo.some((assigned: any) => assigned._id === member.id || assigned.id === member.id);
        }
    });

    const isFocusMode = false;

    return (
        <TouchableOpacity
            style={[styles.memberColumn, { backgroundColor: theme.colors.bgSurface }]}
            onPress={() => onPress(member)}
            activeOpacity={0.9}
        >
            <View style={styles.columnHeader}>
                <MemberAvatar
                    name={`${member.firstName} ${member.lastName || ''}`.trim()}
                    color={member.profileColor}
                    size={56}
                />
                <View style={styles.headerInfo}>
                    <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                        {member.firstName}
                    </Text>
                    <View style={styles.pointsRow}>
                        <Star size={12} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                        <Text style={[styles.memberPoints, { color: theme.colors.textSecondary }]}>
                            {member.pointsTotal || 0}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.tasksContainer}>
                {isFocusMode && memberTasks.length > 0 ? (
                    <View style={[styles.focusCard, { borderColor: member.profileColor }]}>
                        <View style={styles.focusHeader}>
                            <Target size={16} color={member.profileColor} />
                            <Text style={[styles.focusLabel, { color: member.profileColor }]}>FOCUS MODE</Text>
                        </View>
                        <Text style={[styles.focusTaskTitle, { color: theme.colors.textPrimary }]}>
                            {memberTasks[0].title}
                        </Text>
                        <Text style={[styles.focusPoints, { color: theme.colors.actionPrimary }]}>
                            +{memberTasks[0].value} pts
                        </Text>
                    </View>
                ) : (
                    <>
                        {memberTasks.slice(0, 3).map((task: Task) => (
                            <View key={task._id || task.id} style={styles.taskItem}>
                                <View style={[styles.taskBullet, { borderColor: member.profileColor }]} />
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
                                <CheckCircle size={24} color={theme.colors.borderSubtle} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>All Done!</Text>
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
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        minHeight: 220,
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    headerInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberPoints: {
        fontSize: 12,
        fontWeight: '600',
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
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 2,
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
        marginLeft: 18,
    },
    emptyTasks: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
    },
    focusCard: {
        borderWidth: 2,
        borderRadius: 16,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
    },
    focusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    focusLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    focusTaskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    focusPoints: {
        fontSize: 14,
        fontWeight: '700',
    },
});
