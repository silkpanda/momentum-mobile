import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ScrollView, RefreshControl, Dimensions, Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { bentoPalette, spacing, borderRadius, shadows, typography } from '../../theme/bentoTokens';
import { 
  FamilyRosterGrid 
} from './components/FamilyRosterGrid';
import { EnvironmentCol } from './components/EnvironmentCol';
import { FamilyTimelineCard } from './components/FamilyTimelineCard';
import { 
  Settings, Bell, Search, LayoutGrid, Calendar as CalendarIcon, 
  Target, ShoppingBag, Utensils, Zap, Plus, ChevronRight, UserCircle
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function FamilyBentoScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { members, tasks, quests, events, isRefreshing, refresh } = useData();
  
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [members]);

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const memberTasks = tasks.filter(t => selectedMemberId && t.assignedTo.includes(selectedMemberId));
  const activeQuests = quests.filter(q => q.isActive);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.householdName}>{user?.lastName} Family</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('NotificationCenter')}>
              <Bell size={24} color={bentoPalette.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Parent')}>
              <Settings size={23} color={bentoPalette.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Member Roster */}
        <FamilyRosterGrid 
          members={members} 
          selectedMemberId={selectedMemberId} 
          onMemberSelect={setSelectedMemberId} 
        />

        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.bentoPager}
          contentContainerStyle={styles.pagerContent}
        >
          {/* Main Dashboard Column */}
          <View style={styles.columnPage}>
            <EnvironmentCol title="Responsibilities" count={memberTasks.length}>
              {memberTasks.map(task => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskCard}
                  onPress={() => navigation.navigate('MemberDetail', { memberId: selectedMemberId! })}
                >
                  <View style={[styles.taskIndicator, { backgroundColor: task.status === 'Completed' ? bentoPalette.success : bentoPalette.brandLight }]} />
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.taskPoints}>{task.pointsValue} Points</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {memberTasks.length === 0 && (
                <View style={styles.emptyColCard}>
                  <Text style={styles.emptyColText}>No assigned tasks today</Text>
                </View>
              )}
            </EnvironmentCol>
          </View>

          {/* Social / Quest Column */}
          <View style={styles.columnPage}>
            <EnvironmentCol title="Quests & Rewards" count={activeQuests.length}>
              <View style={styles.questBoard}>
                {activeQuests.map(quest => (
                  <TouchableOpacity key={quest.id} style={styles.questCard}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <View style={styles.questPointsBadge}>
                      <Text style={styles.questPointsText}>+{quest.pointsValue}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.storeShortcut}
                onPress={() => navigation.navigate('MemberStore', { memberId: selectedMemberId! })}
              >
                <ShoppingBag size={24} color={bentoPalette.brandPrimary} />
                <View style={styles.storeShortcutText}>
                  <Text style={styles.storeTitle}>Family Store</Text>
                  <Text style={styles.storeSubtitle}>Redeem points for rewards</Text>
                </View>
                <ChevronRight size={20} color={bentoPalette.textTertiary} />
              </TouchableOpacity>
            </EnvironmentCol>
          </View>

          {/* Timeline / Calendar Column */}
          <View style={styles.columnPage}>
            <EnvironmentCol title="The Schedule" count={events.length}>
              <FamilyTimelineCard events={events} />
            </EnvironmentCol>
          </View>
        </ScrollView>

        {/* Floating Action Button (Optional for Parent) */}
        {user?.role === 'Parent' && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('Parent')}
          >
            <Plus size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Profile/Points Indicator (Locked to Bottom) */}
      <View style={styles.dock}>
        {selectedMember && (
          <View style={styles.dockContent}>
            <View style={styles.dockMemberInfo}>
              <View style={[styles.dockAvatar, { backgroundColor: selectedMember.profileColor }]}>
                <Text style={styles.dockAvatarText}>{selectedMember.firstName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.dockMemberName}>{selectedMember.firstName}'s HUD</Text>
                <Text style={styles.dockStreak}><Zap size={14} color="#EF4444" /> {selectedMember.currentStreak || 0} Day Streak</Text>
              </View>
            </View>
            <View style={styles.dockPoints}>
              <Text style={styles.dockPointsValue}>{selectedMember.pointsTotal}</Text>
              <Text style={styles.dockPointsLabel}>Points</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bentoPalette.canvas,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  greeting: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: bentoPalette.textSecondary,
  },
  householdName: {
    fontFamily: typography.heroGreeting.fontFamily,
    fontSize: 24,
    color: bentoPalette.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: bentoPalette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },
  bentoPager: {
    flex: 1,
  },
  pagerContent: {
    paddingRight: 0,
  },
  columnPage: {
    width: width,
    height: '100%',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: bentoPalette.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  taskIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: bentoPalette.textPrimary,
  },
  taskPoints: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: bentoPalette.brandPrimary,
  },
  emptyColCard: {
    padding: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  emptyColText: {
    color: bentoPalette.textTertiary,
    fontSize: 14,
  },
  questBoard: {
    gap: spacing.md,
  },
  questCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: bentoPalette.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fef3c7',
    ...shadows.soft,
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: bentoPalette.textPrimary,
  },
  questPointsBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questPointsText: {
    color: '#d97706',
    fontWeight: 'bold',
    fontSize: 14,
  },
  storeShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  storeShortcutText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  storeSubtitle: {
    fontSize: 12,
    color: '#3b82f6',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 120, // Above dock
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: bentoPalette.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.float,
    zIndex: 10,
  },
  dock: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: spacing.xxxl, // For safe area
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dockContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dockMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dockAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dockMemberName: {
    fontSize: 16,
    fontWeight: '700',
    color: bentoPalette.textPrimary,
  },
  dockStreak: {
    fontSize: 12,
    color: bentoPalette.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dockPoints: {
    alignItems: 'flex-end',
  },
  dockPointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: bentoPalette.brandPrimary,
  },
  dockPointsLabel: {
    fontSize: 10,
    color: bentoPalette.textTertiary,
    textTransform: 'uppercase',
  },
});
