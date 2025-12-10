import { useState, useEffect, useCallback } from 'react';
import { calendarService, CalendarEvent, CalendarSource } from '../services/calendarService';
import { api } from '../services/api';
import { storage } from '../utils/storage';

export const useCalendar = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [calendars, setCalendars] = useState<CalendarSource[]>([]);
    const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load saved calendar preferences and calendars
    useEffect(() => {
        loadPreferences();
        refreshCalendars();
    }, []);

    const loadPreferences = async () => {
        const savedIds = await storage.getItem('momentum_selected_calendars');
        if (savedIds) {
            setSelectedCalendarIds(JSON.parse(savedIds));
        }
    };

    const toggleCalendar = async (calendarId: string) => {
        const newIds = selectedCalendarIds.includes(calendarId)
            ? selectedCalendarIds.filter(id => id !== calendarId)
            : [...selectedCalendarIds, calendarId];

        setSelectedCalendarIds(newIds);
        await storage.setItem('momentum_selected_calendars', JSON.stringify(newIds));
        // Don't auto-refresh events here, let the consumer decide when to refresh
    };

    const refreshCalendars = useCallback(async () => {
        setIsLoading(true);
        const cals = await calendarService.getCalendars();
        setCalendars(cals);
        setIsLoading(false);
        return cals;
    }, []);

    const refreshEvents = useCallback(async (calendarIds: string[] = selectedCalendarIds) => {
        setIsLoading(true);
        const allEvents: CalendarEvent[] = [];

        // 1. Fetch Device Events
        if (calendarIds.length > 0) {
            const now = new Date();
            const nextMonth = new Date();
            nextMonth.setDate(now.getDate() + 30);

            const deviceEvents = await calendarService.getEvents(now, nextMonth, calendarIds);
            allEvents.push(...deviceEvents);
        }

        // 2. Fetch Google Events
        try {
            const response: any = await api.getGoogleCalendarEvents();

            // The API returns: { status: 'success', data: { events: [...] } }
            let googleEventsData: any[] = [];

            if (response?.data?.events && Array.isArray(response.data.events)) {
                googleEventsData = response.data.events;
            } else if (Array.isArray(response)) {
                // Fallback for direct array response
                googleEventsData = response;
            }

            const googleEvents = googleEventsData.map((evt: any) => ({
                id: evt.id,
                title: evt.summary || 'No Title',
                startDate: evt.start.dateTime || evt.start.date,
                endDate: evt.end.dateTime || evt.end.date,
                allDay: !evt.start.dateTime,
                location: evt.location,
                notes: evt.description,
                calendarId: 'google-primary',
                color: evt.color || '#4285F4', // Use color from API, fallback to Google Blue
            }));

            allEvents.push(...googleEvents);
        } catch (error) {
            // Silent fail for now - user might not be connected
            console.log('Google Calendar fetch skipped/failed:', error);
        }

        // Sort by date
        allEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        setEvents(allEvents);
        setIsLoading(false);
    }, [selectedCalendarIds]);

    // Optimistically add an event to the UI before server confirmation
    const addOptimisticEvent = useCallback((event: Partial<CalendarEvent>) => {
        const optimisticEvent: CalendarEvent = {
            id: `temp-${Date.now()}`, // Temporary ID
            title: event.title || 'New Event',
            startDate: event.startDate || new Date().toISOString(),
            endDate: event.endDate || new Date().toISOString(),
            allDay: event.allDay || false,
            location: event.location || undefined,
            notes: event.notes || undefined,
            calendarId: 'google-primary',
            color: '#4285F4',
        };

        setEvents(prev => [...prev, optimisticEvent].sort((a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        ));

        return optimisticEvent.id;
    }, []);

    return {
        events,
        calendars,
        selectedCalendarIds,
        isLoading,
        refreshCalendars,
        refreshEvents,
        toggleCalendar,
        addOptimisticEvent,
    };
};
