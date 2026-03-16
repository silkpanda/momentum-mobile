import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ScrollView, Dimensions } from 'react-native';
import { CalendarList, Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Settings, MapPin, Clock, Calendar as CalendarIcon, List, LayoutTemplate } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCalendar } from '../../hooks/useCalendar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO, isSameDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import CreateEventModal from '../../components/calendar/CreateEventModal';
import EditEventModal from '../../components/calendar/EditEventModal';
import EventDetailsModal from '../../components/calendar/EventDetailsModal';
import CalendarSettingsModal from '../../components/calendar/CalendarSettingsModal';
import { useData } from '../../contexts/DataContext';

type ViewMode = 'month' | 'week' | 'day';

export default function ParentCalendarScreen() {
    const { currentTheme: theme } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { events, refreshEvents } = useCalendar();
    const { refresh } = useData(); // Get DataContext refresh

    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Modals
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // Events are pre-loaded from DataContext and will update via WebSockets automatically
    // No need to call refreshEvents() on focus

    // --- Data Processing ---
    const eventsByDate = useMemo(() => {
        const grouped: { [key: string]: any[] } = {};
        events.forEach(event => {
            const dateStr = event.startDate instanceof Date ? event.startDate.toISOString() : event.startDate;
            const key = dateStr.split('T')[0];
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(event);
        });
        return grouped;
    }, [events]);

    const markedDates = useMemo(() => {
        const marked: { [key: string]: any } = {};
        Object.keys(eventsByDate).forEach(date => {
            marked[date] = {
                dots: eventsByDate[date].slice(0, 3).map(e => ({ color: e.color || theme.colors.actionPrimary }))
            };
        });
        marked[selectedDate] = {
            ...marked[selectedDate],
            selected: true,
            selectedColor: theme.colors.actionPrimary,
            selectedTextColor: '#ffffff'
        };
        return marked;
    }, [eventsByDate, selectedDate, theme]);

    // --- Helpers ---
    const getWeekDays = (baseDate: string) => {
        const start = startOfWeek(parseISO(baseDate), { weekStartsOn: 1 });
        const end = endOfWeek(parseISO(baseDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };

    // --- Renderers ---

    // 1. EVENT CARD (Reused for Day/Week)
    const renderEventCard = (event: any) => {
        const startTime = format(new Date(event.startDate), 'h:mm a');
        const endTime = format(new Date(event.endDate), 'h:mm a');
        const eventColor = event.color || theme.colors.actionPrimary;

        return (
            <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, {
                    backgroundColor: theme.colors.bgSurface,
                    // Remove borderLeft styling, handled by container now
                    padding: 0, // Reset padding for internal layout
                    overflow: 'hidden', // Ensure header doesn't spill out
                }]}
                onPress={() => {
                    setSelectedEvent(event);
                    setIsDetailsVisible(true);
                }}
            >
                {/* Left Side: Time Panel (Solid Color) */}
                <View style={[styles.eventTimeContainer, { backgroundColor: eventColor }]}>
                    <Text style={[styles.eventTime, { color: '#FFFFFF' }]}>
                        {format(new Date(event.startDate), 'h:mm')}
                    </Text>
                    <Text style={[styles.eventAmPm, { color: 'rgba(255,255,255,0.8)' }]}>
                        {format(new Date(event.startDate), 'a')}
                    </Text>
                </View>

                {/* Right Side: Info Panel */}
                <View style={[styles.eventInfo, { padding: 12 }]}>
                    <Text style={[styles.eventTitle, { color: theme.colors.textPrimary }]}>{event.title}</Text>
                    <View style={styles.eventMetaRow}>
                        <Clock size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.eventMetaText, { color: theme.colors.textSecondary }]}>{startTime} - {endTime}</Text>
                    </View>
                    {event.location && (
                        <View style={[styles.eventMetaRow, { marginTop: 4 }]}>
                            <MapPin size={12} color={theme.colors.textSecondary} />
                            <Text style={[styles.eventMetaText, { color: theme.colors.textSecondary }]}>{event.location}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // 2. MONTH VIEW - Custom Full Screen Grid
    const renderDay = useCallback(({ date, state }: any) => {
        if (!date) return <View style={{ flex: 1 }} />; // Fill gap for empty slots if any

        const dateKey = date.dateString;
        const dayEvents = eventsByDate[dateKey] || [];
        const isToday = state === 'today';
        const isCurrentMonth = state !== 'disabled';

        // Dynamic Calculation for Full Screen
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        // Approximation of header height (Header + Weekday Names)
        // Header ~60, Weekday Row ~40, Insets ~50. Total ~150 reserved.
        const AVAILABLE_HEIGHT = screenHeight - (insets.top + 140);
        const CELL_WIDTH = screenWidth / 7;
        // Divide by 6 rows (max weeks in a month) ensures full coverage
        const CELL_HEIGHT = AVAILABLE_HEIGHT / 6;

        return (
            <TouchableOpacity
                style={[styles.dayCell, {
                    width: CELL_WIDTH,
                    height: CELL_HEIGHT,
                    backgroundColor: theme.colors.bgSurface,
                    borderRightWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: theme.colors.borderSubtle,
                    opacity: isCurrentMonth ? 1 : 0.4
                }]}
                onPress={() => {
                    setSelectedDate(date.dateString);
                    setViewMode('day');
                }}
                activeOpacity={0.7}
            >
                <View style={[styles.dayHeaderRow, isToday && { backgroundColor: theme.colors.actionPrimary, borderRadius: 12, marginHorizontal: 4, marginTop: 4 }]}>
                    <Text style={[styles.dayNumberText, {
                        color: isToday ? '#FFFFFF' : theme.colors.textPrimary, // White text for today bubble
                        fontWeight: isToday ? '700' : '500'
                    }]}>
                        {date.day}
                    </Text>
                </View>

                <View style={styles.dayEventsContainer}>
                    {dayEvents.slice(0, 3).map((event: any, index: number) => (
                        <View
                            key={index}
                            style={[styles.miniEventBlock, { backgroundColor: event.color || theme.colors.actionPrimary }]}
                        >
                            <Text numberOfLines={1} style={styles.miniEventText}>
                                {event.title}
                            </Text>
                        </View>
                    ))}
                    {dayEvents.length > 3 && (
                        <Text style={[styles.moreEventsText, { color: theme.colors.textSecondary }]}>
                            {dayEvents.length - 3}+
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [eventsByDate, theme, insets.top]);

    const renderMonthView = () => (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgCanvas }}>
            <CalendarList
                current={selectedDate}
                horizontal={true}
                pagingEnabled={true}
                keyExtractor={(item) => item}
                dayComponent={renderDay}
                // Crucial: Create a seamless grid by removing default spacing
                theme={{
                    calendarBackground: theme.colors.bgCanvas,
                    textMonthFontFamily: 'Inter_600SemiBold',
                    textDayHeaderFontFamily: 'Inter_500Medium',
                    textMonthFontSize: 20,
                    textDayHeaderFontSize: 12,
                    textSectionTitleColor: theme.colors.textSecondary,

                    'stylesheet.calendar.main': {
                        container: {
                            paddingLeft: 0,
                            paddingRight: 0,
                            backgroundColor: theme.colors.bgCanvas
                        },
                        monthView: {
                            backgroundColor: theme.colors.bgSurface, // The grid background
                        },
                        week: {
                            marginTop: 0,
                            marginBottom: 0,
                            flexDirection: 'row',
                            justifyContent: 'space-around'
                        }
                    },
                    'stylesheet.calendar.header': {
                        header: {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingLeft: 10,
                            paddingRight: 10,
                            marginTop: 10,
                            marginBottom: 5, // Bring header closer to grid
                            alignItems: 'center'
                        },
                        week: {
                            marginTop: 0,
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderColor: theme.colors.borderSubtle,
                            backgroundColor: theme.colors.bgSurface // Header background match
                        }
                    }
                } as any}
                // Pass precise height to ensure it fits the screen
                calendarHeight={Dimensions.get('window').height - (insets.top + 70)}
                staticHeader={false}
            />
        </View>
    );

    // 3. WEEK VIEW
    const renderWeekView = () => {
        const weekDays = getWeekDays(selectedDate);
        return (
            <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bgCanvas }} contentContainerStyle={{ paddingBottom: 100 }}>
                {weekDays.map(date => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate[dateKey] || [];
                    const isToday = isSameDay(date, new Date());

                    return (
                        <View key={dateKey} style={styles.weekDayContainer}>
                            <View style={[styles.weekDayHeader, isToday && { backgroundColor: `${theme.colors.actionPrimary}15` }]}>
                                <Text style={[styles.weekDayName, { color: isToday ? theme.colors.actionPrimary : theme.colors.textSecondary }]}>
                                    {format(date, 'EEE').toUpperCase()}
                                </Text>
                                <Text style={[styles.weekDayNumber, { color: isToday ? theme.colors.actionPrimary : theme.colors.textPrimary }]}>
                                    {format(date, 'd')}
                                </Text>
                            </View>
                            <View style={styles.weekDayEvents}>
                                {dayEvents.length > 0 ? (
                                    dayEvents.map(renderEventCard)
                                ) : (
                                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No events</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        );
    };

    // 4. DAY VIEW
    const renderDayView = () => {
        const dayEvents = eventsByDate[selectedDate] || [];
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.bgCanvas }}>
                <View style={styles.dayHeaderStrip}>
                    <TouchableOpacity onPress={() => {
                        const prev = new Date(selectedDate);
                        prev.setDate(prev.getDate() - 1);
                        setSelectedDate(prev.toISOString().split('T')[0]);
                    }}>
                        <ArrowLeft size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.dayHeaderTitle, { color: theme.colors.textPrimary }]}>
                        {format(parseISO(selectedDate), 'EEEE, MMMM d')}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        const next = new Date(selectedDate);
                        next.setDate(next.getDate() + 1);
                        setSelectedDate(next.toISOString().split('T')[0]);
                    }}>
                        <ArrowLeft size={20} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                    {dayEvents.length > 0 ? (
                        dayEvents.map(renderEventCard)
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>No events for this day</Text>
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary }]}
                                onPress={() => setIsCreateModalVisible(true)}
                            >
                                <Text style={styles.createButtonText}>Add Event</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Main Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.bgSurface, borderBottomColor: theme.colors.borderSubtle }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>

                {/* View Switcher Segmented Control */}
                <View style={[styles.viewSwitcher, { backgroundColor: theme.colors.bgCanvas }]}>
                    {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                        <TouchableOpacity
                            key={mode}
                            style={[
                                styles.viewOption,
                                viewMode === mode && { backgroundColor: theme.colors.bgSurface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }
                            ]}
                            onPress={() => setViewMode(mode)}
                        >
                            <Text style={[
                                styles.viewOptionText,
                                {
                                    color: viewMode === mode ? theme.colors.textPrimary : theme.colors.textSecondary,
                                    fontWeight: viewMode === mode ? '600' : '400'
                                }
                            ]}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.actionPrimary }]}
                        onPress={() => setIsCreateModalVisible(true)}
                    >
                        <Plus size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
            </View>

            <CreateEventModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    setIsCreateModalVisible(false);
                }}
            />

            <EventDetailsModal
                visible={isDetailsVisible}
                event={selectedEvent}
                onClose={() => {
                    setIsDetailsVisible(false);
                    setSelectedEvent(null);
                }}
                onEdit={() => {
                    setIsDetailsVisible(false);
                    // Small delay to allow modal to close smoothly
                    setTimeout(() => setIsEditModalVisible(true), 100);
                }}
            />

            <EditEventModal
                visible={isEditModalVisible}
                event={selectedEvent}
                onClose={() => {
                    setIsEditModalVisible(false);
                    setSelectedEvent(null);
                }}
                onSuccess={() => {
                    setIsEditModalVisible(false);
                    setSelectedEvent(null);
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
        zIndex: 10,
    },
    headerButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewSwitcher: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 4,
        marginHorizontal: 8,
    },
    viewOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    viewOptionText: {
        fontSize: 12,
    },
    addButton: {
        padding: 8,
        borderRadius: 20,
    },
    content: {
        flex: 1,
    },
    // Event Styling
    eventCard: {
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: 12,
        // Removed borderLeftWidth as we now use solid bg panel
        alignItems: 'stretch', // Ensure children fill height
        // Bento shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    eventTimeContainer: {
        alignItems: 'center',
        justifyContent: 'center', // Center vertically in the colored block
        width: 75, // Increased from 40 to fit "12:30" comfortably
    },
    eventTime: {
        fontSize: 16,
        fontWeight: '600',
    },
    eventAmPm: {
        fontSize: 11,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    eventMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventMetaText: {
        fontSize: 12,
    },
    // Week View Styles
    weekDayContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    weekDayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    weekDayName: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 6,
    },
    weekDayNumber: {
        fontSize: 14,
        fontWeight: '700',
    },
    weekDayEvents: {
        paddingLeft: 8,
    },
    emptyText: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    // Day View Header
    dayHeaderStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    dayHeaderTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyStateText: {
        fontSize: 16,
        marginBottom: 16,
    },
    createButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Custom Grid Styles
    dayCell: {
        width: '100%',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 2, // Reduced padding so bars are wider
    },
    dayHeaderRow: {
        alignItems: 'center',
        marginBottom: 4,
        marginTop: 2,
    },
    dayNumberText: {
        fontSize: 12,
    },
    dayEventsContainer: {
        flex: 1,
        gap: 2,
        width: '100%', // Ensure fills width
    },
    miniEventBlock: {
        borderRadius: 3, // Less round, more bar-like
        paddingHorizontal: 3,
        paddingVertical: 3, // Thicker bar
        width: '100%',      // Full width
        justifyContent: 'center',
    },
    miniEventText: {
        fontSize: 9.5, // Slightly smaller to fit "12:30..."
        color: '#FFFFFF',
        fontWeight: '700', // Bold for visibility
        lineHeight: 12,    // Tweak line height
    },
    moreEventsText: {
        fontSize: 9,
        textAlign: 'center',
        fontWeight: '600',
    }
});
