import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings, Bell } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface FamilyHeaderProps {
    householdName: string;
    isParent: boolean;
    isLandscape: boolean;
    insets: EdgeInsets;
    onSettingsPress: () => void;
    onRemindParent: () => void;
}

export default function FamilyHeader({
    householdName,
    isParent,
    isLandscape,
    insets,
    onSettingsPress,
    onRemindParent
}: FamilyHeaderProps) {
    const { currentTheme: theme } = useTheme();

    return (
        <View style={[
            styles.header,
            {
                backgroundColor: theme.colors.bgSurface,
                borderColor: theme.colors.borderSubtle,
                paddingTop: insets.top + 16,
                paddingLeft: insets.left + 24,
                paddingRight: insets.right + 24
            }
        ]}>
            <View>
                <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={[styles.householdName, { color: theme.colors.textPrimary }]}>{householdName}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
                {(!isParent && isLandscape) && (
                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={onRemindParent}
                    >
                        <Bell size={20} color="#FFFFFF" />
                        <Text style={styles.headerButtonText}>Remind Parent</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: theme.colors.bgCanvas }]}
                    onPress={onSettingsPress}
                >
                    <Settings size={20} color={theme.colors.textSecondary} />
                    <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>Parent View</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24, // Fallback
        paddingBottom: 20,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
    },
    headerButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    householdName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 10,
        borderRadius: 12,
    },
});
