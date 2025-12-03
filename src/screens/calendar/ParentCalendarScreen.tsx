import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Plus, Settings } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCalendar } from '../../hooks/useCalendar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarSettingsModal from '../../components/calendar/CalendarSettingsModal';
import CreateEventModal from '../../components/calendar/CreateEventModal';
import { format, parseISO } from 'date-fns';

export default function ParentCalendarScreen() {
    const { currentTheme: theme } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { events, refreshEvents, isLoading } = useCalendar();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshEvents();
        }, [refreshEvents])
    );

    // Get events for selected date
    const selectedDateEvents = useMemo(() => {
        return events.filter(event => {
            const dateStr = event.startDate instanceof Date
                ? event.startDate.toISOString()
                : event.startDate;
            const dateKey = dateStr.split('T')[0];
            return dateKey === selectedDate;
        });
    }, [events, selectedDate]);

    // Create marked dates for calendar
    const markedDates = useMemo(() => {
        const marked: { [key: string]: any } = {};

        events.forEach(event => {
            const dateStr = event.startDate instanceof Date
                ? event.startDate.toISOString()
                : event.startDate;
            const dateKey = dateStr.split('T')[0];

            if (!marked[dateKey]) {
                marked[dateKey] = { marked: true, dots: [] };
            }
        });

        // Mark selected date
        marked[selectedDate] = {
            ...marked[selectedDate],
            selected: true,
            selectedColor: theme.colors.actionPrimary,
        };

        return marked;
    }, [events, selectedDate, theme.colors.actionPrimary]);

    const onDayPress = useCallback((day: DateData) => {
        setSelectedDate(day.dateString);
    }, []);

    const calendarTheme = useMemo(() => ({
        calendarBackground: theme.colors.bgSurface,
        backgroundColor: theme.colors.bgCanvas,
        dayTextColor: theme.colors.textPrimary,
        monthTextColor: theme.colors.textPrimary,
        textSectionTitleColor: theme.colors.textSecondary,
        selectedDayBackgroundColor: theme.colors.actionPrimary,
        selectedDayTextColor: '#ffffff',
        todayTextColor: theme.colors.actionPrimary,
        dotColor: theme.colors.actionPrimary,
        selectedDotColor: '#ffffff',
        textDayFontWeight: '400' as const,
        textMonthFontWeight: 'bold' as const,
        textDayHeaderFontWeight: '600' as const,
    }), [theme]);

    const renderEventItem = useCallback(({ item }: { item: any }) => {
        return (
            <TouchableOpacity style={[styles.item, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={[styles.itemColorStrip, { backgroundColor: item.color || theme.colors.actionPrimary }]} />
                <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.itemTime, { color: theme.colors.textSecondary }]}>
                        {format(new Date(item.startDate), 'h:mm a')} - {format(new Date(item.endDate), 'h:mm a')}
                    </Text>
                    {item.location && (
                        <Text style={[styles.itemLocation, { color: theme.colors.textSecondary }]}>{item.location}</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [theme]);

    const renderEmptyState = useCallback(() => {
        return (
            <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No events for {format(parseISO(selectedDate), 'MMMM d, yyyy')}
                </Text>
            </View>
        );
    }, [theme, selectedDate]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.bgSurface, borderBottomColor: theme.colors.borderSubtle }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Family Calendar</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setIsSettingsVisible(true)} style={styles.headerButton}>
                        <Settings size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={() => setIsCreateModalVisible(true)}
                    >
                        <Plus size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Calendar */}
            <Calendar
                current={selectedDate}
                markedDates={markedDates}
                onDayPress={onDayPress}
                theme={calendarTheme}
                style={{ backgroundColor: theme.colors.bgSurface }}
            />

            {/* Events List */}
            <View style={[styles.eventsContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                <Text style={[styles.eventsHeader, { color: theme.colors.textPrimary }]}>
                    {format(parseISO(selectedDate), 'EEEE, MMMM d')}
                </Text>
                <FlatList
                    data={selectedDateEvents}
                    renderItem={renderEventItem}
                    keyExtractor={(item, index) => item.id || `event-${index}`}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.eventsList}
                />
            </View>

            <CalendarSettingsModal
                visible={isSettingsVisible}
                onClose={() => {
                    setIsSettingsVisible(false);
                    refreshEvents();
                }}
            />

            <CreateEventModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    refreshEvents();
                    setIsCreateModalVisible(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addButton: {
        padding: 8,
        borderRadius: 20,
    },
    eventsContainer: {
        flex: 1,
        paddingTop: 16,
    },
    eventsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    eventsList: {
        paddingHorizontal: 16,
    },
    item: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    itemColorStrip: {
        width: 4,
        marginRight: 12,
        borderRadius: 2,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemTime: {
        fontSize: 14,
        marginBottom: 2,
    },
    itemLocation: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    emptyState: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
});
