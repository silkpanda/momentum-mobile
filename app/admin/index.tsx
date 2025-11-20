import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
          color: '#34D399', // emerald-400
          route: '/admin/kitchen',
        },
        {
          title: 'Manage Tasks',
          subtitle: 'Assign chores & values',
          icon: 'checkbox',
          color: '#818CF8', // indigo-400
          route: '/admin/tasks',
        },
        {
          title: 'Reward Store',
          subtitle: 'Stock items & prizes',
          icon: 'gift',
          color: '#FB923C', // orange-400
          route: '/admin/store',
        },
        {
          title: 'Quest Board',
          subtitle: 'Shared tasks & challenges',
          icon: 'game-controller',
          color: '#A78BFA', // violet-400
          route: '/admin/quests',
        },
        {
          title: 'Routines',
          subtitle: 'Daily flows & schedules',
          icon: 'list',
          color: '#FBBF24', // amber-400
          route: '/admin/routines',
        },
        {
          title: 'Family Members',
          subtitle: 'Edit profiles & roles',
          icon: 'people',
          color: '#38BDF8', // sky-400
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
          color: '#4ADE80', // green-400
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
          color: '#94A3B8', // slate-400
          route: '/settings',
        },
      ]
    }
  ];

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#1e1b4b', '#312e81']}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <ScrollView contentContainerClassName="p-6">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm active:bg-white/20">
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              <View>
                <Text className="text-3xl font-bold text-white">Admin Dashboard</Text>
                <Text className="text-indigo-200 text-sm font-medium">Parent Controls</Text>
              </View>
            </View>

            {/* Menu Sections */}
            <View className="gap-8">
              {adminMenu.map((section) => (
                <View key={section.section}>
                  <Text className="text-xs font-bold text-indigo-300 uppercase mb-4 tracking-widest ml-1">
                    {section.section}
                  </Text>
                  <View className="gap-3">
                    {section.items.map((item) => (
                      <BlurView
                        key={item.title}
                        intensity={20}
                        tint="light"
                        className="overflow-hidden rounded-2xl"
                      >
                        <Pressable
                          onPress={() => router.push(item.route as any)}
                          className="bg-white/5 p-4 flex-row items-center active:bg-white/10 border border-white/5"
                        >
                          {/* Icon Box */}
                          <View
                            className="w-12 h-12 rounded-xl items-center justify-center mr-4 shadow-lg"
                            style={{ backgroundColor: `${item.color}20`, borderColor: `${item.color}40`, borderWidth: 1 }}
                          >
                            <Ionicons name={item.icon as any} size={24} color={item.color} />
                          </View>

                          {/* Text */}
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-white mb-0.5">{item.title}</Text>
                            <Text className="text-xs text-indigo-200 font-medium">{item.subtitle}</Text>
                          </View>

                          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </Pressable>
                      </BlurView>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}