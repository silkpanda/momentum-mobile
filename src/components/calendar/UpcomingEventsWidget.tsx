import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCalendar } from '../../hooks/useCalendar';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react-native';
import { format } from 'date-fns';

interface UpcomingEventsWidgetProps {
    onSettingsPress: () => void;
}

export default function UpcomingEventsWidget({ onSettingsPress }: UpcomingEventsWidgetProps) {
    const { currentTheme: theme } = useTheme();
    const { events, refreshEvents, isLoading, selectedCalendarIds } = useCalendar();

    useEffect(() => {
        refreshEvents();
    }, [selectedCalendarIds]); // Refresh when selection changes

    // Filter for Today's events only
    const today = new Date();
    const todayStr = today.toDateString();

    const displayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === todayStr;
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <CalendarIcon size={20} color={theme.colors.actionPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Today's Schedule
                    </Text>
                </View>
                <TouchableOpacity onPress={onSettingsPress}>
                    <Text style={[styles.settingsLink, { color: theme.colors.actionPrimary }]}>
                        Manage
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.actionPrimary} />
                </View>
            ) : displayEvents.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        No events scheduled for today.
                    </Text>
                    <TouchableOpacity onPress={onSettingsPress} style={{ marginTop: 8 }}>
                        <Text style={[styles.subLink, { color: theme.colors.actionPrimary }]}>
                            Select Calendars
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.eventsList}>
                    {displayEvents.map(event => (
                        <View key={event.id} style={[styles.eventItem, { borderLeftColor: theme.colors.actionPrimary }]}>
                            <View style={styles.eventContent}>
                                <Text style={[styles.eventTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                    {event.title}
                                </Text>
                                <View style={styles.eventMeta}>
                                    <Clock size={12} color={theme.colors.textSecondary} />
                                    <Text style={[styles.eventTime, { color: theme.colors.textSecondary }]}>
                                        {event.allDay
                                            ? 'All Day'
                                            : `${format(new Date(event.startDate), 'h:mm a')} - ${format(new Date(event.endDate), 'h:mm a')}`
                                        }
                                    </Text>
                                </View>
                                {event.location && (
                                    <View style={[styles.eventMeta, { marginTop: 2 }]}>
                                        <MapPin size={12} color={theme.colors.textSecondary} />
                                        <Text style={[styles.eventTime, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                            {event.location}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.dateBadge}>
                                <Text style={[styles.dateDay, { color: theme.colors.textPrimary }]}>
                                    {format(new Date(event.startDate), 'd')}
                                </Text>
                                <Text style={[styles.dateMonth, { color: theme.colors.textSecondary }]}>
                                    {format(new Date(event.startDate), 'MMM')}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    settingsLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    subLink: {
        fontSize: 14,
        fontWeight: '500',
    },
    eventsList: {
        gap: 12,
    },
    eventItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 12,
        borderLeftWidth: 3,
    },
    eventContent: {
        flex: 1,
        marginRight: 12,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventTime: {
        fontSize: 12,
    },
    dateBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
    },
    dateDay: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 22,
    },
    dateMonth: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
});
