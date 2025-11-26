// src/contexts/DataContext.tsx
// Global data cache - Load once, share everywhere
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { logger } from '../utils/logger';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Task, Quest, Member, StoreItem, Meal, Restaurant, Routine, WishlistItem } from '../types';

interface DataContextType {
    // Data
    tasks: Task[];
    quests: Quest[];
    members: Member[];
    storeItems: StoreItem[];
    meals: Meal[];
    restaurants: Restaurant[];
    routines: Routine[];
    wishlistItems: WishlistItem[];
    householdId: string;

    // Loading states
    isInitialLoad: boolean;
    isRefreshing: boolean;

    // Actions
    refresh: () => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    updateQuest: (questId: string, updates: Partial<Quest>) => void;
    updateMember: (memberId: string, updates: Partial<Member>) => void;
    updateRoutine: (routineId: string, updates: Partial<Routine>) => void;
    updateWishlistItem: (itemId: string, updates: Partial<WishlistItem>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { on, off } = useSocket();

    // All data in one place
    const [tasks, setTasks] = useState<Task[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [householdId, setHouseholdId] = useState<string>('');

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load ALL data once
    const loadAllData = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                logger.info('🔄 Loading all app data...');
            }

            // Fetch everything in parallel
            const [
                tasksRes,
                questsRes,
                dashboardRes,
                storeRes,
                mealsRes,
                restaurantsRes,
                routinesRes,
            ] = await Promise.all([
                api.getTasks(),
                api.getQuests(),
                api.getDashboardData(),
                api.getStoreItems(),
                api.getMeals().catch(() => ({ data: { meals: [] } })), // Optional
                api.getRestaurants().catch(() => ({ data: { restaurants: [] } })), // Optional
                api.getAllRoutines().catch(() => ({ data: { routines: [] } })), // Optional
            ]);

            // Update all state at once
            if (tasksRes.data?.tasks) setTasks(tasksRes.data.tasks);
            if (questsRes.data?.quests) setQuests(questsRes.data.quests);
            if (storeRes.data?.storeItems) setStoreItems(storeRes.data.storeItems);
            // API can return either 'recipes' or 'meals'
            if (mealsRes.data && 'recipes' in mealsRes.data) setMeals(mealsRes.data.recipes);
            if (restaurantsRes.data?.restaurants) setRestaurants(restaurantsRes.data.restaurants);
            if (routinesRes.data?.routines) setRoutines(routinesRes.data.routines);

            if (dashboardRes.data?.household) {
                const household = dashboardRes.data.household;
                setHouseholdId(household.id || household._id || '');

                if (household.members) {
                    const sanitizedMembers = household.members.map((m: any) => ({
                        ...m,
                        id: m.id || m._id
                    }));
                    setMembers(sanitizedMembers);

                    // Fetch wishlist for all members
                    try {
                        const wishlistPromises = sanitizedMembers.map((member: Member) =>
                            api.getWishlist(member.id || member._id || '').catch(() => ({ data: { wishlistItems: [] } }))
                        );
                        const wishlistResults = await Promise.all(wishlistPromises);

                        // Combine all wishlist items from all members
                        const allWishlistItems: WishlistItem[] = [];
                        wishlistResults.forEach(result => {
                            if (result.data?.wishlistItems) {
                                allWishlistItems.push(...result.data.wishlistItems);
                            }
                        });
                        setWishlistItems(allWishlistItems);
                    } catch (error) {
                        logger.error('Error loading wishlist items:', error);
                        setWishlistItems([]);
                    }
                }
            }

            if (!silent) {
                logger.info('✅ All data loaded successfully', {
                    tasks: tasksRes.data?.tasks?.length || 0,
                    quests: questsRes.data?.quests?.length || 0,
                    members: members.length,
                    storeItems: storeRes.data?.storeItems?.length || 0,
                    routines: routinesRes.data?.routines?.length || 0,
                    wishlistItems: wishlistItems.length,
                });
            }
        } catch (error) {
            logger.error('❌ Error loading data:', error);
        } finally {
            setIsInitialLoad(false);
            setIsRefreshing(false);
        }
    }, []);

    // Optimistic update helpers
    const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t =>
            (t.id === taskId || t._id === taskId) ? { ...t, ...updates } : t
        ));
    }, []);

    const updateQuest = useCallback((questId: string, updates: Partial<Quest>) => {
        setQuests(prev => prev.map(q =>
            (q.id === questId || q._id === questId) ? { ...q, ...updates } : q
        ));
    }, []);

    const updateMember = useCallback((memberId: string, updates: Partial<Member>) => {
        setMembers(prev => prev.map(m =>
            (m.id === memberId || m._id === memberId) ? { ...m, ...updates } : m
        ));
    }, []);

    const updateRoutine = useCallback((routineId: string, updates: Partial<Routine>) => {
        setRoutines(prev => prev.map(r =>
            (r.id === routineId || r._id === routineId) ? { ...r, ...updates } : r
        ));
    }, []);

    const updateWishlistItem = useCallback((itemId: string, updates: Partial<WishlistItem>) => {
        setWishlistItems(prev => prev.map(item =>
            (item.id === itemId || item._id === itemId) ? { ...item, ...updates } : item
        ));
    }, []);

    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadAllData();
    }, [loadAllData]);

    // Load data on mount (when authenticated)
    useEffect(() => {
        if (isAuthenticated) {
            loadAllData();
        }
    }, [isAuthenticated, loadAllData]);

    // WebSocket listeners - update data in real-time
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleTaskUpdate = () => {
            logger.info('📡 Task updated via WebSocket');
            loadAllData(true); // Silent reload
        };

        const handleQuestUpdate = () => {
            logger.info('📡 Quest updated via WebSocket');
            loadAllData(true);
        };

        const handleMemberUpdate = () => {
            logger.info('📡 Member updated via WebSocket');
            loadAllData(true);
        };

        const handleStoreUpdate = () => {
            logger.info('📡 Store updated via WebSocket');
            loadAllData(true);
        };

        const handleRoutineUpdate = () => {
            logger.info('📡 Routine updated via WebSocket');
            loadAllData(true);
        };

        const handleWishlistUpdate = () => {
            logger.info('📡 Wishlist updated via WebSocket');
            loadAllData(true);
        };

        on('taskUpdated', handleTaskUpdate);
        on('questUpdated', handleQuestUpdate);
        on('memberUpdated', handleMemberUpdate);
        on('storeUpdated', handleStoreUpdate);
        on('routine_updated', handleRoutineUpdate);
        on('wishlist_updated', handleWishlistUpdate);

        return () => {
            off('taskUpdated', handleTaskUpdate);
            off('questUpdated', handleQuestUpdate);
            off('memberUpdated', handleMemberUpdate);
            off('storeUpdated', handleStoreUpdate);
            off('routine_updated', handleRoutineUpdate);
            off('wishlist_updated', handleWishlistUpdate);
        };
    }, [isAuthenticated, on, off, loadAllData]);

    const value: DataContextType = {
        tasks,
        quests,
        members,
        storeItems,
        meals,
        restaurants,
        routines,
        wishlistItems,
        householdId,
        isInitialLoad,
        isRefreshing,
        refresh,
        updateTask,
        updateQuest,
        updateMember,
        updateRoutine,
        updateWishlistItem,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
}
