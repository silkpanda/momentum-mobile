import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { api } from './api';

export interface CalendarEvent {
    id: string;
    title: string;
    startDate: string | Date;
    endDate: string | Date;
    allDay: boolean;
    location?: string | null;
    notes?: string;
    calendarId: string;
    color?: string;
}

export interface CalendarSource {
    id: string;
    title: string;
    color: string;
    type: string;
    allowsModifications: boolean;
}

class CalendarService {
    async requestPermissions(): Promise<boolean> {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status === 'granted') {
            return true;
        }

        // For iOS, we might need reminders permission too if we were accessing them, but for now just calendar
        return false;
    }

    async getCalendars(): Promise<CalendarSource[]> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                logger.warn('Calendar permission denied');
                return [];
            }

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

            // Filter out holidays and birthdays if desired, or keep them
            // For now, return all readable calendars
            return calendars
                .map(cal => ({
                    id: cal.id,
                    title: cal.title,
                    color: cal.color,
                    type: cal.source.type,
                    allowsModifications: cal.allowsModifications
                }));
        } catch (error) {
            logger.error('Error fetching calendars:', error);
            return [];
        }
    }

    /**
     * Create an event explicitly on the user's Google Calendar via our Backend API.
     * This ensures it syncs across devices and is visible in Momentum.
     */
    async createGoogleEvent(eventDetails: {
        title: string;
        startDate: Date;
        endDate: Date;
        allDay?: boolean;
        location?: string;
        notes?: string;
    }): Promise<string> {
        try {
            const response = await api.post<{ id: string }>('/calendar/google/events', eventDetails);
            return response.data?.id || 'unknown-id';
        } catch (error) {
            logger.error('Error creating Google event:', error);
            throw error;
        }
    }

    async createEvent(calendarId: string, eventDetails: {
        title: string;
        startDate: Date;
        endDate: Date;
        allDay?: boolean;
        location?: string;
        notes?: string;
    }): Promise<string> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) throw new Error('Calendar permission denied');

            const eventId = await Calendar.createEventAsync(calendarId, {
                title: eventDetails.title,
                startDate: eventDetails.startDate,
                endDate: eventDetails.endDate,
                allDay: eventDetails.allDay,
                location: eventDetails.location,
                notes: eventDetails.notes,
                timeZone: 'UTC', // Or local
            });

            return eventId;
        } catch (error) {
            logger.error('Error creating event:', error);
            throw error;
        }
    }

    async getEvents(startDate: Date, endDate: Date, calendarIds?: string[]): Promise<CalendarEvent[]> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) return [];

            let targetCalendarIds = calendarIds;

            if (!targetCalendarIds || targetCalendarIds.length === 0) {
                const calendars = await this.getCalendars();
                targetCalendarIds = calendars.map(c => c.id);
            }

            if (targetCalendarIds.length === 0) return [];

            const events = await Calendar.getEventsAsync(targetCalendarIds, startDate, endDate);

            return events.map(event => ({
                id: event.id,
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                allDay: event.allDay,
                location: event.location,
                notes: event.notes,
                calendarId: event.calendarId,
                // We'd need to map color from calendar if event doesn't have one, but event usually doesn't have color directly in Expo object
                // We can fetch calendar color later if needed
            })).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        } catch (error) {
            logger.error('Error fetching events:', error);
            return [];
        }
    }
}

export const calendarService = new CalendarService();
