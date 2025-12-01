// =========================================================
// momentum-mobile/src/screens/parent/ParentScreen.tsx
// Parent View - Management Interface (Top Tabs)
// =========================================================
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import TasksTab from './TasksTab';
import StoreTab from './StoreTab';
import QuestsTab from './QuestsTab';
import MealsTab from './MealsTab';
import DashboardTab from './DashboardTab';
import SettingsTab from './SettingsTab';
import MembersTab from './MembersTab';
import RoutinesTab from './RoutinesTab';
import ApprovalsTab from './ApprovalsTab';
import { ParentTabParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator<ParentTabParamList>();

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

export default function ParentScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { currentTheme: theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgSurface }}>
            {/* Header */}
            <View style={[
                styles.header,
                {
                    borderBottomColor: theme.colors.borderSubtle,
                    paddingTop: insets.top + 16,
                    paddingHorizontal: 16,
                    paddingBottom: 16
                }
            ]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                    <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Back to Family View</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('BentoTest')}
                        style={{
                            backgroundColor: theme.colors.actionPrimary,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Bento UI</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Parent View</Text>
                </View>
            </View>

            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: { backgroundColor: theme.colors.bgSurface },
                    tabBarActiveTintColor: theme.colors.actionPrimary,
                    tabBarInactiveTintColor: theme.colors.textSecondary,
                    tabBarIndicatorStyle: { backgroundColor: theme.colors.actionPrimary },
                    tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
                    tabBarScrollEnabled: true,
                    tabBarItemStyle: { width: 100 },
                }}
            >
                {/* Preload most common tabs to eliminate loading screens */}
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardTab}
                    options={{ lazy: false }} // Always mount - most visited
                />
                <Tab.Screen
                    name="Members"
                    component={MembersTab}
                    options={{ lazy: false }} // Always mount - frequently visited
                />

                {/* Lazy load less common tabs to save memory */}
                <Tab.Screen name="Tasks" component={TasksTab} />
                <Tab.Screen name="Approvals" component={ApprovalsTab} />
                <Tab.Screen name="Routines" component={RoutinesTab} />
                <Tab.Screen name="Store" component={StoreTab} />
                <Tab.Screen name="Quests" component={QuestsTab} />
                <Tab.Screen name="Meals" component={MealsTab} />
                <Tab.Screen name="Settings" component={SettingsTab} />
            </Tab.Navigator>
        </View >
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
