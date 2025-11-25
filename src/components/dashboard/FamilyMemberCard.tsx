// src/components/dashboard/FamilyMemberCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, XCircle } from 'lucide-react-native';
import { Member, Task } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import MemberAvatar from '../family/MemberAvatar';

interface FamilyMemberCardProps {
    member: Member;
    focusedTask?: Task;
    onSetFocus: () => void;
    onClearFocus: () => void;
}

export default function FamilyMemberCard({ member, focusedTask, onSetFocus, onClearFocus }: FamilyMemberCardProps) {
    const { currentTheme: theme } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
            {focusedTask && (
                <View style={[styles.focusBanner, { backgroundColor: theme.colors.actionPrimary }]}>
                    <Target size={12} color="#FFFFFF" />
                    <Text style={styles.focusBannerText}>FOCUS MODE</Text>
                </View>
            )}

            <View style={styles.content}>
                <MemberAvatar
                    name={member.firstName}
                    color={member.profileColor}
                    size={48}
                />
                <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                    {member.firstName}
                </Text>
                <Text style={[styles.points, { color: theme.colors.textSecondary }]}>
                    {member.pointsTotal || 0} pts
                </Text>

                {focusedTask ? (
                    <View style={styles.focusActive}>
                        <View style={[styles.focusedTaskBadge, { backgroundColor: theme.colors.actionPrimary + '20' }]}>
                            <Text style={[styles.focusedTaskTitle, { color: theme.colors.actionPrimary }]}>
                                {focusedTask.title}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.clearButton, { borderColor: theme.colors.borderSubtle }]}
                            onPress={onClearFocus}
                        >
                            <XCircle size={12} color={theme.colors.textSecondary} />
                            <Text style={[styles.clearText, { color: theme.colors.textSecondary }]}>
                                Clear
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.focusButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={onSetFocus}
                    >
                        <Target size={14} color="#FFFFFF" />
                        <Text style={styles.focusButtonText}>Set Focus</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        borderRadius: 12,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    focusBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        gap: 6,
    },
    focusBannerText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    content: {
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    points: {
        fontSize: 13,
    },
    focusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 4,
    },
    focusButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    focusActive: {
        width: '100%',
        alignItems: 'center',
        gap: 8,
    },
    focusedTaskBadge: {
        width: '100%',
        padding: 8,
        borderRadius: 8,
        marginTop: 4,
    },
    focusedTaskTitle: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    clearText: {
        fontSize: 11,
        fontWeight: '500',
    },
});
