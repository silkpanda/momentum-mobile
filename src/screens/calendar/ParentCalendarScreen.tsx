import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CalendarProvider, ExpandableCalendar, AgendaList, DateData, CalendarUtils } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Plus, Settings, MapPin, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCalendar } from '../../hooks/useCalendar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarSettingsModal from '../../components/calendar/CalendarSettingsModal';
import CreateEventModal from '../../components/calendar/CreateEventModal';
import { format, parseISO, isSameDay } from 'date-fns';

export default function ParentCalendarScreen() {
    const { currentTheme: theme } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { events, refreshEvents, isLoading } = useCalendar();

    // Default to today
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [selectedDate, setSelectedDate] = useState(today);

    // Modal states
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshEvents();
        }, [refreshEvents])
    );

    // Transform events for AgendaList: [{ title: '2023-10-01', data: [...] }]
    const sectionedEvents = useMemo(() => {
        if (!events || events.length === 0) return [];

        // 1. Group by date
        const grouped: { [key: string]: any[] } = {};
        events.forEach(event => {
            const dateStr = event.startDate instanceof Date
                ? event.startDate.toISOString()
                : event.startDate;
            const dateKey = dateStr.split('T')[0];

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });

        // 2. Sort dates and Create sections
        const sortedDates = Object.keys(grouped).sort();

        return sortedDates.map(date => ({
            title: date,
            data: grouped[date].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        }));
    }, [events]);

    // Marked dates for the calendar dots
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

            // Add a dot for each event (limit to 3 to avoid clutter)
            if (marked[dateKey].dots.length < 3) {
                marked[dateKey].dots.push({
                    color: event.color || theme.colors.actionPrimary
                });
            }
        });

        return marked;
    }, [events, theme.colors.actionPrimary]);

    const onDateChanged = useCallback((date: string, updateSource: string) => {
        setSelectedDate(date);
    }, []);

    const calendarTheme = useMemo(() => ({
        calendarBackground: theme.colors.bgSurface,
        todayTextColor: theme.colors.actionPrimary,
        dayTextColor: theme.colors.textPrimary,
        textDisabledColor: theme.colors.textSecondary,
        monthTextColor: theme.colors.textPrimary,
        selectedDayBackgroundColor: theme.colors.actionPrimary,
        selectedDayTextColor: '#ffffff',
        dotColor: theme.colors.actionPrimary,
        selectedDotColor: '#ffffff',
        arrowColor: theme.colors.actionPrimary,
        textDayFontFamily: 'Inter_400Regular',
        textMonthFontFamily: 'Inter_600SemiBold',
        textDayHeaderFontFamily: 'Inter_500Medium',
        stylesheet: {
            calendar: {
                header: {
                    dayHeader: {
                        fontWeight: '600',
                        color: theme.colors.textSecondary,
                        fontFamily: 'Inter_500Medium'
                    }
                }
            },
            expandable: {
                main: {
                    container: {
                        shadowColor: 'transparent', // Remove library default shadow to control it ourselves or keep it clean
                        elevation: 0
                    }
                }
            }
        }
    }), [theme]);

    const renderSectionHeader = useCallback((section: any) => {
        const date = parseISO(section);
        const dateText = format(date, 'EEEE, MMMM d');
        const isToday = isSameDay(date, new Date());

        return (
            <View style={[styles.sectionHeaderContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                <Text style={[
                    styles.sectionHeaderText,
                    {
                        color: isToday ? theme.colors.actionPrimary : theme.colors.textPrimary,
                        fontFamily: isToday ? 'Inter_600SemiBold' : 'Inter_600SemiBold'
                    }
                ]}>
                    {isToday ? 'Today, ' : ''}{dateText}
                </Text>
            </View>
        );
    }, [theme]);

    const renderEventItem = useCallback(({ item }: { item: any }) => {
        const startTime = format(new Date(item.startDate), 'h:mm a');
        const endTime = format(new Date(item.endDate), 'h:mm a');

        return (
            <TouchableOpacity
                style={[styles.itemContainer, { backgroundColor: theme.colors.bgSurface }]}
                onPress={() => Alert.alert('Event Details', `${item.title}\n${startTime} - ${endTime}`)} // Placeholder until Edit implemented
            >
                <View style={styles.timeColumn}>
                    <Text style={[styles.timeText, { color: theme.colors.textPrimary }]}>{format(new Date(item.startDate), 'h:mm')}</Text>
                    <Text style={[styles.ampmText, { color: theme.colors.textSecondary }]}>{format(new Date(item.startDate), 'a')}</Text>
                </View>

                <View style={[styles.eventCard, {
                    backgroundColor: item.color ? `${item.color}15` : `${theme.colors.actionPrimary}15`, // Light bg
                    borderLeftColor: item.color || theme.colors.actionPrimary
                }]}>
                    <Text style={[styles.eventTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                    <View style={styles.eventFooter}>
                        <View style={styles.iconRow}>
                            <Clock size={12} color={theme.colors.textSecondary} />
                            <Text style={[styles.subText, { color: theme.colors.textSecondary }]}> {startTime} - {endTime}</Text>
                        </View>
                        {item.location && (
                            <View style={[styles.iconRow, { marginLeft: 12 }]}>
                                <MapPin size={12} color={theme.colors.textSecondary} />
                                <Text style={[styles.subText, { color: theme.colors.textSecondary }]}> {item.location}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, [theme]);

    const renderEmptyItem = () => {
        return (
            <View style={styles.emptyItem}>
                <Text style={{ color: theme.colors.textSecondary }}>No events planned</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.bgSurface, borderBottomColor: theme.colors.borderSubtle }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Calendar</Text>
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

            <CalendarProvider
                date={selectedDate}
                onDateChanged={onDateChanged}
                showTodayButton
                theme={calendarTheme}
            >
                <ExpandableCalendar
                    firstDay={1}
                    markedDates={markedDates}
                    theme={calendarTheme}
                    hideKnob={false} // Show the handle to swipe
                    allowShadow={true} // Add shadow for depth
                    disablePan={false} // Enable swiping
                    renderArrow={(direction) => {
                        if (direction === 'left') {
                            return <ArrowLeft size={20} color={theme.colors.actionPrimary} />;
                        } else {
                            return <ArrowLeft size={20} color={theme.colors.actionPrimary} style={{ transform: [{ rotate: '180deg' }] }} />;
                        }
                    }}
                />

                {sectionedEvents.length > 0 ? (
                    <AgendaList
                        sections={sectionedEvents}
                        renderItem={renderEventItem}
                        renderSectionHeader={renderSectionHeader}
                        sectionStyle={{ backgroundColor: theme.colors.bgCanvas }}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                            No upcoming events
                        </Text>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={() => setIsCreateModalVisible(true)}
                        >
                            <Text style={styles.createButtonText}>Add Event</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </CalendarProvider>

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
        zIndex: 10, // Ensure header is above calendar
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
    // Event Item Styles
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    timeColumn: {
        width: 50,
        alignItems: 'flex-end',
        marginRight: 12,
        paddingTop: 2,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    ampmText: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 2,
    },
    eventCard: {
        flex: 1,
        borderRadius: 16, // More rounded (Bento style)
        padding: 16, // More breathing room
        borderLeftWidth: 4,
        shadowColor: "#000", // Subtle shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '700', // Bolder title
        marginBottom: 6,
    },
    eventFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subText: {
        fontSize: 12,
        marginLeft: 4,
    },
    section: {
        fontSize: 14,
        fontWeight: '600',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
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
    emptyItem: {
        padding: 20,
        alignItems: 'center',
    },
    sectionHeaderContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    sectionHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase', // Optional Bento touch
        letterSpacing: 0.5,
    }
});
