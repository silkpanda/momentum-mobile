import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Notification, NotificationType } from '../../types';

interface NotificationToastProps {
    notification: Notification | null;
    onDismiss: () => void;
    onPress: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
    notification,
    onDismiss,
    onPress
}) => {
    const { currentTheme: theme } = useTheme();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (notification) {
            // Slide in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();

            // Auto dismiss after 5 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            })
        ]).start(() => {
            onDismiss();
        });
    };

    if (!notification) return null;

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

    const getColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.TASK_COMPLETED:
            case NotificationType.TASK_APPROVED:
                return theme.colors.signalSuccess;
            case NotificationType.APPROVAL_REQUEST:
            case NotificationType.REMINDER:
                return theme.colors.signalAlert; // Use alert color for important items
            case NotificationType.REWARD_REDEEMED:
                return theme.colors.actionPrimary;
            default:
                return theme.colors.textPrimary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.bgSurface,
                    borderColor: theme.colors.borderSubtle,
                    transform: [{ translateY }],
                    opacity
                }
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <View style={[styles.iconContainer, { backgroundColor: getColor(notification.type) + '20' }]}>
                    <Ionicons
                        name={getIcon(notification.type) as any}
                        size={24}
                        color={getColor(notification.type)}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        {notification.title}
                    </Text>
                    <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {notification.message}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 16,
        right: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        zIndex: 9999,
        padding: 12,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
    },
    closeButton: {
        padding: 4,
    }
});
