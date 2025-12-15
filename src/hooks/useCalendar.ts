import { useState, useEffect, useCallback } from 'react';
import { calendarService, CalendarEvent, CalendarSource } from '../services/calendarService';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import { useData } from '../contexts/DataContext';

export const useCalendar = () => {
    const { events: dataContextEvents, isInitialLoad } = useData(); // Get pre-loaded events
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [calendars, setCalendars] = useState<CalendarSource[]>([]);
    const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load saved calendar preferences and calendars
    useEffect(() => {
        loadPreferences();
        refreshCalendars();
    }, []);

    // Sync events from DataContext (instant load!)
    useEffect(() => {
        console.log('[useCalendar] DataContext events updated:', dataContextEvents?.length || 0);

        if (dataContextEvents) {
            const formattedEvents = dataContextEvents.map((evt: any) => ({
                id: evt.id,
                title: evt.summary || evt.title || 'No Title',
                startDate: evt.start?.dateTime || evt.start?.date || evt.startDate,
                endDate: evt.end?.dateTime || evt.end?.date || evt.endDate,
                allDay: evt.allDay || !evt.start?.dateTime,
                location: evt.location,
                notes: evt.description,
                calendarId: 'google-primary',
                calendarId: 'google-primary',
                color: evt.color || '#4285F4',
                attendees: evt.attendees || [],
            }));
            console.log('[useCalendar] Setting formatted events:', formattedEvents.length);
            setEvents(formattedEvents);
        }
    }, [dataContextEvents]);

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

        try {
            const response: any = await api.getGoogleCalendarEvents();

            let googleEventsData: any[] = [];

            if (response?.data?.events && Array.isArray(response.data.events)) {
                googleEventsData = response.data.events;
            } else if (Array.isArray(response)) {
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
                color: evt.color || '#4285F4',
                attendees: evt.attendees || [],
            }));

            setEvents(googleEvents);
        } catch (error) {
            console.log('Google Calendar fetch skipped/failed:', error);
        }

        setIsLoading(false);
    }, [selectedCalendarIds]);

    // Optimistically add an event to the UI before server confirmation
    const addOptimisticEvent = useCallback((event: Partial<CalendarEvent>) => {
        const optimisticEvent: CalendarEvent = {
            id: `temp-${Date.now()}`,
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
        isLoading: isLoading || isInitialLoad, // Show loading if DataContext is still loading
        refreshCalendars,
        refreshEvents,
        toggleCalendar,
        addOptimisticEvent,
    };
};
