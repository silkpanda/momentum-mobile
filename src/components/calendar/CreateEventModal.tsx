import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Calendar as CalendarIcon, Clock, MapPin, AlignLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { calendarService } from '../../services/calendarService';
import { useCalendar } from '../../hooks/useCalendar';

interface CreateEventModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateEventModal({ visible, onClose, onSuccess }: CreateEventModalProps) {
    const { currentTheme: theme } = useTheme();
    const { calendars } = useCalendar();

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // 1 hour later
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Date Picker States
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [mode, setMode] = useState<'date' | 'time'>('date');

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter an event title');
            return;
        }

        setIsSubmitting(true);
        try {
            // Default to the first writable calendar found
            // In a real app, we'd let the user pick the calendar
            const targetCalendar = calendars.find(c => c.allowsModifications);

            if (!targetCalendar) {
                Alert.alert('Error', 'No writable calendars found on this device.');
                return;
            }

            await calendarService.createEvent(targetCalendar.id, {
                title,
                startDate,
                endDate,
                allDay,
                location,
                notes
            });

            Alert.alert('Success', 'Event created successfully!');
            onSuccess();
            resetForm();
        } catch (error) {
            console.error('Failed to create event:', error);
            Alert.alert('Error', 'Failed to create event. Please check permissions.');
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
    };

    const onChangeStart = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
            // Auto-adjust end date if it's before start
            if (selectedDate > endDate) {
                setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
            }
        }
    };

    const onChangeEnd = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>New Event</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {/* Title */}
                    <TextInput
                        style={[styles.inputTitle, { color: theme.colors.textPrimary }]}
                        placeholder="Event Title"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                    />

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

                    {/* Start Date */}
                    <TouchableOpacity
                        style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}
                        onPress={() => { setMode('date'); setShowStartPicker(true); }}
                    >
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Starts</Text>
                        <Text style={[styles.value, { color: theme.colors.actionPrimary }]}>
                            {startDate.toLocaleString()}
                        </Text>
                    </TouchableOpacity>

                    {/* End Date */}
                    <TouchableOpacity
                        style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}
                        onPress={() => { setMode('date'); setShowEndPicker(true); }}
                    >
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Ends</Text>
                        <Text style={[styles.value, { color: theme.colors.actionPrimary }]}>
                            {endDate.toLocaleString()}
                        </Text>
                    </TouchableOpacity>

                    {/* Location */}
                    <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <MapPin size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: theme.colors.textPrimary }]}
                            placeholder="Location"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>

                    {/* Notes */}
                    <View style={[styles.row, { borderBottomColor: theme.colors.borderSubtle, alignItems: 'flex-start', minHeight: 100 }]}>
                        <AlignLeft size={20} color={theme.colors.textSecondary} style={{ marginTop: 4 }} />
                        <TextInput
                            style={[styles.input, { color: theme.colors.textPrimary, height: 100, textAlignVertical: 'top' }]}
                            placeholder="Notes"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={handleCreate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Event</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>

                {/* Date Pickers */}
                {showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode={mode}
                        is24Hour={false}
                        onChange={onChangeStart}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode={mode}
                        is24Hour={false}
                        onChange={onChangeEnd}
                    />
                )}
            </View>
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
    content: {
        padding: 16,
    },
    inputTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
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
    input: {
        flex: 1,
        fontSize: 16,
    },
    submitButton: {
        marginTop: 32,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
