import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { User, Mail, Home, LogOut, Star, Shield } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { Member } from '../../types';
import MemberAvatar from '../../components/family/MemberAvatar';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import PINSetupModal from '../../components/pin/PINSetupModal';
import ChangePINModal from '../../components/pin/ChangePINModal';

export default function SettingsTab() {
    const { user, logout } = useAuth();
    const { currentTheme: theme } = useTheme();
    const [householdData, setHouseholdData] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // PIN State
    const [pinSetupCompleted, setPinSetupCompleted] = useState(false);
    const [isPinSetupModalVisible, setIsPinSetupModalVisible] = useState(false);
    const [isChangePinModalVisible, setIsChangePinModalVisible] = useState(false);

    // Check PIN status
    const checkPinStatus = async () => {
        try {
            const response = await api.getPinStatus();
            setPinSetupCompleted(response.data?.pinSetupCompleted || false);
        } catch (error) {
            console.log('PIN status check failed:', error);
        }
    };

    const loadProfileData = async () => {
        try {
            const response = await api.getDashboardData();
            if (response.data && response.data.household) {
                setHouseholdData(response.data.household);
                // Find current user's profile in the household
                const profile = response.data.household.members?.find(
                    (m: Member) => m.userId === user?._id
                );
                setUserProfile(profile);
            }
            await checkPinStatus();
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProfileData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadProfileData();
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
    };

    if (isLoading && !householdData) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    const fullName = `${user?.firstName} ${user?.lastName || ''}`.trim();
    const displayName = userProfile?.displayName || fullName;
    const points = userProfile?.pointsTotal || 0;
    const role = userProfile?.role || 'Member';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <MemberAvatar
                    name={displayName}
                    color={userProfile?.profileColor}
                    size={80}
                />
                <Text style={[styles.displayName, { color: theme.colors.textPrimary }]}>
                    {displayName}
                </Text>
                <Text style={[styles.role, { color: theme.colors.textSecondary }]}>
                    {role}
                </Text>
            </View>

            {/* Points Card */}
            <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={styles.pointsHeader}>
                    <Star size={24} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                        Total Points
                    </Text>
                </View>
                <Text style={[styles.pointsValue, { color: theme.colors.actionPrimary }]}>
                    {points}
                </Text>
            </View>

            {/* Account Info */}
            <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                    Account Information
                </Text>

                <View style={styles.infoRow}>
                    <User size={20} color={theme.colors.textSecondary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                            Full Name
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                            {fullName}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Mail size={20} color={theme.colors.textSecondary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                            Email
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                            {user?.email}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Home size={20} color={theme.colors.textSecondary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                            Household
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                            {householdData?.householdName || 'My Family'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Theme Settings */}
            <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                    Theme
                </Text>
                <ThemeSwitcher />
            </View>

            {/* Security Settings */}
            <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                    Security
                </Text>
                <TouchableOpacity
                    style={styles.infoRow}
                    onPress={() => {
                        if (pinSetupCompleted) {
                            setIsChangePinModalVisible(true);
                        } else {
                            setIsPinSetupModalVisible(true);
                        }
                    }}
                >
                    <Shield size={20} color={pinSetupCompleted ? theme.colors.signalSuccess : theme.colors.signalAlert} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                            PIN Authentication
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                            {pinSetupCompleted ? 'Change PIN' : 'Set Up PIN (Recommended)'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <PINSetupModal
                visible={isPinSetupModalVisible}
                onClose={() => setIsPinSetupModalVisible(false)}
                onSuccess={async (pin) => {
                    try {
                        await api.setupPin(pin);
                        setPinSetupCompleted(true);
                        setIsPinSetupModalVisible(false);
                        Alert.alert('Success!', 'Your PIN has been set up.');
                        await checkPinStatus();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to set up PIN.');
                    }
                }}
            />

            <ChangePINModal
                visible={isChangePinModalVisible}
                onClose={() => setIsChangePinModalVisible(false)}
                onSuccess={async () => {
                    Alert.alert('Success!', 'Your PIN has been changed.');
                    await checkPinStatus();
                }}
            />

            {/* Logout Button */}
            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.colors.signalAlert }]}
                onPress={handleLogout}
            >
                <LogOut size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                    Momentum v1.0.0
                </Text>
            </View>
        </ScrollView>
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
        padding: 24,
        alignItems: 'center',
    },
    displayName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
    },
    role: {
        fontSize: 16,
        marginTop: 4,
    },
    card: {
        margin: 24,
        marginTop: 12,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    pointsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    pointsValue: {
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
    },
});
