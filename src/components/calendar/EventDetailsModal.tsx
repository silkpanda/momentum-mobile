
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Clock, MapPin, AlignLeft, Calendar as CalendarIcon, Edit2, Trash2, Users } from 'lucide-react-native';
import { format } from 'date-fns';
import { calendarService } from '../../services/calendarService';
import { useData } from '../../contexts/DataContext';

interface EventDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    event: any;
}

export default function EventDetailsModal({ visible, onClose, onEdit, event }: EventDetailsModalProps) {
    const { currentTheme: theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { household, members } = useData();

    const [isDeleting, setIsDeleting] = useState(false);

    if (!event) return null;

    const handleDelete = () => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await calendarService.deleteGoogleEvent(event.id);
                            onClose();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete event');
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    const isAllDay = event.allDay;

    // Resolve attendees names
    const attendeeNames = event.attendees?.map((attendeeId: string) => {
        // Try to find the member in the sanitized list first
        const member = members.find(m => m.userId === attendeeId || m.id === attendeeId);
        if (member) return member.firstName;

        // Fallback to raw profile search if needed (handling populated objects)
        const profile = household?.memberProfiles?.find((p: any) =>
            (p.familyMemberId?._id?.toString() || p.familyMemberId?.toString()) === attendeeId
        );
        return profile?.displayName || profile?.familyMemberId?.firstName || 'Unknown';
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgSurface, paddingBottom: insets.bottom + 20 }]}>
                    {/* Header Bar */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
                                <Edit2 size={20} color={theme.colors.actionPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={styles.iconButton} disabled={isDeleting}>
                                <Trash2 size={20} color={theme.colors.signalAlert} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {/* Title & Color Strip */}
                        <View style={styles.titleRow}>
                            <View style={[styles.colorStrip, { backgroundColor: event.color || theme.colors.actionPrimary }]} />
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{event.title}</Text>
                        </View>

                        {/* Time */}
                        <View style={styles.infoRow}>
                            <Clock size={20} color={theme.colors.textSecondary} style={styles.icon} />
                            <View>
                                {isAllDay ? (
                                    <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>
                                        {format(startTime, 'EEEE, MMMM d')} • All Day
                                    </Text>
                                ) : (
                                    <>
                                        <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>
                                            {format(startTime, 'EEEE, MMMM d')}
                                        </Text>
                                        <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
                                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Location */}
                        {event.location && (
                            <View style={styles.infoRow}>
                                <MapPin size={20} color={theme.colors.textSecondary} style={styles.icon} />
                                <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>{event.location}</Text>
                            </View>
                        )}

                        {/* Attendees */}
                        {attendeeNames && attendeeNames.length > 0 && (
                            <View style={styles.infoRow}>
                                <Users size={20} color={theme.colors.textSecondary} style={styles.icon} />
                                <View style={styles.attendeesContainer}>
                                    {attendeeNames.map((name: string, index: number) => (
                                        <View key={index} style={[styles.attendeeChip, { backgroundColor: theme.colors.bgCanvas }]}>
                                            <Text style={[styles.attendeeText, { color: theme.colors.textPrimary }]}>{name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Notes */}
                        {event.notes && (
                            <View style={[styles.notesContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                                <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>{event.notes}</Text>
                            </View>
                        )}

                        {/* Meta */}
                        <View style={[styles.metaContainer, { borderTopColor: theme.colors.borderSubtle }]}>
                            <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                                Calendar: {event.calendarType === 'family' ? 'Family Calendar' : 'Personal Calendar'}
                            </Text>
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
    },
    content: {
        padding: 20,
        gap: 24,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    colorStrip: {
        width: 6,
        height: 32,
        borderRadius: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },
    icon: {
        marginTop: 2,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '500',
    },
    subText: {
        fontSize: 14,
        marginTop: 2,
    },
    attendeesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        flex: 1,
    },
    attendeeChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    attendeeText: {
        fontSize: 14,
    },
    notesContainer: {
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    notesText: {
        fontSize: 15,
        lineHeight: 22,
    },
    metaContainer: {
        paddingTop: 16,
        borderTopWidth: 1,
    },
    metaText: {
        fontSize: 12,
    },
});
