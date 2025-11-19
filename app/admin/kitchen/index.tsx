import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kitchen</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Manage</Text>

                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => router.push(item.route as any)}
                        >
                            <LinearGradient
                                colors={item.color as any}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={item.icon as any} size={32} color="#fff" />
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Today's Menu</Text>
                <BlurView intensity={20} tint="dark" style={styles.todayCard}>
                    <View style={styles.mealRow}>
                        <View style={styles.mealTime}>
                            <Ionicons name="sunny-outline" size={20} color="#FDBA74" />
                            <Text style={styles.mealTimeText}>Lunch</Text>
                        </View>
                        <Text style={styles.mealName}>Turkey Sandwiches</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.mealRow}>
                        <View style={styles.mealTime}>
                            <Ionicons name="moon-outline" size={20} color="#C4B5FD" />
                            <Text style={styles.mealTimeText}>Dinner</Text>
                        </View>
                        <Text style={styles.mealName}>Spaghetti Bolognese</Text>
                    </View>
                </BlurView>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 16,
        marginTop: 8,
    },
    grid: {
        gap: 16,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mealRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    mealTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: 100,
    },
    mealTimeText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '500',
    },
    mealName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
