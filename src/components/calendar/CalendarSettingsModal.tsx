import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Check, Calendar as CalendarIcon } from 'lucide-react-native';
import { useCalendar } from '../../hooks/useCalendar';
import { api } from '../../services/api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

interface CalendarSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CalendarSettingsModal({ visible, onClose }: CalendarSettingsModalProps) {
    const { currentTheme: theme } = useTheme();
    const { calendars, selectedCalendarIds, toggleCalendar, refreshCalendars, isLoading } = useCalendar();

    useEffect(() => {
        if (visible) {
            refreshCalendars();
        }
    }, [visible]);

    const handleConnectGoogle = async () => {
        // Check for Expo Go
        if (Constants.appOwnership === 'expo') {
            Alert.alert('Not Supported', 'Google Sign-In is not supported in Expo Go. Please use a development build.');
            return;
        }

        try {
            // Check if Google Play Services are available (Android only, iOS will skip this)
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // This opens the NATIVE Google account picker (no browser!)
            const userInfo = await GoogleSignin.signIn();

            // Get the authentication tokens
            const tokens = await GoogleSignin.getTokens();

            console.log('Google Sign-In successful:', userInfo.data?.user.email);

            if (!userInfo.data?.serverAuthCode) {
                console.warn('No serverAuthCode received. Offline access will not work.');
            }

            // Send the tokens/code to your backend
            await api.connectGoogleCalendar({
                idToken: tokens.idToken,
                accessToken: tokens.accessToken,
                serverAuthCode: userInfo.data?.serverAuthCode || undefined,
            });

            Alert.alert('Success', 'Google Calendar connected successfully!');
            onClose();
        } catch (error: any) {
            console.error('Google Sign-In error:', error);

            if (error.code === 'SIGN_IN_CANCELLED') {
                // User cancelled the sign-in flow
                Alert.alert('Cancelled', 'Google Calendar connection was cancelled');
            } else if (error.code === 'IN_PROGRESS') {
                // Sign-in is already in progress
                Alert.alert('Please wait', 'Sign-in is already in progress');
            } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
                // Play Services not available or outdated (Android only)
                Alert.alert('Error', 'Google Play Services is not available on this device');
            } else {
                Alert.alert('Error', 'Failed to connect Google Calendar');
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgSurface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                            Select Calendars
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Choose which calendars to display in Momentum.
                    </Text>

                    {/* Connect Google Calendar button removed as it is now handled during onboarding */}

                    {isLoading ? (
                        <ActivityIndicator size="large" color={theme.colors.actionPrimary} style={{ marginTop: 20 }} />
                    ) : (
                        <ScrollView style={styles.listContainer}>
                            {calendars.length === 0 ? (
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    No calendars found on this device.
                                </Text>
                            ) : (
                                calendars.map(cal => {
                                    const isSelected = selectedCalendarIds.includes(cal.id);
                                    return (
                                        <TouchableOpacity
                                            key={cal.id}
                                            style={[
                                                styles.calendarItem,
                                                {
                                                    backgroundColor: isSelected ? theme.colors.bgCanvas : 'transparent',
                                                    borderColor: theme.colors.borderSubtle,
                                                }
                                            ]}
                                            onPress={() => toggleCalendar(cal.id)}
                                        >
                                            <View style={styles.calendarInfo}>
                                                <View style={[styles.colorDot, { backgroundColor: cal.color }]} />
                                                <View>
                                                    <Text style={[styles.calendarTitle, { color: theme.colors.textPrimary }]}>
                                                        {cal.title}
                                                    </Text>
                                                    <Text style={[styles.calendarType, { color: theme.colors.textSecondary }]}>
                                                        {cal.type}
                                                    </Text>
                                                </View>
                                            </View>

                                            {isSelected && (
                                                <Check size={20} color={theme.colors.actionPrimary} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>
                    )}

                    <TouchableOpacity
                        style={[styles.doneButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={onClose}
                    >
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    closeButton: {
        padding: 4,
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    connectButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    listContainer: {
        maxHeight: 400,
    },
    calendarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    calendarInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    calendarTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    calendarType: {
        fontSize: 12,
        textTransform: 'capitalize',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    doneButton: {
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
