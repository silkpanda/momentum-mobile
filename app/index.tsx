import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, TextInput, Alert } from 'react-native';
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

export default function LandingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [storedHouseholdId, setStoredHouseholdId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- 1. CHECK AUTH ON LOAD ---
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

  // --- 2. HANDLE LOGIN ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoggingIn(true);
    try {
      // Call BFF Login
      const response = await api.post('/api/v1/auth/login', { email, password });
      
      const { token, data } = response.data;
      const householdId = data.primaryHouseholdId;

      // Save Session
      await Auth.saveSession(token, householdId);

      // Update State
      setStoredHouseholdId(householdId);
      setIsAuthenticated(true);
      
      // Prefetch the household data
      queryClient.invalidateQueries({ queryKey: ['household'] });

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed';
      Alert.alert('Login Error', msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- 3. FETCH HOUSEHOLD DATA (Only if authenticated) ---
  const { data: household, isLoading: isHouseholdLoading } = useQuery({
    queryKey: ['household', storedHouseholdId],
    queryFn: async () => {
      if (!storedHouseholdId) return null;
      const response = await api.get(`/api/v1/household/${storedHouseholdId}`);
      return response.data.data as HouseholdData;
    },
    enabled: isAuthenticated && !!storedHouseholdId,
  });

  const handleProfileSelect = (profile: MemberProfile) => {
    if (profile.role === 'Child') {
       router.push('/kiosk');
    } else {
       Alert.alert('Parent Mode', 'Parent Dashboard coming in Phase 3!');
    }
  };

  // --- RENDER: LOADING ---
  if (isCheckingAuth || (isAuthenticated && isHouseholdLoading)) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">Loading Momentum...</Text>
      </SafeAreaView>
    );
  }

  // --- RENDER: LOGIN FORM (If not authenticated) ---
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center p-6">
        <View className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-2">Momentum</Text>
          <Text className="text-gray-500 text-center mb-8">Family Management</Text>

          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Email</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-gray-900"
            placeholder="parent@example.com"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Password</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-gray-900"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable 
            className="bg-indigo-600 py-4 rounded-xl items-center active:bg-indigo-700"
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
               <ActivityIndicator color="white" />
            ) : (
               <Text className="text-white font-bold text-lg">Log In</Text>
            )}
          </Pressable>
          
          <Text className="text-center text-gray-400 text-xs mt-6">
            Use the account you created in Postman/Curl
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER: PROFILE SELECTION (If authenticated) ---
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="p-6">
        <View className="flex-row justify-between items-center mt-6 mb-10">
           <View /> 
           <Pressable 
             onPress={async () => {
               await Auth.clearSession();
               setIsAuthenticated(false);
             }}
           >
             <Text className="text-indigo-600 font-medium">Log Out</Text>
           </Pressable>
        </View>

        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
          Who is watching?
        </Text>
        <Text className="text-gray-500 text-center mb-10">
          {household?.householdName}
        </Text>

        <View className="flex-row flex-wrap justify-center gap-6">
          {household?.memberProfiles.map((profile) => (
            <Pressable 
              key={profile._id || profile.familyMemberId}
              className="items-center mb-6"
              onPress={() => handleProfileSelect(profile)}
            >
              <View 
                className="w-24 h-24 rounded-full justify-center items-center shadow-sm mb-3"
                style={{ backgroundColor: profile.profileColor }}
              >
                <Text className="text-3xl text-white font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-lg font-medium text-gray-800">
                {profile.displayName}
              </Text>
              <View className={`mt-1 px-2 py-0.5 rounded-full ${profile.role === 'Parent' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                 <Text className={`text-xs ${profile.role === 'Parent' ? 'text-indigo-700' : 'text-green-700'}`}>
                   {profile.role}
                 </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}