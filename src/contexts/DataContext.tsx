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
    household: any; // Added household
    storeItems: StoreItem[];
    meals: Meal[];
    restaurants: Restaurant[];
    routines: Routine[];
    wishlistItems: WishlistItem[];
    events: any[]; // Calendar events
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
    // State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [household, setHousehold] = useState<any | null>(null);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [events, setEvents] = useState<any[]>([]); // Calendar events

    // Derived state (backwards compatibility)
    const householdId = household?.id || household?._id || '';

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load ALL data once
    const loadAllData = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                logger.info('🔄 Loading all app data...');
            }

            // Fetch everything in ONE request
            const response = await api.getDashboardData();

            if (response.data) {
                const {
                    household: fetchedHousehold,
                    tasks: fetchedTasks,
                    quests: fetchedQuests,
                    storeItems: fetchedStoreItems,
                    meals: fetchedMeals,
                    restaurants: fetchedRestaurants,
                    routines: fetchedRoutines,
                    wishlistItems: fetchedWishlistItems,
                    events: fetchedEvents
                } = response.data;

                // Update all state
                if (fetchedTasks) setTasks(fetchedTasks);
                if (fetchedQuests) setQuests(fetchedQuests);
                if (fetchedStoreItems) setStoreItems(fetchedStoreItems);
                if (fetchedMeals) setMeals(fetchedMeals);
                if (fetchedRestaurants) setRestaurants(fetchedRestaurants);
                if (fetchedRoutines) setRoutines(fetchedRoutines);
                if (fetchedWishlistItems) setWishlistItems(fetchedWishlistItems);
                if (fetchedEvents) {
                    console.log('[DataContext] Setting events from API:', fetchedEvents.length);
                    setEvents(fetchedEvents);
                } else {
                    console.log('[DataContext] No events in API response');
                }

                if (fetchedHousehold) {
                    setHousehold(fetchedHousehold);

                    if (fetchedHousehold.members) {
                        const sanitizedMembers = fetchedHousehold.members.map((m: any) => ({
                            ...m,
                            id: m.id || m._id
                        }));
                        setMembers(sanitizedMembers);
                    }
                }
            }

            if (!silent) {
                logger.info('✅ All data loaded successfully (Unified Sync)');
            }

            // Trigger background Google Calendar sync to populate MongoDB
            // This runs in the background and doesn't block the UI
            api.getGoogleCalendarEvents().catch(err => {
                // Silent fail - calendar might not be connected yet
                logger.info('Background calendar sync skipped:', err.message);
            });
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

    // Periodic background sync with Google Calendar (every 5 minutes)
    useEffect(() => {
        if (!isAuthenticated) return;

        const syncInterval = setInterval(() => {
            logger.info('🔄 Running periodic Google Calendar sync...');
            api.getGoogleCalendarEvents().catch(err => {
                logger.info('Periodic calendar sync skipped:', err.message);
            });
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(syncInterval);
    }, [isAuthenticated]);

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

        const handleHouseholdUpdate = () => {
            logger.info('📡 Household updated via WebSocket - refreshing members');
            loadAllData(true); // Reload all data to get fresh member list
        };

        const handleEventUpdate = () => {
            logger.info('📡 Calendar event updated via WebSocket');
            loadAllData(true); // Reload to get fresh events
        };

        on('taskUpdated', handleTaskUpdate);
        on('questUpdated', handleQuestUpdate);
        on('memberUpdated', handleMemberUpdate);
        on('storeUpdated', handleStoreUpdate);
        on('routine_updated', handleRoutineUpdate);
        on('wishlist_updated', handleWishlistUpdate);
        on('household_updated', handleHouseholdUpdate);
        on('event_updated', handleEventUpdate);

        return () => {
            off('taskUpdated', handleTaskUpdate);
            off('questUpdated', handleQuestUpdate);
            off('memberUpdated', handleMemberUpdate);
            off('storeUpdated', handleStoreUpdate);
            off('routine_updated', handleRoutineUpdate);
            off('wishlist_updated', handleWishlistUpdate);
            off('household_updated', handleHouseholdUpdate);
            off('event_updated', handleEventUpdate);
        };
    }, [isAuthenticated, on, off, loadAllData]);

    const value: DataContextType = {
        tasks,
        quests,
        members,
        household,
        storeItems,
        meals,
        restaurants,
        routines,
        wishlistItems,
        events,
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
