// =========================================================
// momentum-mobile/src/screens/family/MemberStoreScreen.tsx
// Child Store View - For spending points
// =========================================================
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity, Platform, DeviceEventEmitter } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Star, ShoppingBag } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { api } from '../../services/api';
import { StoreItem, Member } from '../../types';
import StoreItemCard from '../../components/shared/StoreItemCard';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useSocket } from '../../contexts/SocketContext';
import { useData } from '../../contexts/DataContext';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';

type MemberStoreRouteProp = RouteProp<RootStackParamList, 'MemberStore'>;

export default function MemberStoreScreen() {
    const route = useRoute<MemberStoreRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { on, off } = useSocket();

    const { memberId, userId, memberName, memberColor, memberPoints: initialPoints } = route.params;
    const { currentTheme: theme } = useTheme();

    const { storeItems, members, refresh, isRefreshing } = useData();
    const { execute } = useOptimisticUpdate();

    const [currentPoints, setCurrentPoints] = useState(initialPoints);

    // Get fresh member data to keep points in sync
    const memberData = useMemo(() =>
        members.find(m => m.id === memberId || m._id === memberId),
        [members, memberId]
    );

    // Update local points state when member data changes
    useEffect(() => {
        if (memberData) {
            setCurrentPoints(memberData.pointsTotal || 0);
        }
    }, [memberData?.pointsTotal]);

    // Real-time updates
    useEffect(() => {
        const handleUpdate = (data: any) => {
            // Check if this is a points update for the current member
            if (data && 'pointsTotal' in data && 'memberId' in data && data.memberId === memberId) {
                console.log(`✅ [MemberStore] Socket update points: ${data.pointsTotal}`);
                setCurrentPoints(data.pointsTotal);
            }
        };

        on('member_points_updated', handleUpdate);
        on('store_item_updated', refresh); // Refresh store items if they change

        return () => {
            off('member_points_updated', handleUpdate);
            off('store_item_updated', refresh);
        };
    }, [on, off, memberId, refresh]);

    const onRefresh = () => {
        refresh();
    };

    const handlePurchase = async (item: StoreItem) => {
        if (currentPoints < item.cost) {
            Alert.alert('Not enough points', "You need more points to redeem this reward!");
            return;
        }

        const confirmPurchase = () => {
            performPurchase(item);
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Redeem "${item.itemName}" for ${item.cost} points?`)) {
                confirmPurchase();
            }
        } else {
            Alert.alert(
                'Redeem Reward',
                `Are you sure you want to redeem "${item.itemName}" for ${item.cost} points?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Redeem', onPress: confirmPurchase }
                ]
            );
        }
    };

    const performPurchase = async (item: StoreItem) => {
        const previousPoints = currentPoints;

        await execute({
            optimisticUpdate: () => {
                // Optimistically deduct points
                setCurrentPoints(prev => prev - item.cost);
            },
            apiCall: async () => {
                const response = await api.purchaseItem(item._id || item.id, userId);

                // If successful, update points from server response
                if (response.data && typeof response.data.newPointsTotal === 'number') {
                    console.log(`[Store] Updated points from server: ${response.data.newPointsTotal}`);
                    setCurrentPoints(response.data.newPointsTotal);

                    // Notify MemberDetailScreen immediately
                    DeviceEventEmitter.emit('update_member_points', {
                        memberId,
                        points: response.data.newPointsTotal
                    });
                }
                return response;
            },
            rollback: () => {
                setCurrentPoints(previousPoints);
            },
            successMessage: `You redeemed ${item.itemName}! 🎉`
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
            <View style={[
                styles.header,
                {
                    backgroundColor: theme.colors.bgSurface,
                    borderBottomColor: theme.colors.borderSubtle,
                    paddingTop: insets.top + 16
                }
            ]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                        Rewards Store
                    </Text>
                    <View style={styles.pointsBadge}>
                        <Star size={14} color={theme.colors.actionPrimary} fill={theme.colors.actionPrimary} />
                        <Text style={[styles.pointsText, { color: theme.colors.actionPrimary }]}>
                            {currentPoints} pts
                        </Text>
                    </View>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={storeItems}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <StoreItemCard
                        item={item}
                        userPoints={currentPoints}
                        onPurchase={() => handlePurchase(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ShoppingBag size={48} color={theme.colors.borderSubtle} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No rewards available yet.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        zIndex: 10,
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.1)', // Indigo with opacity
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        gap: 4,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '700',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        gap: 12,
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
