import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
    getInitials,
    getAvatarStyles,
    validateColor,
    getContrastingTextColor,
    type MemberAvatarProps,
} from 'momentum-shared';

export default function MemberAvatar({
    name,
    color,
    size = 48,
    showName = false,
    fontSize,
    style,
}: MemberAvatarProps) {
    const { currentTheme: theme } = useTheme();

    // Use shared logic
    const validColor = validateColor(color || theme.colors.actionPrimary);
    const avatarStyles = getAvatarStyles(validColor, size);
    const textColor = getContrastingTextColor(validColor);
    const initials = getInitials(name);

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.avatar,
                    {
                        width: avatarStyles.width,
                        height: avatarStyles.height,
                        borderRadius: avatarStyles.borderRadius,
                        backgroundColor: avatarStyles.backgroundColor,
                    },
                    style,
                ]}
            >
                <Text
                    style={[
                        styles.initials,
                        {
                            fontSize: fontSize || avatarStyles.fontSize,
                            color: textColor,
                        },
                    ]}
                >
                    {initials}
                </Text>
            </View>
            {showName && (
                <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                    {name}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: 16,
    },
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    initials: {
        fontWeight: 'bold',
    },
    name: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '500',
    },
});
