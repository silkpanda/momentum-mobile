// =========================================================
// momentum-mobile/src/navigation/AppNavigator.tsx
// Main App Navigator - Switches between Auth and Main Stack
// =========================================================
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import FamilyScreen from '../screens/family/FamilyScreen';
import ParentScreen from '../screens/parent/ParentScreen';
import MemberDetailScreen from '../screens/family/MemberDetailScreen';
import MemberStoreScreen from '../screens/family/MemberStoreScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="Family" component={FamilyScreen} />
                    <Stack.Screen name="Parent" component={ParentScreen} />
                    <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
                    <Stack.Screen name="MemberStore" component={MemberStoreScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
});
