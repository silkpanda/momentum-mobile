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

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
    navigation: OnboardingScreenNavigationProp;
}

export default function OnboardingScreen({ navigation }: Props) {
    const { currentTheme: theme } = useTheme();
    const { user } = useAuth();
    const [step, setStep] = useState<'calendar' | 'profile'>('calendar');
    const [isLoading, setIsLoading] = useState(false);

    // Calendar step state
    const [calendarChoice, setCalendarChoice] = useState<'sync' | 'create' | null>(null);

    // Profile step state
    const [displayName, setDisplayName] = useState(user?.firstName || '');
    const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0].hex);

    const handleCalendarChoice = (choice: 'sync' | 'create') => {
        setCalendarChoice(choice);
        // Move to profile step after calendar choice
        setStep('profile');
    };

    const handleComplete = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter a display name');
            return;
        }

        if (!user?._id) {
            Alert.alert('Error', 'User information not found');
            return;
        }

        setIsLoading(true);
        try {
            // Call the complete onboarding endpoint
            const response = await api.completeOnboarding({
                userId: user._id,
                householdId: user.householdId || '',
                displayName: displayName.trim(),
                profileColor: selectedColor,
                calendarChoice: calendarChoice || undefined,
            });

            if (response.data) {
                // Onboarding complete! The AppNavigator will detect the change
                // and navigate to the appropriate screen
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
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressDots}>
                        <View style={[styles.dot, { backgroundColor: theme.colors.actionPrimary }]} />
                        <View style={[styles.dot, { backgroundColor: step === 'profile' ? theme.colors.actionPrimary : theme.colors.borderSubtle }]} />
                    </View>
                </View>

                {step === 'calendar' ? (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                            Calendar Setup
                        </Text>
                        <Text style={[textStyles.bodyMedium, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            How would you like to manage your family calendar?
                        </Text>

                        <TouchableOpacity
                            style={[styles.choiceCard, {
                                backgroundColor: theme.colors.bgSurface,
                                borderColor: calendarChoice === 'sync' ? theme.colors.actionPrimary : theme.colors.borderSubtle
                            }]}
                            onPress={() => handleCalendarChoice('sync')}
                        >
                            <Calendar size={32} color={theme.colors.actionPrimary} />
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
                ) : (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                            Profile Setup
                        </Text>
                        <Text style={[textStyles.bodyMedium, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32 }]}>
                            Customize your profile
                        </Text>

                        <FormInput
                            label="Display Name"
                            placeholder="e.g., 'Mom' or 'Dad'"
                            value={displayName}
                            onChangeText={setDisplayName}
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
