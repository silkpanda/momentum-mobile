import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, TextInput, Alert, RefreshControl, useWindowDimensions } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../src/lib/api';
import { Auth } from '../src/lib/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// --- TYPES ---
interface MemberProfile {
  _id: string;
  familyMemberId: string;
  displayName: string;
  profileColor: string;
  role: 'Parent' | 'Child';
  pointsTotal: number;
}

interface HouseholdData {
  _id: string;
  householdName: string;
  memberProfiles: MemberProfile[];
}

interface Task {
  _id: string;
  title: string;
  pointsValue: number;
  assignedTo: string[];
  status: 'Pending' | 'PendingApproval' | 'Approved';
}

export default function KioskScoreboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions(); 
  
  // Responsive Layout: 3 cols for Tablet/Landscape, 2 for Phone
  const isLandscape = width > 600;
  const cardWidthClass = isLandscape ? 'w-[31%]' : 'w-[48%]';

  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [storedHouseholdId, setStoredHouseholdId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await Auth.getToken();
    const hhId = await Auth.getHouseholdId();
    
    if (token && hhId) {
      setIsAuthenticated(true);
      setStoredHouseholdId(hhId);
    }
    setIsCheckingAuth(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { token, data } = response.data;
      const householdId = data.primaryHouseholdId;

      await Auth.saveSession(token, householdId);
      setStoredHouseholdId(householdId);
      setIsAuthenticated(true);
      
      queryClient.invalidateQueries({ queryKey: ['household'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed';
      Alert.alert('Login Error', msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- FETCH DATA ---
  const { data: household, isLoading: isHouseholdLoading } = useQuery({
    queryKey: ['household', storedHouseholdId],
    queryFn: async () => {
      if (!storedHouseholdId) return null;
      const response = await api.get(`/api/v1/household/${storedHouseholdId}`);
      return response.data.data as HouseholdData;
    },
    enabled: isAuthenticated && !!storedHouseholdId,
  });

  const { data: tasks, isLoading: isTasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!storedHouseholdId) return [];
      const response = await api.get('/api/v1/tasks');
      return response.data.data.tasks as Task[];
    },
    enabled: isAuthenticated && !!storedHouseholdId,
  });

  const getMemberTasks = (memberId: string) => {
    return tasks?.filter(t => t.assignedTo.includes(memberId) && t.status !== 'Approved') || [];
  };

  // --- NAVIGATION ---
  const handleProfileSelect = (profile: MemberProfile) => {
    // FIX: Everyone goes to the Dashboard now (Parents included)
    // The "Admin" check happens INSIDE the dashboard, not here.
    router.push({ pathname: '/kiosk', params: { memberId: profile._id } });
  };

  if (isCheckingAuth || (isAuthenticated && (isHouseholdLoading || isTasksLoading))) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 font-medium">Syncing Family Data...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center p-6">
        <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full self-center">
          <Text className="text-3xl font-bold text-slate-900 text-center mb-2">Momentum</Text>
          <Text className="text-slate-500 text-center mb-8">Family Command Center</Text>

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Parent Email</Text>
          <TextInput 
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-slate-900"
            placeholder="admin@family.com"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Password</Text>
          <TextInput 
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-slate-900"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable 
            className="bg-indigo-600 py-4 rounded-xl items-center active:bg-indigo-700 shadow-md shadow-indigo-200"
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
               <ActivityIndicator color="white" />
            ) : (
               <Text className="text-white font-bold text-lg">Activate Kiosk</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        contentContainerClassName="p-6 pb-20"
        refreshControl={
          <RefreshControl refreshing={isTasksLoading} onRefresh={refetchTasks} />
        }
      >
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Text className="text-slate-500 font-medium uppercase tracking-widest text-xs mb-1">
              Current Household
            </Text>
            <Text className="text-3xl font-black text-slate-900">
              {household?.householdName}
            </Text>
          </View>
          <Pressable 
             onPress={async () => {
               await Auth.clearSession();
               setIsAuthenticated(false);
             }}
             className="bg-white px-4 py-2 rounded-full border border-slate-200 active:bg-slate-100"
           >
             <Text className="text-slate-600 font-bold text-xs">Lock Kiosk</Text>
           </Pressable>
        </View>

        <Text className="text-lg font-bold text-slate-800 mb-4">Family Scoreboard</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {household?.memberProfiles.map((profile) => {
            const memberTasks = getMemberTasks(profile._id);
            const pendingCount = memberTasks.length;

            return (
              <Pressable 
                key={profile._id || profile.familyMemberId}
                className={`${cardWidthClass} bg-white rounded-3xl p-4 mb-4 border border-slate-100 shadow-sm active:scale-95 transition-transform`}
                onPress={() => handleProfileSelect(profile)}
              >
                <View className="flex-row items-center mb-4">
                  <View 
                    className="w-12 h-12 rounded-full justify-center items-center shadow-sm mr-3"
                    style={{ backgroundColor: profile.profileColor }}
                  >
                    <Text className="text-xl text-white font-bold">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>
                      {profile.displayName}
                    </Text>
                    <Text className="text-xs font-medium text-slate-400">
                      {profile.pointsTotal} pts
                    </Text>
                  </View>
                </View>

                <View className="bg-slate-50 rounded-xl p-3">
                  <Text className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Today's Mission
                  </Text>
                  {pendingCount === 0 ? (
                    <Text className="text-slate-400 text-xs italic">All caught up!</Text>
                  ) : (
                    <View>
                      <Text className="text-indigo-600 font-black text-2xl">
                        {pendingCount}
                      </Text>
                      <Text className="text-slate-600 text-xs font-medium">
                        Tasks Remaining
                      </Text>
                    </View>
                  )}
                </View>

                {/* Hide the 'Admin' text since everyone plays now */}
                <View className="mt-4 flex-row items-center justify-end">
                  <Text className="text-xs text-slate-300 font-medium mr-1">
                    {profile.role === 'Parent' ? 'Head of House' : 'Member'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}