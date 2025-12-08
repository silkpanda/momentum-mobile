import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { textStyles } from '../../theme/typography';
import { PROFILE_COLORS } from '../../theme/constants';
import { Calendar, Plus, Check } from 'lucide-react-native';
import FormInput from '../../components/shared/FormInput';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { api } from '../../services/api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
    navigation: OnboardingScreenNavigationProp;
}

export default function OnboardingScreen({ navigation }: Props) {
    const { currentTheme: theme } = useTheme();
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState<'calendar' | 'calendar_select' | 'profile'>('calendar');
    const [isLoading, setIsLoading] = useState(false);

    // Calendar step state
    const [calendarChoice, setCalendarChoice] = useState<'sync' | 'create' | null>(null);
    const [calendars, setCalendars] = useState<any[]>([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

    // Profile step state
    const [displayName, setDisplayName] = useState(user?.firstName || '');
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0].hex);
    const [pin, setPin] = useState('');
    const [householdName, setHouseholdName] = useState('');

    const handleCalendarChoice = async (choice: 'sync' | 'create') => {
        setCalendarChoice(choice);

        if (choice === 'sync') {
            if (Constants.appOwnership === 'expo') {
                Alert.alert('Not Supported', 'Google Sign-In is not supported in Expo Go. Please use a development build.');
                return;
            }

            setIsLoading(true);
            try {
                // FIRST: Try to list calendars directly. 
                // If the user signed up via Google and we captured the serverAuthCode there, 
                // the backend already has tokens.
                try {
                    const listResponse = await api.listGoogleCalendars();
                    if (listResponse.data && listResponse.data.calendars) {
                        setCalendars(listResponse.data.calendars);
                        setStep('calendar_select');
                        setIsLoading(false);
                        return; // Done!
                    }
                } catch (listError) {
                    // This is expected if token is expired - backend will handle refresh
                    console.log('[Calendar] Direct list needs token refresh, continuing...', listError);
                }

                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

                // Check if we are already signed in
                let userInfo: any = GoogleSignin.getCurrentUser();
                let needsExplicitSignIn = false;

                if (userInfo) {
                    try {
                        console.log('Attempting silent sign-in...');
                        const response = await GoogleSignin.signInSilently();
                        userInfo = response;
                    } catch (silentError) {
                        console.log('Silent sign-in failed', silentError);
                        // DO NOT automatically fall back to signIn() here to avoid loop.
                        // Instead, let the user trigger it manually if needed, or fail gracefully.
                        Alert.alert(
                            'Connection Refresh Needed',
                            'We need to refresh your Google connection. Please tap "Sync Existing Calendar" again to retry.',
                            [{ text: 'OK' }]
                        );
                        setIsLoading(false);
                        return;
                    }
                } else {
                    // Only prompt if we strictly have no user session at all
                    needsExplicitSignIn = true;
                }

                if (needsExplicitSignIn) {
                    userInfo = await GoogleSignin.signIn();
                }

                const tokens = await GoogleSignin.getTokens();

                // Handle different response structures
                const serverAuthCode = userInfo.serverAuthCode || userInfo.data?.serverAuthCode;

                if (serverAuthCode) {
                    // 1. Connect Calendar (Exchange tokens)
                    await api.connectGoogleCalendar({
                        idToken: tokens.idToken,
                        accessToken: tokens.accessToken,
                        serverAuthCode: serverAuthCode,
                    });

                    // 2. List Calendars
                    const response = await api.listGoogleCalendars();
                    if (response.data && response.data.calendars) {
                        setCalendars(response.data.calendars);
                        setStep('calendar_select');
                    } else {
                        Alert.alert('Notice', 'No calendars found. Creating a new one instead.');
                        setCalendarChoice('create');
                        setStep('profile');
                    }
                } else {
                    console.warn('No serverAuthCode received from Google Sign-In');
                    // Fallback to profile if we can't get calendar access
                    Alert.alert(
                        'Calendar Access',
                        'We couldn\'t verify calendar permissions. You can set this up later in Settings.',
                        [{ text: 'Continue to Profile', onPress: () => setStep('profile') }]
                    );
                }

            } catch (error: any) {
                console.error('Calendar sync error:', error);
                if (error.code !== 'SIGN_IN_CANCELLED' && error.code !== '12501') {
                    Alert.alert('Connection Error', 'Failed to connect Google Calendar. Please try again later.');
                }
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        } else {
            // Create selected - go straight to profile
            setStep('profile');
        }
    };

    const handleCalendarSelection = () => {
        if (!selectedCalendarId) {
            Alert.alert('Select a Calendar', 'Please select a calendar to sync.');
            return;
        }
        setStep('profile');
    };

    const handleComplete = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter a display name');
            return;
        }

        if (!householdName.trim() && !user?.householdId) {
            Alert.alert('Error', 'Please enter a household name');
            return;
        }

        if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            Alert.alert('Error', 'Please enter a 4-digit PIN');
            return;
        }

        if (!user?._id) {
            Alert.alert('Error', 'User information not found');
            return;
        }

        setIsLoading(true);
        try {
            // Debug: Log the data being sent
            const onboardingData = {
                userId: user._id,
                householdId: user.householdId || '',
                householdName: householdName.trim() || undefined,
                displayName: displayName.trim(),
                profileColor: selectedColor,
                pin: pin,
                calendarChoice: calendarChoice || undefined,
                selectedCalendarId: selectedCalendarId || undefined,
            };

            console.log('[Onboarding] Data being sent:', {
                hasUserId: !!onboardingData.userId,
                hasHouseholdId: !!onboardingData.householdId,
                hasDisplayName: !!onboardingData.displayName,
                hasProfileColor: !!onboardingData.profileColor,
                hasPin: !!onboardingData.pin,
                pinLength: onboardingData.pin?.length,
            });

            // Call the complete onboarding endpoint
            const response = await api.completeOnboarding(onboardingData);

            if (response.data) {
                // Onboarding complete! Refresh user to update state and navigate
                await refreshUser();
                Alert.alert('Success', 'Welcome to Momentum!');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to complete onboarding');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.actionPrimary }]}>
                        Welcome to Momentum!
                    </Text>
                    <Text style={[textStyles.bodyLarge, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                        Let's get you set up
                    </Text>
                    {user?.email && (
                        <Text style={[textStyles.bodySmall, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                            {user.email}
                        </Text>
                    )}
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressDots}>
                        <View style={[styles.dot, { backgroundColor: theme.colors.actionPrimary }]} />
                        <View style={[styles.dot, { backgroundColor: (step === 'calendar_select' || step === 'profile') ? theme.colors.actionPrimary : theme.colors.borderSubtle }]} />
                        <View style={[styles.dot, { backgroundColor: step === 'profile' ? theme.colors.actionPrimary : theme.colors.borderSubtle }]} />
                    </View>
                </View>

                {step === 'calendar' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                            Calendar Setup
                        </Text>
                        <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            How would you like to manage your family calendar?
                        </Text>

                        <TouchableOpacity
                            style={[styles.choiceCard, {
                                backgroundColor: theme.colors.bgSurface,
                                borderColor: calendarChoice === 'sync' ? theme.colors.actionPrimary : theme.colors.borderSubtle
                            }]}
                            onPress={() => handleCalendarChoice('sync')}
                            disabled={isLoading}
                        >
                            {isLoading && calendarChoice === 'sync' ? (
                                <ActivityIndicator color={theme.colors.actionPrimary} />
                            ) : (
                                <Calendar size={32} color={theme.colors.actionPrimary} />
                            )}
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>
                                Sync Existing Calendar
                            </Text>
                            <Text style={[styles.choiceDescription, { color: theme.colors.textSecondary }]}>
                                Connect to a calendar you already use
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.choiceCard, {
                                backgroundColor: theme.colors.bgSurface,
                                borderColor: calendarChoice === 'create' ? theme.colors.actionPrimary : theme.colors.borderSubtle
                            }]}
                            onPress={() => handleCalendarChoice('create')}
                            disabled={isLoading}
                        >
                            <Plus size={32} color={theme.colors.actionPrimary} />
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>
                                Create New Calendar
                            </Text>
                            <Text style={[styles.choiceDescription, { color: theme.colors.textSecondary }]}>
                                Start fresh with a new family calendar
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : step === 'calendar_select' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                            Select Calendar
                        </Text>
                        <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            Which Google Calendar should we use?
                        </Text>

                        {calendars.map((cal) => (
                            <TouchableOpacity
                                key={cal.id}
                                style={[styles.calendarOption, {
                                    backgroundColor: theme.colors.bgSurface,
                                    borderColor: selectedCalendarId === cal.id ? theme.colors.actionPrimary : theme.colors.borderSubtle
                                }]}
                                onPress={() => setSelectedCalendarId(cal.id)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={[styles.radioCircle, {
                                        borderColor: selectedCalendarId === cal.id ? theme.colors.actionPrimary : theme.colors.textSecondary
                                    }]}>
                                        {selectedCalendarId === cal.id && <View style={[styles.radioDot, { backgroundColor: theme.colors.actionPrimary }]} />}
                                    </View>
                                    <View>
                                        <Text style={[textStyles.label, { color: theme.colors.textPrimary }]}>{cal.summary}</Text>
                                        <Text style={[textStyles.caption, { color: theme.colors.textSecondary }]}>{cal.description || 'No description'}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={handleCalendarSelection}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                            Profile Setup
                        </Text>
                        <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            Customize your profile
                        </Text>

                        {!user?.householdId && (
                            <FormInput
                                label="Household Name"
                                placeholder="e.g., 'The Smith Family'"
                                value={householdName}
                                onChangeText={setHouseholdName}
                            />
                        )}

                        <FormInput
                            label="Display Name"
                            placeholder="e.g., 'Mom' or 'Dad'"
                            value={displayName}
                            onChangeText={setDisplayName}
                        />

                        <FormInput
                            label="4-Digit PIN"
                            placeholder="Enter 4-digit PIN"
                            value={pin}
                            onChangeText={(text) => {
                                // Only allow numbers and max 4 digits
                                if (/^\d{0,4}$/.test(text)) {
                                    setPin(text);
                                }
                            }}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                        />

                        <View style={styles.colorPickerContainer}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                Your Profile Color
                            </Text>
                            <View style={[styles.colorGrid, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}>
                                {PROFILE_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color.hex}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: color.hex },
                                            selectedColor === color.hex && styles.selectedColorOption,
                                            selectedColor === color.hex && { borderColor: theme.colors.actionPrimary }
                                        ]}
                                        onPress={() => setSelectedColor(color.hex)}
                                    >
                                        {selectedColor === color.hex && <Check size={16} color="#FFFFFF" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={handleComplete}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Complete Setup</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setStep('calendar')}
                        >
                            <Text style={[textStyles.label, { color: theme.colors.textSecondary }]}>
                                Back
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stepContainer: {
        alignItems: 'center',
        width: '100%',
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    choiceCard: {
        width: '100%',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        marginBottom: 16,
    },
    choiceTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
    },
    choiceDescription: {
        fontSize: 14,
        textAlign: 'center',
    },
    calendarOption: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    colorPickerContainer: {
        width: '100%',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    selectedColorOption: {
        transform: [{ scale: 1.1 }],
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        marginTop: 16,
        padding: 8,
    },
});
