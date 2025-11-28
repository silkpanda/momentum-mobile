import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';

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
                .filter(cal => cal.allowsModifications || cal.source.type !== 'local') // Try to get synced calendars
                .map(cal => ({
                    id: cal.id,
                    title: cal.title,
                    color: cal.color,
                    type: cal.source.type
                }));
        } catch (error) {
            logger.error('Error fetching calendars:', error);
            return [];
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
