import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle, Target, Star, Zap } from 'lucide-react-native';
import MemberAvatar from './MemberAvatar';
import { Member, Task } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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

    // Check if member is in focus mode
    const isFocusMode = !!member.focusedTaskId;
    const focusedTask = isFocusMode
        ? allTasks.find(t => (t._id || t.id) === member.focusedTaskId)
        : null;

    return (
        <TouchableOpacity
            style={[
                styles.memberColumn,
                { backgroundColor: theme.colors.bgSurface },
                isFocusMode && {
                    borderWidth: 6,
                    borderColor: theme.colors.actionPrimary,
                    backgroundColor: theme.colors.actionPrimary + '15',
                    transform: [{ scale: 1.05 }], // Make it slightly larger
                }
            ]}
            onPress={() => onPress(member)}
            activeOpacity={0.9}
        >
            {/* ULTRA PROMINENT FOCUS MODE BANNER */}
            {isFocusMode && (
                <LinearGradient
                    colors={[theme.colors.actionPrimary, theme.colors.actionPrimary + 'DD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.focusModeBanner}
                >
                    <Target size={20} color="#FFFFFF" />
                    <Text style={styles.focusModeBannerText}>🎯 FOCUS MODE ACTIVE</Text>
                    <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
                </LinearGradient>
            )}

            <View style={[styles.columnHeader, isFocusMode && { marginTop: 16 }]}>
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
                {isFocusMode && focusedTask ? (
                    <View style={[styles.focusCard, {
                        borderColor: theme.colors.actionPrimary,
                        backgroundColor: theme.colors.bgCanvas,
                        borderWidth: 4
                    }]}>
                        <View style={[styles.zapBadge, { backgroundColor: theme.colors.actionPrimary }]}>
                            <Zap size={24} color="#FFFFFF" fill="#FFFFFF" />
                        </View>
                        <Text style={[styles.focusTaskTitle, { color: theme.colors.textPrimary }]}>
                            {focusedTask.title}
                        </Text>
                        {focusedTask.description && (
                            <Text style={[styles.focusTaskDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                {focusedTask.description}
                            </Text>
                        )}
                        <View style={[styles.focusPointsBadge, { backgroundColor: theme.colors.actionPrimary }]}>
                            <Text style={styles.focusPointsValue}>
                                +{focusedTask.value}
                            </Text>
                            <Text style={styles.focusPointsLabel}>
                                POINTS
                            </Text>
                        </View>
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
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        minHeight: 220,
        overflow: 'hidden',
    },
    focusModeBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    focusModeBannerText: {
        fontSize: 13,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
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
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    zapBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    focusTaskTitle: {
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 26,
    },
    focusTaskDescription: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 18,
    },
    focusPointsBadge: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    focusPointsValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    focusPointsLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1.5,
    },
});
