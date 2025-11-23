import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { Plus, Trash2, Map, Star, Pencil } from 'lucide-react-native';
import CreateQuestModal from '../../components/parent/CreateQuestModal';

export default function QuestsScreen() {
    const { user } = useAuth();
    const { currentTheme: theme } = useTheme();
    const [quests, setQuests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [editingQuest, setEditingQuest] = useState<any>(null);

    const loadQuests = async () => {
        try {
            const response = await api.getQuests();
            // Assuming API returns { status: 'success', data: { quests: [...] } }
            if (response.data && response.data.quests) {
                setQuests(response.data.quests);
            } else {
                setQuests([]);
            }
        } catch (error) {
            console.error('Error loading quests:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadQuests();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadQuests();
    };

    const handleDelete = async (questId: string) => {
        Alert.alert(
            'Delete Quest',
            'Are you sure you want to delete this quest?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteQuest(questId);
                            loadQuests();
                        } catch (error) {
                            console.error('Error deleting quest:', error);
                            alert('Failed to delete quest');
                        }
                    }
                }
            ]
        );
    };

    if (isLoading && !quests.length) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.bgCanvas }]}>
                <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Manage Quests</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Create adventures for your family</Text>
            </View>

            <FlatList
                data={quests}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.colors.bgSurface }]}>
                        <View style={styles.cardContent}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.bgCanvas }]}>
                                <Map size={24} color={theme.colors.textSecondary} />
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                                <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
                                <View style={styles.rewardRow}>
                                    <Star size={12} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                                    <Text style={[styles.rewardText, { color: theme.colors.actionPrimary }]}>{item.pointsValue || item.rewardValue} Points</Text>
                                </View>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditingQuest(item);
                                        setIsCreateModalVisible(true);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Pencil size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDelete(item._id || item.id)}
                                    style={styles.actionButton}
                                >
                                    <Trash2 size={20} color={theme.colors.signalAlert} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No quests created yet.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.actionPrimary }]}
                onPress={() => {
                    setEditingQuest(null);
                    setIsCreateModalVisible(true);
                }}
            >
                <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <CreateQuestModal
                visible={isCreateModalVisible}
                onClose={() => {
                    setIsCreateModalVisible(false);
                    setEditingQuest(null);
                }}
                onQuestCreated={() => {
                    loadQuests();
                    setIsCreateModalVisible(false);
                    setEditingQuest(null);
                }}
                initialQuest={editingQuest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    card: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardDescription: {
        fontSize: 12,
    },
    rewardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    rewardText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
