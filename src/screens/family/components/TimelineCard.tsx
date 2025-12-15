import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Event, Member } from '../../../types';
import EventCard from './EventCard';
import { spacing, typography, bentoPalette } from '../../../theme/bentoTokens';
import { format } from 'date-fns';

interface TimelineCardProps {
    events: Event[];
    members: Member[];
}

export default function TimelineCard({ events, members }: TimelineCardProps) {
    const today = new Date();

    // Sort events chronologically
    const sortedEvents = [...events].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>TIMELINE</Text>
                <Text style={styles.date}>{format(today, 'MMMM do')}</Text>
            </View>

            {sortedEvents.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No events scheduled for today.</Text>
                    <Text style={styles.emptySubText}>Enjoy the free time!</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedEvents}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <EventCard event={item} members={members} />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.xs,
    },
    title: {
        ...typography.caption,
        color: 'rgba(0,0,0,0.4)',
        letterSpacing: 2,
        fontWeight: '700',
    },
    date: {
        ...typography.caption,
        color: bentoPalette.textTertiary,
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    emptyText: {
        ...typography.widgetTitle,
        color: bentoPalette.textSecondary,
        marginBottom: spacing.xs,
    },
    emptySubText: {
        ...typography.body,
        color: bentoPalette.textTertiary,
    },
});

