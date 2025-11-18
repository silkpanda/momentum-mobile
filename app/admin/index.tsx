import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const router = useRouter();

  // Mirrors the Web Sidebar Navigation
  const adminMenu = [
    {
      section: 'Management',
      items: [
        {
          title: 'Manage Tasks',
          subtitle: 'Assign chores & values',
          icon: 'checkbox', // Matches 'Award' concept
          color: '#4F46E5', // indigo-600
          route: '/admin/tasks/create',
        },
        {
          title: 'Reward Store',
          subtitle: 'Stock items & prizes',
          icon: 'gift', // Matches 'Award'
          color: '#EA580C', // orange-600
          route: '/admin/store/create', 
        },
        {
          title: 'Family Members',
          subtitle: 'Edit profiles & roles',
          icon: 'people', // Matches 'Users'
          color: '#0EA5E9', // sky-500
          route: '/admin/members', // Future Phase
        },
      ]
    },
    {
      section: 'Inbox',
      items: [
        {
          title: 'Approvals',
          subtitle: 'Verify completed work',
          icon: 'checkmark-done-circle',
          color: '#16A34A', // green-600
          route: '/admin/approvals',
          badge: 0, 
        },
      ]
    },
    {
      section: 'System',
      items: [
        {
          title: 'Settings',
          subtitle: 'App configuration',
          icon: 'settings', // Matches 'Settings'
          color: '#64748B', // slate-500
          route: '/settings',
        },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50"> 
      {/* ^ Matched --color-bg-canvas (#F9FAFB) */}
      
      <ScrollView contentContainerClassName="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="bg-white p-2 rounded-full border border-gray-200 mr-4">
            <Ionicons name="arrow-back" size={24} color="#4B5563" />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Admin Dashboard</Text>
            <Text className="text-gray-500 text-sm">Parent Controls</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="gap-6">
          {adminMenu.map((section) => (
            <View key={section.section}>
              <Text className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                {section.section}
              </Text>
              <View className="gap-3">
                {section.items.map((item) => (
                  <Pressable
                    key={item.title}
                    onPress={() => router.push(item.route as any)}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row items-center active:bg-gray-50"
                  >
                    {/* Icon Box */}
                    <View 
                      className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                      style={{ backgroundColor: `${item.color}15` }} // 15% opacity bg
                    >
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    
                    {/* Text */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                      <Text className="text-xs text-gray-500">{item.subtitle}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#E5E7EB" />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}