// src/components/routines/RoutineDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Routine, RoutineItem } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Sunrise, Sun, Moon, Edit2 } from 'lucide-react-native';
import RoutineItemCheckbox from './RoutineItemCheckbox';
import { api } from '../../services/api';
import { logger } from '../../utils/logger';
import EditRoutineModal from './EditRoutineModal';

interface RoutineDetailModalProps {
    visible: boolean;
    onClose: () => void;
    routine: Routine | null;
    onUpdate: (updatedRoutine: Routine) => void;
    canEdit?: boolean; // If true, allows checking off items
}

const getTimeOfDayIcon = (timeOfDay: string, color: string, size: number) => {
    switch (timeOfDay) {
        case 'morning':
            return <Sunrise size={size} color={color} />;
        case 'noon':
            return <Sun size={size} color={color} />;
        case 'night':
            return <Moon size={size} color={color} />;
        default:
            return <Sun size={size} color={color} />;
    }
};

export default function RoutineDetailModal({
    visible,
    onClose,
    routine,
    onUpdate,
    canEdit = true
}: RoutineDetailModalProps) {
    const { currentTheme: theme } = useTheme();
    const { user } = useAuth();
    const [localRoutine, setLocalRoutine] = useState<Routine | null>(null);
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    useEffect(() => {
        setLocalRoutine(routine);
    }, [routine]);

    if (!localRoutine) return null;

    const handleToggleItem = async (item: RoutineItem) => {
        if (!canEdit || loadingItemId) return;
        if (!item._id) return;

        try {
            setLoadingItemId(item._id);

            // Optimistic update
            const updatedItems = localRoutine.items.map(i =>
                i._id === item._id ? { ...i, isCompleted: !i.isCompleted } : i
            );
            setLocalRoutine({ ...localRoutine, items: updatedItems });

            // API call
            const response = await api.toggleRoutineItem(localRoutine._id || localRoutine.id, item._id);

            if (response.data) {
                // Update with server response to ensure sync
                setLocalRoutine(response.data.routine);
                onUpdate(response.data.routine);
            }
        } catch (error) {
            logger.error('Failed to toggle routine item', error);
            // Revert on error
            setLocalRoutine(routine);
        } finally {
            setLoadingItemId(null);
        }
    };

    const handleEditSuccess = () => {
        // Close the detail modal to force a refresh from the list
        onClose();
        // Trigger update in parent to be safe
        if (localRoutine) {
            onUpdate(localRoutine);
        }
    };

    const completedCount = localRoutine.items.filter(i => i.isCompleted).length;
    const totalCount = localRoutine.items.length;
    const isAllComplete = completedCount === totalCount && totalCount > 0;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.bgSurface }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <View style={styles.headerTitleContainer}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                                {getTimeOfDayIcon(localRoutine.timeOfDay, theme.colors.actionPrimary, 24)}
                            </View>
                            <View>
                                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                    {localRoutine.title}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                    {completedCount}/{totalCount} completed
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            {user?.role === 'Parent' && (
                                <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.iconButton}>
                                    <Edit2 size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content}>
                        {isAllComplete && (
                            <View style={[styles.successBanner, { backgroundColor: theme.colors.signalSuccess + '20' }]}>
                                <Text style={[styles.successText, { color: theme.colors.signalSuccess }]}>
                                    🎉 Routine Complete! Great job!
                                </Text>
                            </View>
                        )}

                        <View style={styles.itemsContainer}>
                            {localRoutine.items.map((item, index) => (
                                <RoutineItemCheckbox
                                    key={item._id || index}
                                    item={item}
                                    onToggle={() => handleToggleItem(item)}
                                    disabled={!canEdit || loadingItemId === item._id}
                                />
                            ))}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={onClose}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Edit Modal */}
            {localRoutine && (
                <EditRoutineModal
                    visible={isEditModalVisible}
                    onClose={() => setIsEditModalVisible(false)}
                    routine={localRoutine}
                    onSuccess={handleEditSuccess}
                />
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    iconButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    successBanner: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    successText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemsContainer: {
        marginBottom: 40,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        paddingBottom: 40, // Extra padding for safe area
    },
    doneButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
