import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { themes } from '../../theme/colors';

interface MemberAvatarProps {
    name: string;
    color?: string;
    size?: number;
    showName?: boolean;
}

export default function MemberAvatar({ name, color, size = 48, showName = false }: MemberAvatarProps) {
    const theme = themes.calmLight;
    const initials = name
        .split(' ')
        .filter(n => n.length > 0)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.avatar,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color || theme.colors.actionPrimary,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.initials,
                        {
                            fontSize: size * 0.4,
                            color: '#FFFFFF',
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
