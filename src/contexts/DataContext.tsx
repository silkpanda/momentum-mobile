import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { logger } from '../utils/logger';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Task, Quest, Member, StoreItem, Meal, Restaurant, Routine, WishlistItem } from '../types';

interface DataContextType {
  tasks: Task[]; quests: Quest[]; members: Member[]; household: any;
  storeItems: StoreItem[]; meals: Meal[]; restaurants: Restaurant[];
  routines: Routine[]; wishlistItems: WishlistItem[]; events: any[];
  householdId: string; isInitialLoad: boolean; isRefreshing: boolean;
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

  const [tasks, setTasks] = useState<Task[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [household, setHousehold] = useState<any>(null);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const householdId = household?.id || household?._id || '';

  const loadAllData = useCallback(async (silent = false) => {
    try {
      if (!silent) logger.info('Loading all app data...');
      const response = await api.getDashboardData();
      if (response.data) {
        const d = response.data;
        if (d.tasks) setTasks(d.tasks);
        if (d.quests) setQuests(d.quests);
        if (d.storeItems) setStoreItems(d.storeItems);
        if (d.meals) setMeals(d.meals);
        if (d.restaurants) setRestaurants(d.restaurants);
        if (d.routines) setRoutines(d.routines);
        if (d.wishlistItems) setWishlistItems(d.wishlistItems);
        if (d.events) setEvents(d.events);
        if (d.household) {
          setHousehold(d.household);
          if (d.household.members) setMembers(d.household.members.map((m: any) => ({ ...m, id: m.id || m._id })));
        }
      }
      api.getGoogleCalendarEvents().catch(() => {});
    } catch (error) {
      logger.error('Error loading data:', error);
    } finally {
      setIsInitialLoad(false); setIsRefreshing(false);
    }
  }, []);

  const updateTask = useCallback((id: string, u: Partial<Task>) => { setTasks(p => p.map(t => (t.id === id || t._id === id) ? { ...t, ...u } : t)); }, []);
  const updateQuest = useCallback((id: string, u: Partial<Quest>) => { setQuests(p => p.map(q => (q.id === id || q._id === id) ? { ...q, ...u } : q)); }, []);
  const updateMember = useCallback((id: string, u: Partial<Member>) => { setMembers(p => p.map(m => (m.id === id || m._id === id) ? { ...m, ...u } : m)); }, []);
  const updateRoutine = useCallback((id: string, u: Partial<Routine>) => { setRoutines(p => p.map(r => (r.id === id || r._id === id) ? { ...r, ...u } : r)); }, []);
  const updateWishlistItem = useCallback((id: string, u: Partial<WishlistItem>) => { setWishlistItems(p => p.map(i => ((i.id === id || i._id === id) ? { ...i, ...u } : i))); }, []);

  const refresh = useCallback(async () => { setIsRefreshing(true); await loadAllData(); }, [loadAllData]);

  useEffect(() => { if (isAuthenticated) loadAllData(); }, [isAuthenticated, loadAllData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => { api.getGoogleCalendarEvents().catch(() => {}); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Granular task handler: patch only the changed task instead of refetching everything
    const onTaskUpdated = (payload: { type?: string; task?: any; taskId?: string; memberUpdate?: any }) => {
      if (payload.type === 'create' && payload.task) {
        setTasks(prev => {
          const exists = prev.some(t => t._id === payload.task._id || t.id === payload.task._id);
          return exists ? prev : [payload.task, ...prev];
        });
      } else if (payload.type === 'delete' && payload.taskId) {
        setTasks(prev => prev.filter(t => t._id !== payload.taskId && t.id !== payload.taskId));
      } else if (payload.task) {
        setTasks(prev => {
          const exists = prev.some(t => t._id === payload.task._id || t.id === payload.task._id);
          if (exists) return prev.map(t => (t._id === payload.task._id || t.id === payload.task._id) ? { ...t, ...payload.task } : t);
          return [payload.task, ...prev]; // new task arrived via update event
        });
      }
      // Patch member points inline if the payload includes an update
      if (payload.memberUpdate) {
        const { memberId, ...updates } = payload.memberUpdate;
        if (memberId) updateMember(String(memberId), updates);
      }
    };

    // member_updated carries a targeted patch — no full reload needed
    const onMemberUpdated = (payload: { memberId?: string; [key: string]: any }) => {
      if (payload.memberId) {
        const { memberId, timestamp, ...updates } = payload;
        updateMember(String(memberId), updates);
      }
    };

    // Structural changes (household membership, quests, store, routines, wishlist, events)
    // still trigger a silent full reload since their payloads aren't granular enough yet
    const reload = () => loadAllData(true);

    on('taskUpdated', onTaskUpdated);
    on('member_updated', onMemberUpdated);
    const fullReloadEvents = ['questUpdated', 'storeUpdated', 'routine_updated', 'wishlist_updated', 'household_updated', 'event_updated'];
    fullReloadEvents.forEach(e => on(e, reload));

    return () => {
      off('taskUpdated', onTaskUpdated);
      off('member_updated', onMemberUpdated);
      fullReloadEvents.forEach(e => off(e, reload));
    };
  }, [isAuthenticated, on, off, loadAllData, updateMember]);

  return (
    <DataContext.Provider value={{ tasks, quests, members, household, storeItems, meals, restaurants, routines, wishlistItems, events, householdId, isInitialLoad, isRefreshing, refresh, updateTask, updateQuest, updateMember, updateRoutine, updateWishlistItem }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() { const c = useContext(DataContext); if (!c) throw new Error('useData must be used within DataProvider'); return c; }
