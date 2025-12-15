import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Member } from '../../../types';
import { bentoPalette, familyPalette, borderRadius, spacing, typography, shadows, animations } from '../../../theme/bentoTokens';
import { Zap, AlertCircle } from 'lucide-react-native';

interface MemberAvatarButtonProps {
    member: Member;
    onPress: (member: Member) => void;
    pendingTasksCount?: number;
    isFocused?: boolean;
}

export default function MemberAvatarButton({ member, onPress, pendingTasksCount = 0, isFocused = false }: MemberAvatarButtonProps) {

    // Get initials
    const initials = `${member.firstName.charAt(0)}${member.lastName ? member.lastName.charAt(0) : ''}`;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(member)}
            activeOpacity={animations.scalePress.pressed}
        >
            <View style={[styles.avatarContainer, { backgroundColor: member.profileColor || bentoPalette.brandLight }]}>
                {/* Avatar Image or Initials */}
                {/* Assuming no image URL in member type yet, fallback to initials */}
                <Text style={styles.initials}>{initials}</Text>

                {/* Focus Badge */}
                {isFocused && (
                    <View style={styles.focusBadge}>
                        <Zap size={16} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                )}

                {/* Pending Tasks Badge */}
                {pendingTasksCount > 0 && (
                    <View style={styles.notificationBadge}>
                        <Text style={styles.notificationText}>{pendingTasksCount}</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{member.firstName}</Text>
                <View style={styles.pointsPill}>
                    <Text style={styles.pointsText}>{member.pointsTotal} pts</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: spacing.md,
        width: 120, // ample touch target
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.soft,
        marginBottom: spacing.sm,
        position: 'relative',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    initials: {
        ...typography.heroGreeting,
        fontSize: 36,
        color: '#FFFFFF',
    },
    infoContainer: {
        alignItems: 'center',
        width: '100%',
    },
    nameText: {
        ...typography.widgetTitle,
        color: bentoPalette.textPrimary,
        marginBottom: 2,
    },
    pointsPill: {
        backgroundColor: bentoPalette.brandLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.pill,
    },
    pointsText: {
        ...typography.caption,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    focusBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: familyPalette.questGradient[0], // Goldish
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        ...shadows.soft,
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: bentoPalette.alert,
        minWidth: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        paddingHorizontal: 6,
        ...shadows.soft,
    },
    notificationText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

