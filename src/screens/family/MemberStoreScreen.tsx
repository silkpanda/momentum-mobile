// =========================================================
// momentum-mobile/src/screens/family/MemberStoreScreen.tsx
// Child Store View - For spending points
// =========================================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity, Platform, DeviceEventEmitter } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Star, ShoppingBag } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';
import { StoreItem, Member } from '../../types';
import StoreItemCard from '../../components/shared/StoreItemCard';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../../contexts/SocketContext';

type MemberStoreRouteProp = RouteProp<RootStackParamList, 'MemberStore'>;

export default function MemberStoreScreen() {
    const route = useRoute<MemberStoreRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { on, off } = useSocket();

    const { memberId, userId, memberName, memberColor, memberPoints: initialPoints } = route.params;
    const theme = themes.calmLight;

    const [items, setItems] = useState<StoreItem[]>([]);
    const [currentPoints, setCurrentPoints] = useState(initialPoints);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [storeResponse, familyResponse] = await Promise.all([
                api.getStoreItems(),
                api.getFamilyData()
            ]);

            if (storeResponse.data && storeResponse.data.storeItems) {
                setItems(storeResponse.data.storeItems);
            }

            // Update points from family data
            if (familyResponse.data && familyResponse.data.household && familyResponse.data.household.members) {
                const member = familyResponse.data.household.members.find((m: Member) => m.id === memberId || m._id === memberId);
                if (member) {
                    setCurrentPoints(member.pointsTotal || 0);
                }
            }
        } catch (error) {
            console.error('Error loading store data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Real-time updates
    useEffect(() => {
        const handleUpdate = () => {
            console.log('🔄 Received real-time update in Store, refreshing...');
            loadData();
        };

        on('member_points_updated', handleUpdate);
        on('store_item_updated', handleUpdate);

        return () => {
            off('member_points_updated', handleUpdate);
            off('store_item_updated', handleUpdate);
        };
    }, [on, off]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
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
        // Optimistic Update: Immediately deduct points
        const previousPoints = currentPoints;
        setCurrentPoints(prev => prev - item.cost);

        try {
            // Use userId (FamilyMember ID) for the purchase transaction as required by the backend
            const response = await api.purchaseItem(item._id || item.id, userId);

            if (Platform.OS === 'web') {
                console.log(`Redeemed ${item.itemName}`);
            } else {
                Alert.alert('Success!', `You redeemed ${item.itemName}!`);
            }

            // Update points from the server response if available
            if (response.data && typeof response.data.newPointsTotal === 'number') {
                console.log(`[Store] Updated points from server: ${response.data.newPointsTotal}`);
                setCurrentPoints(response.data.newPointsTotal);

                // Notify MemberDetailScreen immediately
                DeviceEventEmitter.emit('update_member_points', {
                    memberId,
                    points: response.data.newPointsTotal
                });
            } else {
                // Fallback to reloading data
                loadData();
            }
        } catch (error: any) {
            console.error('Error purchasing item:', error);
            Alert.alert('Error', 'Failed to redeem item. Please try again.');

            // Revert optimistic update on failure
            setCurrentPoints(previousPoints);
        }
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

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.actionPrimary} />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={({ item }) => (
                        <StoreItemCard
                            item={item}
                            userPoints={currentPoints}
                            onPurchase={() => handlePurchase(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <ShoppingBag size={48} color={theme.colors.borderSubtle} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                No rewards available yet.
                            </Text>
                        </View>
                    }
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
