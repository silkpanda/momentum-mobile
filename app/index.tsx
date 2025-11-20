import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, TextInput, Alert, RefreshControl, useWindowDimensions, Image, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../src/lib/api';
import { Auth } from '../src/lib/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

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

export default function KioskHome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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

  const handleProfileSelect = (profile: MemberProfile) => {
    router.push({ pathname: '/kiosk', params: { memberId: profile._id } });
  };

  // --- RENDER HELPERS ---

  const renderPodium = () => {
    const sortedMembers = [...(household?.memberProfiles || [])].sort((a, b) => b.pointsTotal - a.pointsTotal);
    const top3 = sortedMembers.slice(0, 3);

    if (top3.length === 0) return null;

    // Reorder for podium: 2nd, 1st, 3rd
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
      <View className="items-center justify-end h-64 mb-8">
        <View className="flex-row items-end justify-center gap-4">
          {podiumOrder.map((member, index) => {
            const isFirst = member === top3[0];
            const isSecond = member === top3[1];
            const isThird = member === top3[2];

            const height = isFirst ? 'h-48' : isSecond ? 'h-36' : 'h-24';
            const color = isFirst ? 'bg-yellow-400' : isSecond ? 'bg-slate-300' : 'bg-amber-700';
            const rank = isFirst ? 1 : isSecond ? 2 : 3;

            return (
              <Animated.View
                entering={FadeInDown.delay(index * 200)}
                key={member._id}
                className="items-center"
              >
                <View className="items-center mb-2">
                  <View
                    className={`rounded-full border-4 ${isFirst ? 'border-yellow-400' : 'border-white/20'} shadow-lg`}
                    style={{
                      width: isFirst ? 80 : 60,
                      height: isFirst ? 80 : 60,
                      backgroundColor: member.profileColor
                    }}
                  >
                    <View className="flex-1 items-center justify-center">
                      <Text className="text-white font-bold text-2xl">
                        {member.displayName.charAt(0)}
                      </Text>
                    </View>
                    {isFirst && (
                      <View className="absolute -top-6 -right-2 bg-yellow-400 rounded-full p-2 shadow-sm">
                        <Ionicons name="trophy" size={20} color="#FFF" />
                      </View>
                    )}
                  </View>
                  <Text className="text-white font-bold mt-2 text-sm shadow-black/50 shadow-sm">
                    {member.displayName}
                  </Text>
                  <Text className="text-white/80 text-xs font-medium">
                    {member.pointsTotal} XP
                  </Text>
                </View>

                {/* Podium Block */}
                <View className={`${height} w-20 ${color} rounded-t-lg items-center justify-start pt-4 opacity-90`}>
                  <Text className="text-white/50 font-black text-4xl">{rank}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMemberCard = (profile: MemberProfile, index: number) => {
    const pendingCount = getMemberTasks(profile._id).length;
    const level = Math.floor(profile.pointsTotal / 100) + 1;

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 100)}
        key={profile._id}
        className="w-full md:w-[48%] mb-4"
      >
        <Pressable
          onPress={() => handleProfileSelect(profile)}
          className="overflow-hidden rounded-3xl active:scale-95 transition-transform"
        >
          <BlurView intensity={80} tint="light" className="p-5 bg-white/40">
            <View className="flex-row items-center gap-4">
              <View
                className="w-16 h-16 rounded-2xl justify-center items-center shadow-sm"
                style={{ backgroundColor: profile.profileColor }}
              >
                <Text className="text-3xl text-white font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-slate-900 text-xl">{profile.displayName}</Text>
                  <View className="bg-white/50 px-2 py-0.5 rounded-md">
                    <Text className="text-xs font-bold text-slate-600">LVL {level}</Text>
                  </View>
                </View>
                <Text className="text-slate-600 text-sm font-medium">{profile.role}</Text>
              </View>

              <View className="items-end">
                <Ionicons name="chevron-forward-circle" size={32} color="rgba(255,255,255,0.8)" />
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 bg-white/50 rounded-xl p-3 flex-row items-center justify-between">
                <Text className="text-slate-600 font-bold text-xs uppercase">Missions</Text>
                <View className={`px-2 py-0.5 rounded-full ${pendingCount > 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                  <Text className="text-white font-bold text-xs">{pendingCount}</Text>
                </View>
              </View>
              <View className="flex-1 bg-white/50 rounded-xl p-3 flex-row items-center justify-between">
                <Text className="text-slate-600 font-bold text-xs uppercase">XP</Text>
                <Text className="text-indigo-600 font-black text-xs">{profile.pointsTotal}</Text>
              </View>
            </View>
          </BlurView>
        </Pressable>
      </Animated.View>
    );
  };

  // --- LAYOUTS ---

  const renderTabletLayout = () => (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#4338ca', '#3b82f6', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 flex-row"
      >
        <SafeAreaView className="flex-1 flex-row">
          {/* LEFT SIDEBAR (Leaderboard) */}
          <View className="w-5/12 p-8 border-r border-white/10 bg-black/10">
            <View className="flex-row items-center mb-8">
              <View className="bg-white/20 p-2 rounded-xl mr-3">
                <Ionicons name="trophy" size={24} color="white" />
              </View>
              <Text className="text-white font-bold text-xl tracking-wide">Leaderboard</Text>
            </View>

            <View className="flex-1 justify-center">
              {renderPodium()}

              <View className="bg-white/10 rounded-2xl p-6 backdrop-blur-md">
                <Text className="text-white/80 text-center italic font-medium">
                  "Consistency is the key to success!" 🌟
                </Text>
              </View>
            </View>
          </View>

          {/* RIGHT CONTENT (Members) */}
          <View className="flex-1 p-10">
            <View className="flex-row justify-between items-start mb-10">
              <View>
                <Text className="text-indigo-100 font-bold uppercase tracking-widest mb-2">Family Hub</Text>
                <Text className="text-5xl font-black text-white shadow-sm">
                  {household?.householdName || 'Welcome'}
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => router.push('/admin')}
                  className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-full backdrop-blur-md flex-row items-center transition-colors"
                >
                  <Ionicons name="settings" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Admin</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await Auth.clearSession();
                    setIsAuthenticated(false);
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 px-4 py-3 rounded-full backdrop-blur-md"
                >
                  <Ionicons name="log-out" size={20} color="white" />
                </Pressable>
              </View>
            </View>

            <Text className="text-2xl font-bold text-white mb-6">Who is here?</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={isTasksLoading} onRefresh={refetchTasks} tintColor="white" />}
            >
              <View className="flex-row flex-wrap gap-4 justify-between pb-20">
                {household?.memberProfiles.map((p, i) => renderMemberCard(p, i))}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderPhoneLayout = () => (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#4f46e5', '#818cf8']}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <View className="px-6 py-4 flex-row justify-between items-center">
            <View>
              <Text className="text-indigo-200 font-bold text-xs uppercase tracking-wider">Family Hub</Text>
              <Text className="text-3xl font-black text-white">{household?.householdName}</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable onPress={() => router.push('/admin')} className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Ionicons name="settings-outline" size={20} color="white" />
              </Pressable>
              <Pressable
                onPress={async () => {
                  await Auth.clearSession();
                  setIsAuthenticated(false);
                }}
                className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
              >
                <Ionicons name="log-out-outline" size={20} color="white" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="flex-1 px-6"
            refreshControl={<RefreshControl refreshing={isTasksLoading} onRefresh={refetchTasks} tintColor="white" />}
          >
            {/* Mini Leaderboard for Phone */}
            <View className="mb-8 mt-4">
              <Text className="text-white font-bold text-lg mb-4">Weekly Top 3 🏆</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                {household?.memberProfiles
                  .sort((a, b) => b.pointsTotal - a.pointsTotal)
                  .slice(0, 3)
                  .map((member, index) => (
                    <View key={member._id} className="mr-4 items-center">
                      <View
                        className="w-16 h-16 rounded-full items-center justify-center border-2 border-white mb-2 shadow-sm"
                        style={{ backgroundColor: member.profileColor }}
                      >
                        <Text className="text-white font-bold text-xl">{member.displayName.charAt(0)}</Text>
                        <View className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 items-center justify-center shadow-sm">
                          <Text className="text-indigo-600 font-bold text-xs">{index + 1}</Text>
                        </View>
                      </View>
                      <Text className="text-white font-medium text-xs">{member.displayName}</Text>
                      <Text className="text-indigo-200 font-bold text-xs">{member.pointsTotal} XP</Text>
                    </View>
                  ))}
              </ScrollView>
            </View>

            <Text className="text-xl font-bold text-white mb-4">Select Profile</Text>
            <View className="pb-20">
              {household?.memberProfiles.map((p, i) => renderMemberCard(p, i))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  // --- LOADING & AUTH STATES ---
  if (isCheckingAuth || (isAuthenticated && (isHouseholdLoading || isTasksLoading))) {
    return (
      <View className="flex-1 justify-center items-center bg-indigo-900">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-indigo-200 font-medium">Syncing Family Data...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={['#312e81', '#4338ca', '#4f46e5']}
          className="flex-1 justify-center p-6"
        >
          <SafeAreaView className="w-full max-w-md self-center">
            <BlurView intensity={40} tint="dark" className="overflow-hidden rounded-3xl border border-white/10 p-8">
              <View className="items-center mb-10">
                <View className="w-20 h-20 bg-white/10 rounded-3xl items-center justify-center mb-6 border border-white/20 shadow-lg">
                  <Ionicons name="planet" size={40} color="#818cf8" />
                </View>
                <Text className="text-4xl font-black text-white text-center mb-2">Momentum</Text>
                <Text className="text-indigo-200 text-center text-lg">Family Command Center</Text>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-indigo-200 font-bold text-xs uppercase ml-1 mb-2">Parent Email</Text>
                  <TextInput
                    className="bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30"
                    placeholder="admin@family.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View>
                  <Text className="text-indigo-200 font-bold text-xs uppercase ml-1 mb-2">Password</Text>
                  <TextInput
                    className="bg-black/20 border border-white/10 rounded-2xl p-4 text-white mb-8"
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <Pressable
                  className="bg-white py-4 rounded-2xl items-center active:bg-indigo-50 shadow-lg shadow-indigo-900/50"
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color="#4F46E5" />
                  ) : (
                    <Text className="text-indigo-600 font-black text-lg uppercase tracking-wide">Activate Kiosk</Text>
                  )}
                </Pressable>
              </View>
            </BlurView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return isTablet ? renderTabletLayout() : renderPhoneLayout();
}