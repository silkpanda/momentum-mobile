import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Event, Member } from '../../../types';
import { bentoPalette, borderRadius, spacing, typography, shadows } from '../../../theme/bentoTokens';
import { format, isPast, isToday } from 'date-fns';
import { MapPin } from 'lucide-react-native';

interface EventCardProps {
    event: Event;
    members: Member[];
}

export default function EventCard({ event, members }: EventCardProps) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const isPastEvent = isPast(endDate);

    // Resolve attendees
    const attendees = (event.attendees || [])
        .map(id => members.find(m => m.id === id))
        .filter((m): m is Member => !!m);

    return (
        <View style={[
            styles.container,
            isPastEvent && styles.pastEventContainer
        ]}>
            <View style={styles.timeColumn}>
                <Text style={[styles.startTime, isPastEvent && styles.dimText]}>
                    {event.allDay ? 'ALL DAY' : format(startDate, 'h:mm a')}
                </Text>
                {!event.allDay && (
                    <Text style={[styles.duration, isPastEvent && styles.dimText]}>
                        {format(startDate, 'h:mm')} - {format(endDate, 'h:mm a')}
                    </Text>
                )}
            </View>

            <View style={[styles.card, isPastEvent && styles.pastCard]}>
                <View style={styles.content}>
                    <Text style={[styles.title, isPastEvent && styles.dimText]} numberOfLines={1}>
                        {event.title}
                    </Text>

                    {event.location && (
                        <View style={styles.row}>
                            <MapPin size={14} color={isPastEvent ? bentoPalette.textTertiary : bentoPalette.textSecondary} />
                            <Text style={[styles.location, isPastEvent && styles.dimText]} numberOfLines={1}>
                                {event.location}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Participant Dots */}
                {attendees.length > 0 && (
                    <View style={styles.attendeesContainer}>
                        {attendees.map(member => (
                            <View
                                key={member.id}
                                style={[
                                    styles.attendeeDot,
                                    { backgroundColor: member.profileColor || bentoPalette.brandLight }
                                ]}
                            >
                                <Text style={styles.attendeeInitials}>
                                    {member.firstName.charAt(0)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    pastEventContainer: {
        opacity: 0.6,
    },
    timeColumn: {
        width: 80,
        alignItems: 'flex-end',
        paddingRight: spacing.md,
    },
    startTime: {
        ...typography.button,
        color: bentoPalette.textPrimary,
        fontWeight: 'bold',
    },
    duration: {
        ...typography.caption,
        color: bentoPalette.textSecondary,
    },
    dimText: {
        color: bentoPalette.textTertiary,
    },
    card: {
        flex: 1,
        backgroundColor: bentoPalette.surface,
        borderRadius: borderRadius.lg, // slightly smaller than XL for list items
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.soft,
        borderLeftWidth: 4,
        borderLeftColor: bentoPalette.brandPrimary,
    },
    pastCard: {
        backgroundColor: '#f5f5f5', // dimmer background
        borderLeftColor: bentoPalette.textTertiary,
        ...shadows.soft, // keep shadow but maybe lighter?
        elevation: 1,
    },
    content: {
        flex: 1,
    },
    title: {
        ...typography.button,
        fontSize: 16,
        color: bentoPalette.textPrimary,
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        ...typography.caption,
        color: bentoPalette.textSecondary,
    },
    attendeesContainer: {
        flexDirection: 'row',
        paddingLeft: spacing.sm,
        gap: -8, // overlap
    },
    attendeeDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    attendeeInitials: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

