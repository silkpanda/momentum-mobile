import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { Notification, NotificationType } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenterScreen = () => {
    const { currentTheme: theme } = useTheme();
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
            const response = await api.getNotifications();
            if (response.data) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n._id === id || n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.isRead) {
            await handleMarkAsRead(notification._id || notification.id);
        }

        // Navigate based on type
        switch (notification.type) {
            case NotificationType.TASK_ASSIGNED:
            case NotificationType.TASK_APPROVED:
            case NotificationType.QUEST_AVAILABLE:
                // Go to Family view where they can access their profile
                navigation.navigate('Family' as never);
                break;

            case NotificationType.TASK_COMPLETED:
            case NotificationType.APPROVAL_REQUEST:
            case NotificationType.REWARD_REDEEMED:
                // Go to Parent Dashboard for approvals/redemptions
                navigation.navigate('Parent' as never);
                break;

            default:
                // Default to Family view
                navigation.navigate('Family' as never);
                break;
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.TASK_ASSIGNED: return 'clipboard-outline';
            case NotificationType.TASK_COMPLETED: return 'checkmark-circle-outline';
            case NotificationType.TASK_APPROVED: return 'thumbs-up-outline';
            case NotificationType.QUEST_AVAILABLE: return 'map-outline';
            case NotificationType.REWARD_REDEEMED: return 'gift-outline';
            case NotificationType.REMINDER: return 'alarm-outline';
            case NotificationType.APPROVAL_REQUEST: return 'alert-circle-outline';
            default: return 'notifications-outline';
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                {
                    backgroundColor: item.isRead ? theme.colors.bgCanvas : theme.colors.bgSurface,
                    borderBottomColor: theme.colors.borderSubtle
                }
            ]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.actionPrimary + '10' }]}>
                <Ionicons
                    name={getIcon(item.type) as any}
                    size={24}
                    color={theme.colors.actionPrimary}
                />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Text>
                </View>
                <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            {!item.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.actionPrimary }]} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                    <Text style={[styles.markAllText, { color: theme.colors.actionPrimary }]}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id || item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                No notifications yet
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 60, // Safe area
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    markAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
    }
});
