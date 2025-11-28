import { useState, useEffect, useCallback } from 'react';
import { calendarService, CalendarEvent, CalendarSource } from '../services/calendarService';
import { storage } from '../utils/storage';

export const useCalendar = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [calendars, setCalendars] = useState<CalendarSource[]>([]);
    const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load saved calendar preferences
    useEffect(() => {
        loadPreferences();
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

    const refreshCalendars = async () => {
        setIsLoading(true);
        const cals = await calendarService.getCalendars();
        setCalendars(cals);
        setIsLoading(false);
        return cals;
    };

    const refreshEvents = async (calendarIds: string[] = selectedCalendarIds) => {
        if (calendarIds.length === 0) {
            setEvents([]);
            return;
        }

        setIsLoading(true);
        // Fetch next 7 days by default
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const evts = await calendarService.getEvents(now, nextWeek, calendarIds);
        setEvents(evts);
        setIsLoading(false);
    };

    return {
        events,
        calendars,
        selectedCalendarIds,
        isLoading,
        refreshCalendars,
        refreshEvents,
        toggleCalendar
    };
};
