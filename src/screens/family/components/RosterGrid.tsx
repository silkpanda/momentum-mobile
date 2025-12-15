import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Member, Task } from '../../../types';
import MemberAvatarButton from './MemberAvatarButton';
import { spacing, typography } from '../../../theme/bentoTokens';

interface RosterGridProps {
    members: Member[];
    tasks: Task[]; // To calculate pending tasks
    onMemberPress: (member: Member) => void;
}

export default function RosterGrid({ members, tasks, onMemberPress }: RosterGridProps) {

    const getPendingTaskCount = (memberId: string) => {
        return tasks.filter(t =>
            t.assignedTo.includes(memberId) &&
            (t.status === 'Pending' || t.status === 'PendingApproval')
        ).length;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SQUAD STATUS</Text>
            </View>

            <View style={styles.gridContainer}>
                {members.map(member => (
                    <MemberAvatarButton
                        key={member.id}
                        member={member}
                        onPress={onMemberPress}
                        pendingTasksCount={getPendingTaskCount(member.id)}
                        isFocused={!!member.focusedTaskId}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    title: {
        ...typography.caption,
        color: 'rgba(0,0,0,0.4)',
        letterSpacing: 2,
        fontWeight: '700',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.md,
    },
});
