import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

type SharingSettingsRouteProp = RouteProp<RootStackParamList, 'SharingSettings'>;

export default function SharingSettingsScreen() {
    const { currentTheme: theme } = useTheme();
    const route = useRoute<SharingSettingsRouteProp>();
    const navigation = useNavigation();
    const { linkId, childName } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [pendingChanges, setPendingChanges] = useState<any[]>([]);
    const [proposing, setProposing] = useState<string | null>(null);

    const loadSettings = async () => {
        try {
            const response = await api.getLinkSettings(linkId);
            if (response.data) {
                setSettings(response.data.link.sharingSettings);
                setPendingChanges(response.data.link.pendingChanges || []);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, [linkId]);

    const handleToggle = async (settingKey: string, currentValue: string) => {
        const newValue = currentValue === 'shared' ? 'separate' : 'shared';

        // Optimistic update? No, wait for proposal confirmation
        setProposing(settingKey);
        try {
            await api.proposeSettingChange(linkId, settingKey, newValue);
            Alert.alert('Proposal Sent', 'The other parent must approve this change.');
            loadSettings(); // Reload to see pending change
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to propose change');
        } finally {
            setProposing(null);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    const renderSettingRow = (label: string, key: string, description: string) => {
        const isShared = settings?.[key] === 'shared';
        const pendingChange = pendingChanges.find(c => c.setting === key && c.status === 'pending');

        return (
            <View style={[styles.settingCard, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={styles.settingHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                            {description}
                        </Text>
                    </View>
                    <Switch
                        value={isShared}
                        onValueChange={() => handleToggle(key, settings?.[key])}
                        trackColor={{ false: theme.colors.bgCanvas, true: theme.colors.actionPrimary }}
                        thumbColor="#FFFFFF"
                        disabled={!!pendingChange || proposing === key}
                    />
                </View>

                <View style={styles.statusRow}>
                    <Text style={[
                        styles.statusText,
                        { color: isShared ? theme.colors.actionPrimary : theme.colors.textSecondary }
                    ]}>
                        Currently: {isShared ? 'Shared (Unified)' : 'Separate (Per Household)'}
                    </Text>
                </View>

                {pendingChange && (
                    <View style={[styles.pendingBanner, { backgroundColor: theme.colors.bgCanvas }]}>
                        <AlertCircle size={16} color={theme.colors.signalAlert} />
                        <Text style={[styles.pendingText, { color: theme.colors.textPrimary }]}>
                            Change proposed: Switch to {pendingChange.newValue}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.bgSurface, borderBottomColor: theme.colors.borderSubtle }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    Sharing Settings: {childName}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                        Both households must agree to share data. Changes require approval from the other parent.
                    </Text>
                </View>

                {renderSettingRow('Points & XP', 'points', 'Share a single point balance across households.')}
                {renderSettingRow('Tasks', 'tasks', 'See and manage tasks from both households.')}
                {renderSettingRow('Quests', 'quests', 'Share quest progress and availability.')}
                {renderSettingRow('Routines', 'routines', 'Share routine completion status.')}
                {renderSettingRow('Store', 'store', 'Share a single reward store and inventory.')}

                <View style={[styles.settingCard, { backgroundColor: theme.colors.bgSurface, opacity: 0.8 }]}>
                    <View style={styles.settingHeader}>
                        <View>
                            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Wishlist</Text>
                            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                                Wishlists are always shared to coordinate gifts.
                            </Text>
                        </View>
                        <Switch value={true} disabled />
                    </View>
                </View>

                <View style={[styles.settingCard, { backgroundColor: theme.colors.bgSurface, opacity: 0.8 }]}>
                    <View style={styles.settingHeader}>
                        <View>
                            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Streaks</Text>
                            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                                Streaks are always unified to maintain motivation.
                            </Text>
                        </View>
                        <Switch value={true} disabled />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
        gap: 16,
    },
    infoBox: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
    },
    settingCard: {
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    settingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 13,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    pendingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 8,
        marginTop: 4,
    },
    pendingText: {
        fontSize: 13,
        flex: 1,
    },
});
