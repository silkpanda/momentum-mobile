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
          title: 'Kitchen',
          subtitle: 'Meals & Recipes',
          icon: 'restaurant',
          color: '#10B981', // emerald-500
          route: '/admin/kitchen',
        },
        {
          title: 'Manage Tasks',
          subtitle: 'Assign chores & values',
          icon: 'checkbox',
          color: '#4F46E5',
          route: '/admin/tasks',
        },
        {
          title: 'Reward Store',
          subtitle: 'Stock items & prizes',
          icon: 'gift',
          color: '#EA580C',
          route: '/admin/store',
        },
        {
          title: 'Quest Board',
          subtitle: 'Shared tasks & challenges',
          icon: 'game-controller',
          color: '#8B5CF6', // violet-500
          route: '/admin/quests',
        },
        {
          title: 'Routines',
          subtitle: 'Daily flows & schedules',
          icon: 'list',
          color: '#F59E0B', // amber-500
          route: '/admin/routines',
        },
        {
          title: 'Family Members',
          subtitle: 'Edit profiles & roles',
          icon: 'people',
          color: '#0EA5E9',
          route: '/admin/members',
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
          color: '#16A34A',
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
          icon: 'settings',
          color: '#64748B',
          route: '/settings',
        },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
                      style={{ backgroundColor: `${item.color}15` }}
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