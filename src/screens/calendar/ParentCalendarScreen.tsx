import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Agenda, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Plus, Settings } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCalendar } from '../../hooks/useCalendar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarSettingsModal from '../../components/calendar/CalendarSettingsModal';
import CreateEventModal from '../../components/calendar/CreateEventModal';
import { format } from 'date-fns';

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
        }, [])
    );

    // Transform events for react-native-calendars Agenda
    const agendaItems = useMemo(() => {
        const items: { [key: string]: any[] } = {};

        events.forEach(event => {
            const dateStr = event.startDate instanceof Date
                ? event.startDate.toISOString()
                : event.startDate;
            const dateKey = dateStr.split('T')[0];
            if (!items[dateKey]) {
                items[dateKey] = [];
            }
            items[dateKey].push({
                name: event.title,
                height: 50,
                day: dateKey,
                ...event
            });
        });

        // Ensure selected date has an empty array if no events, to avoid Agenda glitches
        if (!items[selectedDate]) {
            items[selectedDate] = [];
        }

        return items;
    }, [events, selectedDate]);

    const renderItem = (item: any, firstItemInDay: boolean) => {
        return (
            <TouchableOpacity style={[styles.item, { backgroundColor: theme.colors.bgSurface }]}>
                <View style={[styles.itemColorStrip, { backgroundColor: item.color || theme.colors.actionPrimary }]} />
                <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.itemTime, { color: theme.colors.textSecondary }]}>
                        {format(new Date(item.startDate), 'h:mm a')} - {format(new Date(item.endDate), 'h:mm a')}
                    </Text>
                    {item.location && (
                        <Text style={[styles.itemLocation, { color: theme.colors.textSecondary }]}>{item.location}</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => {
        return (
            <View style={styles.emptyDate}>
                <Text style={{ color: theme.colors.textSecondary }}>No events for this time.</Text>
            </View>
        );
    };

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

            {/* Calendar Agenda */}
            <Agenda
                items={agendaItems}
                selected={selectedDate}
                renderItem={renderItem}
                renderEmptyDate={renderEmptyDate}
                rowHasChanged={(r1, r2) => r1.name !== r2.name}
                showClosingKnob={true}
                theme={{
                    calendarBackground: theme.colors.bgSurface,
                    agendaKnobColor: theme.colors.borderSubtle,
                    backgroundColor: theme.colors.bgCanvas,
                    dayTextColor: theme.colors.textPrimary,
                    monthTextColor: theme.colors.textPrimary,
                    textSectionTitleColor: theme.colors.textSecondary,
                    selectedDayBackgroundColor: theme.colors.actionPrimary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: theme.colors.actionPrimary,
                    dotColor: theme.colors.actionPrimary,
                    selectedDotColor: '#ffffff',
                }}
                onDayPress={(day: DateData) => {
                    setSelectedDate(day.dateString);
                }}
            />

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
    item: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        marginRight: 16,
        marginTop: 17,
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
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 16,
    },
});
