import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function KitchenDashboard() {
    const router = useRouter();

    const menuItems = [
        {
            title: 'Weekly Planner',
            subtitle: 'Schedule meals for the week',
            icon: 'calendar',
            color: ['#8B5CF6', '#6D28D9'],
            route: '/admin/kitchen/planner',
        },
        {
            title: 'Recipe Book',
            subtitle: 'Manage your family recipes',
            icon: 'book',
            color: ['#10B981', '#059669'],
            route: '/admin/kitchen/recipes',
        },
        {
            title: 'Restaurant Book',
            subtitle: 'Favorite takeout & delivery',
            icon: 'restaurant',
            color: ['#F59E0B', '#D97706'],
            route: '/admin/kitchen/restaurants',
        },
    ];

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView className="flex-1">
                <View className="p-6 border-b border-white/10">
                    <View className="flex-row items-center">
                        <Pressable onPress={() => router.back()} className="bg-white/10 p-3 rounded-full mr-4 backdrop-blur-sm">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </Pressable>
                        <Text className="text-2xl font-bold text-white">Kitchen</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text className="text-lg font-bold text-indigo-200 mb-4 uppercase tracking-wider">Manage</Text>

                    <View style={styles.grid}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.card}
                                onPress={() => router.push(item.route as any)}
                            >
                                <BlurView intensity={20} tint="light" className="flex-1">
                                    <LinearGradient
                                        colors={item.color as any}
                                        style={styles.cardGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="opacity-90"
                                    >
                                        <Ionicons name={item.icon as any} size={32} color="#fff" />
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle}>{item.title}</Text>
                                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
                                    </LinearGradient>
                                </BlurView>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-lg font-bold text-indigo-200 mb-4 mt-8 uppercase tracking-wider">Today's Menu</Text>
                    <BlurView intensity={20} tint="light" style={styles.todayCard} className="border border-white/10">
                        <View style={styles.mealRow}>
                            <View style={styles.mealTime}>
                                <Ionicons name="sunny-outline" size={20} color="#FDBA74" />
                                <Text className="text-white/70 text-base font-medium">Lunch</Text>
                            </View>
                            <Text className="text-white text-base font-bold flex-1 text-right">Turkey Sandwiches</Text>
                        </View>
                        <View className="h-[1px] bg-white/10 my-3" />
                        <View style={styles.mealRow}>
                            <View style={styles.mealTime}>
                                <Ionicons name="moon-outline" size={20} color="#C4B5FD" />
                                <Text className="text-white/70 text-base font-medium">Dinner</Text>
                            </View>
                            <Text className="text-white text-base font-bold flex-1 text-right">Spaghetti Bolognese</Text>
                        </View>
                    </BlurView>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
    },
    grid: {
        gap: 16,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    todayCard: {
        borderRadius: 20,
        padding: 24,
        overflow: 'hidden',
    },
    mealRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    mealTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: 100,
    },
});
