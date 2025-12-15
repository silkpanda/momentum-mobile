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
    const { user, refreshUser, updateAuthState } = useAuth();
    // Added 'household_choice' and 'invite_code' steps
    const [step, setStep] = useState<'household_choice' | 'invite_code' | 'calendar' | 'calendar_select' | 'family_calendar' | 'family_calendar_select' | 'profile'>('household_choice');
    const [isLoading, setIsLoading] = useState(false);

    // Household Choice State
    const [isJoining, setIsJoining] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    // Personal Calendar step state
    const [calendarChoice, setCalendarChoice] = useState<'sync' | 'create' | null>(null);
    const [calendars, setCalendars] = useState<any[]>([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

    // Family Calendar step state
    const [familyCalendarChoice, setFamilyCalendarChoice] = useState<'sync' | 'create' | null>(null);
    const [familyCalendars, setFamilyCalendars] = useState<any[]>([]);
    const [selectedFamilyCalendarId, setSelectedFamilyCalendarId] = useState<string | null>(null);

    // Profile step state
    const [displayName, setDisplayName] = useState(user?.firstName || '');
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0].hex);
    const [familyColor, setFamilyColor] = useState(PROFILE_COLORS[4].hex);
    const [pin, setPin] = useState('');
    const [householdName, setHouseholdName] = useState('');

    const handleHouseholdChoice = (choice: 'join' | 'create') => {
        if (choice === 'join') {
            setIsJoining(true);
            setStep('invite_code');
        } else {
            setIsJoining(false);
            setStep('calendar'); // Go to calendar setup for creators too
        }
    };

    const handleInviteCodeSubmit = () => {
        if (!inviteCode || inviteCode.length < 4) {
            Alert.alert('Error', 'Please enter a valid invite code');
            return;
        }
        // Move to Calendar setup, skipping Family Calendar later
        setStep('calendar');
    };

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
                try {
                    const listResponse = await api.listGoogleCalendars();
                    if (listResponse.data && listResponse.data.calendars) {
                        setCalendars(listResponse.data.calendars);
                        setStep('calendar_select');
                        setIsLoading(false);
                        return; // Done!
                    }
                } catch (listError) {
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
                        // Silent sign-in failed
                        needsExplicitSignIn = true;
                    }
                } else {
                    needsExplicitSignIn = true;
                }

                if (needsExplicitSignIn) {
                    try {
                        userInfo = await GoogleSignin.signIn();
                    } catch (err: any) {
                        if (err.code === 'SIGN_IN_CANCELLED') throw err;
                        console.error('Sign in error', err);
                        // Try silent one last time or fail
                    }
                }

                const tokens = await GoogleSignin.getTokens();

                const serverAuthCode = userInfo.serverAuthCode || userInfo.data?.serverAuthCode;

                if (serverAuthCode) {
                    // 1. Connect Calendar
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
                        // Next step depends on flow
                        if (isJoining) setStep('profile');
                        else setStep('family_calendar');
                    }
                } else {
                    console.warn('No serverAuthCode received from Google Sign-In');
                    Alert.alert(
                        'Calendar Access',
                        'We couldn\'t verify calendar permissions. You can set this up later in Settings.',
                        [{ text: 'Continue', onPress: () => isJoining ? setStep('profile') : setStep('family_calendar') }]
                    );
                }

            } catch (error: any) {
                console.error('Calendar sync error:', error);
                if (error.code !== 'SIGN_IN_CANCELLED') {
                    Alert.alert('Connection Error', 'Failed to connect Google Calendar. Please try again later.');
                }
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        } else {
            // Create selected
            if (isJoining) setStep('profile');
            else setStep('family_calendar');
        }
    };

    const handleCalendarSelection = () => {
        if (!selectedCalendarId) {
            Alert.alert('Select a Calendar', 'Please select a calendar to sync.');
            return;
        }
        if (isJoining) setStep('profile');
        else setStep('family_calendar');
    };

    const handleFamilyCalendarChoice = async (choice: 'sync' | 'create') => {
        setFamilyCalendarChoice(choice);

        if (choice === 'sync') {
            setIsLoading(true);
            try {
                const response = await api.listGoogleCalendars();
                if (response.data && response.data.calendars) {
                    setFamilyCalendars(response.data.calendars);
                    setStep('family_calendar_select');
                } else {
                    Alert.alert('Notice', 'No calendars found. Creating a new one instead.');
                    setFamilyCalendarChoice('create');
                    setStep('profile');
                }
            } catch (error) {
                console.error('Family calendar list error:', error);
                Alert.alert('Error', 'Failed to load calendars. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setStep('profile');
        }
    };

    const handleFamilyCalendarSelection = () => {
        if (!selectedFamilyCalendarId) {
            Alert.alert('Select a Calendar', 'Please select a family calendar to sync.');
            return;
        }
        setStep('profile');
    };

    const handleComplete = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter a display name');
            return;
        }

        // Only require household name if Creating
        if (!isJoining && !householdName.trim() && !user?.householdId) {
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
            const onboardingData: any = {
                userId: user._id,
                householdId: user.householdId || '',
                displayName: displayName.trim(),
                profileColor: selectedColor,
                pin: pin,
                calendarChoice: calendarChoice || undefined,
                selectedCalendarId: selectedCalendarId || undefined,
            };

            if (isJoining) {
                onboardingData.inviteCode = inviteCode;
                // No householdName or familyCalendar
            } else {
                onboardingData.householdName = householdName.trim() || undefined;
                onboardingData.familyColor = familyColor;
                onboardingData.familyCalendarChoice = familyCalendarChoice || undefined;
                onboardingData.selectedFamilyCalendarId = selectedFamilyCalendarId || undefined;
            }

            const response = await api.completeOnboarding(onboardingData);

            if (response.data) {
                if ((response as any).token) {
                    await updateAuthState(
                        (response as any).token,
                        response.data.user,
                        response.data.household._id || response.data.household.id
                    );
                } else {
                    await refreshUser();
                }
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

                {/* Progress Indicator - Simplified for dynamic flow */}
                <View style={styles.progressContainer}>
                    <Text style={{ color: theme.colors.textSecondary }}>
                        {step === 'household_choice' ? 'Step 1 of 4' :
                            step === 'invite_code' ? 'Step 2 of 4' :
                                step === 'calendar' || step === 'calendar_select' ? 'Step 2 of 4' :
                                    step === 'family_calendar' || step === 'family_calendar_select' ? 'Step 3 of 4' : 'Final Step'}
                    </Text>
                </View>

                {step === 'household_choice' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>Get Started</Text>
                        <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            Are you creating a new household or joining an existing one?
                        </Text>

                        <TouchableOpacity style={[styles.choiceCard, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]} onPress={() => handleHouseholdChoice('create')}>
                            <Plus size={32} color={theme.colors.actionPrimary} />
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>Create New Household</Text>
                            <Text style={[styles.choiceDescription, { color: theme.colors.textSecondary }]}>Start fresh for your family</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.choiceCard, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]} onPress={() => handleHouseholdChoice('join')}>
                            <Check size={32} color={theme.colors.actionPrimary} />
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>Join Existing Household</Text>
                            <Text style={[styles.choiceDescription, { color: theme.colors.textSecondary }]}>Use an invite code</Text>
                        </TouchableOpacity>
                    </View>
                ) : step === 'invite_code' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>Enter Invite Code</Text>
                        <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            Ask a family member for their invitation code.
                        </Text>
                        <FormInput
                            label="Invite Code"
                            placeholder="e.g. A1B2C3"
                            value={inviteCode}
                            onChangeText={setInviteCode}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.actionPrimary }]} onPress={handleInviteCodeSubmit}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backButton} onPress={() => setStep('household_choice')}>
                            <Text style={[textStyles.label, { color: theme.colors.textSecondary }]}>Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : step === 'calendar' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                            Personal Calendar
                        </Text>
                        <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            Do you want to sync your personal Google Calendar?
                        </Text>
                        <TouchableOpacity
                            style={[styles.choiceCard, {
                                backgroundColor: theme.colors.bgSurface,
                                borderColor: calendarChoice === 'sync' ? theme.colors.actionPrimary : theme.colors.borderSubtle
                            }]}
                            onPress={() => handleCalendarChoice('sync')}
                            disabled={isLoading}
                        >
                            {isLoading && calendarChoice === 'sync' ? <ActivityIndicator color={theme.colors.actionPrimary} /> : <Calendar size={32} color={theme.colors.actionPrimary} />}
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>Sync Google Calendar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.choiceCard, {
                                backgroundColor: theme.colors.bgSurface,
                                borderColor: calendarChoice === 'create' ? theme.colors.actionPrimary : theme.colors.borderSubtle
                            }]}
                            onPress={() => handleCalendarChoice('create')}
                            disabled={isLoading}
                        >
                            <Check size={32} color={theme.colors.actionPrimary} />
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>Skip / Create New</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backButton} onPress={() => isJoining ? setStep('invite_code') : setStep('household_choice')}>
                            <Text style={[textStyles.label, { color: theme.colors.textSecondary }]}>Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : step === 'calendar_select' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>Select Calendar</Text>
                        {calendars.map((cal) => (
                            <TouchableOpacity key={cal.id} style={[styles.calendarOption, { backgroundColor: theme.colors.bgSurface, borderColor: selectedCalendarId === cal.id ? theme.colors.actionPrimary : theme.colors.borderSubtle }]} onPress={() => setSelectedCalendarId(cal.id)}>
                                <Text style={[textStyles.label, { color: theme.colors.textPrimary }]}>{cal.summary}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.actionPrimary }]} onPress={handleCalendarSelection}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                ) : step === 'family_calendar' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>Family Calendar</Text>
                        <Text style={[textStyles.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            This shared calendar will be visible to everyone in the household.
                        </Text>
                        <TouchableOpacity style={[styles.choiceCard, { backgroundColor: theme.colors.bgSurface, borderColor: familyCalendarChoice === 'sync' ? theme.colors.actionPrimary : theme.colors.borderSubtle }]} onPress={() => handleFamilyCalendarChoice('sync')} disabled={isLoading}>
                            {isLoading && familyCalendarChoice === 'sync' ? <ActivityIndicator color={theme.colors.actionPrimary} /> : <Calendar size={32} color={theme.colors.actionPrimary} />}
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>Sync Existing Calendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.choiceCard, { backgroundColor: theme.colors.bgSurface, borderColor: familyCalendarChoice === 'create' ? theme.colors.actionPrimary : theme.colors.borderSubtle }]} onPress={() => handleFamilyCalendarChoice('create')} disabled={isLoading}>
                            <Plus size={32} color={theme.colors.actionPrimary} />
                            <Text style={[styles.choiceTitle, { color: theme.colors.textPrimary }]}>Create New Family Calendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backButton} onPress={() => setStep('calendar')}>
                            <Text style={[textStyles.label, { color: theme.colors.textSecondary }]}>Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : step === 'family_calendar_select' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>Select Family Calendar</Text>
                        {familyCalendars.map((cal) => (
                            <TouchableOpacity key={cal.id} style={[styles.calendarOption, { backgroundColor: theme.colors.bgSurface, borderColor: selectedFamilyCalendarId === cal.id ? theme.colors.actionPrimary : theme.colors.borderSubtle }]} onPress={() => setSelectedFamilyCalendarId(cal.id)}>
                                <Text style={[textStyles.label, { color: theme.colors.textPrimary }]}>{cal.summary}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.actionPrimary }]} onPress={handleFamilyCalendarSelection}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                            {isJoining ? 'Complete Your Profile' : 'Setup Household & Profile'}
                        </Text>

                        {!isJoining && (
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
                                if (/^\d{0,4}$/.test(text)) setPin(text);
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

                        {!isJoining && (
                            <View style={styles.colorPickerContainer}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    Family Color
                                </Text>
                                <View style={[styles.colorGrid, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}>
                                    {PROFILE_COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color.hex}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color.hex },
                                                familyColor === color.hex && styles.selectedColorOption,
                                                familyColor === color.hex && { borderColor: theme.colors.actionPrimary }
                                            ]}
                                            onPress={() => setFamilyColor(color.hex)}
                                        >
                                            {familyColor === color.hex && <Check size={16} color="#FFFFFF" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

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
                            onPress={() => isJoining ? setStep('calendar') : setStep('family_calendar')}
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
