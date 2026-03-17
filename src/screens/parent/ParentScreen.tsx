import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { bentoPalette, spacing } from '../../theme/bentoTokens';
import { 
  LayoutDashboard, ClipboardList, Zap, ShoppingBag, 
  Utensils, Users, Settings, Bell, Calendar 
} from 'lucide-react-native';

// Stub screens for tabs (will implement full ones in Phase 3)
import ParentDashboard from './tabs/ParentDashboard';
import TaskManagement from './tabs/TaskManagement';
import QuestManagement from './tabs/QuestManagement';
import MemberManagement from './tabs/MemberManagement';
import ParentSettings from './tabs/ParentSettings';

const Tab = createBottomTabNavigator();

export default function ParentScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.05)',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: bentoPalette.brandPrimary,
        tabBarInactiveTintColor: bentoPalette.textTertiary,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <LayoutDashboard size={size} color={color} />;
          if (route.name === 'Tasks') return <ClipboardList size={size} color={color} />;
          if (route.name === 'Quests') return <Zap size={size} color={color} />;
          if (route.name === 'Members') return <Users size={size} color={color} />;
          if (route.name === 'Settings') return <Settings size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboard} />
      <Tab.Screen name="Tasks" component={TaskManagement} />
      <Tab.Screen name="Quests" component={QuestManagement} />
      <Tab.Screen name="Members" component={MemberManagement} />
      <Tab.Screen name="Settings" component={ParentSettings} />
    </Tab.Navigator>
  );
}
