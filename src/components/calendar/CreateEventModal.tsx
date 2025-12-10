import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Switch, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Clock, MapPin, AlignLeft, Bell, Repeat } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { calendarService } from '../../services/calendarService';
import { useCalendar } from '../../hooks/useCalendar';
import { useData } from '../../contexts/DataContext';

interface CreateEventModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateEventModal({ visible, onClose, onSuccess }: CreateEventModalProps) {
    const { currentTheme: theme } = useTheme();
    const { calendars, addOptimisticEvent } = useCalendar();
    const { members, household } = useData();

    // Basic Info
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');

    // Date/Time
    const [allDay, setAllDay] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // 1 hour later

    // Attendees (Family Members)
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

    // Recurrence
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

    // Reminders
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderMinutes, setReminderMinutes] = useState(15);

    // Calendar Selection
    const [selectedCalendar, setSelectedCalendar] = useState<'personal' | 'family'>('personal');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Date Picker States
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const toggleAttendee = (memberId: string) => {
        setSelectedAttendees(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter an event title');
            return;
        }

        setIsSubmitting(true);

        // Prepare event data - send CLEAN title and attendees
        // Backend will append names for Google Calendar only
        const eventData = {
            title, // Clean title (no attendee names)
            startDate,
            endDate,
            allDay,
            location,
            notes,
            attendees: selectedAttendees, // Send attendee IDs
        };

        // OPTIMISTIC UPDATE: Add event to UI immediately (with clean title)
        // The app will display the clean title, Google Calendar will have appended names
        const tempId = addOptimisticEvent(eventData);

        try {
            // Create event via backend (Google Calendar + DB)
            await calendarService.createGoogleEvent(eventData);

            // Success! The real event will replace the optimistic one on next refresh
            Alert.alert('Success', 'Event created successfully!');
            onSuccess();
            resetForm();
        } catch (apiError: any) {
            console.error('Event creation failed:', apiError);

            // Remove the optimistic event since it failed
            onSuccess(); // Triggers refresh which removes the temp event

            // Show appropriate error message
            if (apiError.message?.includes('401') || apiError.message?.includes('not connected')) {
                Alert.alert('Calendar Error', 'Google Calendar not connected. Please connect your calendar in settings.');
            } else if (apiError.message?.includes('network') || apiError.message?.includes('fetch')) {
                Alert.alert('Network Error', 'Unable to reach server. Please check your internet connection.');
            } else {
                Alert.alert('Error', 'Failed to create event. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setLocation('');
        setNotes('');
        setAllDay(false);
        setStartDate(new Date());
        setEndDate(new Date(new Date().getTime() + 60 * 60 * 1000));
        setSelectedAttendees([]);
        setIsRecurring(false);
        setReminderEnabled(true);
        setReminderMinutes(15);
        setSelectedCalendar('personal');
    };

    const onChangeStartDate = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            const newStart = new Date(startDate);
            newStart.setFullYear(selectedDate.getFullYear());
            newStart.setMonth(selectedDate.getMonth());
            newStart.setDate(selectedDate.getDate());
            setStartDate(newStart);

            if (newStart > endDate) {
                setEndDate(new Date(newStart.getTime() + 60 * 60 * 1000));
            }
        }
    };

    const onChangeStartTime = (event: any, selectedTime?: Date) => {
        setShowStartTimePicker(false);
        if (selectedTime) {
            const newStart = new Date(startDate);
            newStart.setHours(selectedTime.getHours());
            newStart.setMinutes(selectedTime.getMinutes());
            setStartDate(newStart);

            if (newStart >= endDate) {
                setEndDate(new Date(newStart.getTime() + 60 * 60 * 1000));
            }
        }
    };

    const onChangeEndDate = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            const newEnd = new Date(endDate);
            newEnd.setFullYear(selectedDate.getFullYear());
            newEnd.setMonth(selectedDate.getMonth());
            newEnd.setDate(selectedDate.getDate());
            setEndDate(newEnd);
        }
    };

    const onChangeEndTime = (event: any, selectedTime?: Date) => {
        setShowEndTimePicker(false);
        if (selectedTime) {
            const newEnd = new Date(endDate);
            newEnd.setHours(selectedTime.getHours());
            newEnd.setMinutes(selectedTime.getMinutes());
            setEndDate(newEnd);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const reminderOptions = [
        { label: 'At time of event', value: 0 },
        { label: '5 minutes before', value: 5 },
        { label: '15 minutes before', value: 15 },
        { label: '30 minutes before', value: 30 },
        { label: '1 hour before', value: 60 },
        { label: '1 day before', value: 1440 },
    ];

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgSurface }]} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>New Event</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                        {/* Title */}
                        <TextInput
                            style={[styles.inputTitle, { color: theme.colors.textPrimary, borderBottomColor: theme.colors.borderSubtle }]}
                            placeholder="Add title"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />

                        {/* Member Selector (Who is this for?) */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>WHO IS THIS FOR?</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.memberList}
                            >
                                {members.map(member => {
                                    // Use userId (which maps to FamilyMember ID in BFF), not profile ID
                                    const memberId = member.userId;
                                    const isSelected = selectedAttendees.includes(memberId);
                                    return (
                                        <TouchableOpacity
                                            key={member.id}
                                            style={styles.memberItem}
                                            onPress={() => toggleAttendee(memberId)}
                                        >
                                            <View style={[
                                                styles.avatar,
                                                {
                                                    backgroundColor: isSelected ? (member.profileColor || theme.colors.actionPrimary) : theme.colors.bgCanvas,
                                                    borderColor: isSelected ? (member.profileColor || theme.colors.actionPrimary) : theme.colors.borderSubtle,
                                                    borderWidth: 2
                                                }
                                            ]}>
                                                <Text style={[
                                                    styles.avatarText,
                                                    { color: isSelected ? '#FFF' : theme.colors.textSecondary }
                                                ]}>
                                                    {member.firstName.charAt(0)}
                                                </Text>
                                            </View>
                                            <Text style={[
                                                styles.memberName,
                                                {
                                                    color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
                                                    fontWeight: isSelected ? '600' : '400'
                                                }
                                            ]}>
                                                {member.firstName}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* All Day Toggle */}
                        <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}>
                            <View style={styles.rowLabel}>
                                <Clock size={20} color={theme.colors.textSecondary} />
                                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>All-day</Text>
                            </View>
                            <Switch
                                value={allDay}
                                onValueChange={setAllDay}
                                trackColor={{ false: theme.colors.bgCanvas, true: theme.colors.actionPrimary }}
                            />
                        </View>

                        {/* Start Date & Time */}
                        <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Starts</Text>
                            <View style={styles.dateTimeContainer}>
                                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                                    <Text style={[styles.value, { color: theme.colors.actionPrimary }]}>
                                        {formatDate(startDate)}
                                    </Text>
                                </TouchableOpacity>
                                {!allDay && (
                                    <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                                        <Text style={[styles.value, { color: theme.colors.actionPrimary, marginLeft: 12 }]}>
                                            {formatTime(startDate)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* End Date & Time */}
                        <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Ends</Text>
                            <View style={styles.dateTimeContainer}>
                                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                                    <Text style={[styles.value, { color: theme.colors.actionPrimary }]}>
                                        {formatDate(endDate)}
                                    </Text>
                                </TouchableOpacity>
                                {!allDay && (
                                    <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                                        <Text style={[styles.value, { color: theme.colors.actionPrimary, marginLeft: 12 }]}>
                                            {formatTime(endDate)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Repeat */}
                        <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}>
                            <View style={styles.rowLabel}>
                                <Repeat size={20} color={theme.colors.textSecondary} />
                                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Repeat</Text>
                            </View>
                            <Switch
                                value={isRecurring}
                                onValueChange={setIsRecurring}
                                trackColor={{ false: theme.colors.bgCanvas, true: theme.colors.actionPrimary }}
                            />
                        </View>

                        {/* Recurrence Options */}
                        {isRecurring && (
                            <View style={[styles.recurrenceOptions, { backgroundColor: theme.colors.bgCanvas }]}>
                                {['daily', 'weekly', 'monthly'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.recurrenceOption,
                                            { borderColor: theme.colors.borderSubtle },
                                            recurrenceType === type && { backgroundColor: theme.colors.actionPrimary, borderColor: theme.colors.actionPrimary }
                                        ]}
                                        onPress={() => setRecurrenceType(type as any)}
                                    >
                                        <Text style={[
                                            styles.recurrenceText,
                                            { color: recurrenceType === type ? '#FFF' : theme.colors.textPrimary }
                                        ]}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Location */}
                        <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}>
                            <MapPin size={20} color={theme.colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.textPrimary }]}
                                placeholder="Add location"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>

                        {/* Reminder */}
                        <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}>
                            <View style={styles.rowLabel}>
                                <Bell size={20} color={theme.colors.textSecondary} />
                                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Reminder</Text>
                            </View>
                            <Switch
                                value={reminderEnabled}
                                onValueChange={setReminderEnabled}
                                trackColor={{ false: theme.colors.bgCanvas, true: theme.colors.actionPrimary }}
                            />
                        </View>

                        {/* Reminder Time Options */}
                        {reminderEnabled && (
                            <View style={[styles.reminderOptions, { backgroundColor: theme.colors.bgCanvas }]}>
                                {reminderOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.reminderOption,
                                            { borderBottomColor: theme.colors.borderSubtle },
                                            reminderMinutes === option.value && { backgroundColor: theme.colors.actionPrimary + '20' }
                                        ]}
                                        onPress={() => setReminderMinutes(option.value)}
                                    >
                                        <Text style={[
                                            styles.reminderText,
                                            { color: theme.colors.textPrimary }
                                        ]}>
                                            {option.label}
                                        </Text>
                                        {reminderMinutes === option.value && (
                                            <Text style={{ color: theme.colors.actionPrimary }}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Notes */}
                        <View style={[styles.notesContainer, { borderBottomColor: theme.colors.borderSubtle }]}>
                            <AlignLeft size={20} color={theme.colors.textSecondary} style={{ marginTop: 4 }} />
                            <TextInput
                                style={[styles.notesInput, { color: theme.colors.textPrimary }]}
                                placeholder="Add notes"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </ScrollView>

                    {/* Fixed Bottom Button Bar */}
                    <View style={[styles.bottomBar, { backgroundColor: theme.colors.bgSurface, borderTopColor: theme.colors.borderSubtle }]}>
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={isSubmitting || !title.trim()}
                            style={[
                                styles.createButton,
                                {
                                    backgroundColor: title.trim() ? theme.colors.actionPrimary : theme.colors.bgCanvas,
                                    opacity: (isSubmitting || !title.trim()) ? 0.5 : 1
                                }
                            ]}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={[styles.createButtonText, { color: title.trim() ? '#FFF' : theme.colors.textTertiary }]}>
                                    Create Event
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Date/Time Pickers */}
                    {showStartDatePicker && (
                        <DateTimePicker value={startDate} mode="date" is24Hour={false} onChange={onChangeStartDate} />
                    )}
                    {showStartTimePicker && (
                        <DateTimePicker value={startDate} mode="time" is24Hour={false} onChange={onChangeStartTime} />
                    )}
                    {showEndDatePicker && (
                        <DateTimePicker value={endDate} mode="date" is24Hour={false} onChange={onChangeEndDate} />
                    )}
                    {showEndTimePicker && (
                        <DateTimePicker value={endDate} mode="time" is24Hour={false} onChange={onChangeEndTime} />
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    saveButton: {
        padding: 4,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    inputTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 24,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    memberList: {
        gap: 16,
    },
    memberItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    memberName: {
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    rowLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        fontSize: 16,
    },
    value: {
        fontSize: 16,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    recurrenceOptions: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        marginTop: -1,
        borderRadius: 8,
    },
    recurrenceOption: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    recurrenceText: {
        fontSize: 14,
        fontWeight: '500',
    },
    reminderOptions: {
        marginTop: -1,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    reminderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    reminderText: {
        fontSize: 16,
    },
    notesContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 16,
        borderBottomWidth: 1,
        gap: 12,
        minHeight: 100,
    },
    notesInput: {
        flex: 1,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    bottomBar: {
        padding: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
    },
    createButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        fontSize: 17,
        fontWeight: '600',
    },
});
