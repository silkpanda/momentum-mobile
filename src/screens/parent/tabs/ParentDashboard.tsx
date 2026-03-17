import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { bentoPalette, spacing, borderRadius, shadows, typography } from '../../../theme/bentoTokens';
import { useData } from '../../../contexts/DataContext';
import { TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react-native';

export default function ParentDashboard() {
  const { tasks, quests, members } = useData();

  const pendingApprovals = tasks.filter(t => t.status === 'Completed' || t.status === 'PendingApproval');
  const activeTasks = tasks.filter(t => t.status === 'Pending');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Control Deck</Text>
        <Text style={styles.subtitle}>Overview of family activity</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
            <Clock size={24} color={bentoPalette.alert} />
            <Text style={styles.statValue}>{pendingApprovals.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
            <CheckCircle2 size={24} color={bentoPalette.success} />
            <Text style={styles.statValue}>{tasks.filter(t => t.status === 'Approved').length}</Text>
            <Text style={styles.statLabel}>Done today</Text>
          </View>
        </View>

        {/* Section: Recent Activity - STUB */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>Activity feed coming soon...</Text>
          </View>
        </View>

        {/* Section: Pending Approvals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Needs Review</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>
          
          {pendingApprovals.map(task => (
            <View key={task.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{task.title}</Text>
                <Text style={styles.itemMeta}>Completed by {task.assignedTo[0]}</Text>
              </View>
              <TouchableOpacity style={styles.approveButton}>
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {pendingApprovals.length === 0 && (
            <View style={styles.emptyCard}>
              <TrendingUp size={32} color={bentoPalette.brandLight} />
              <Text style={styles.emptyText}>Nothing to approve right now!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bentoPalette.canvas },
  header: { padding: spacing.xl },
  title: { fontSize: 28, fontWeight: 'bold', color: bentoPalette.textPrimary },
  subtitle: { fontSize: 16, color: bentoPalette.textSecondary },
  scroll: { padding: spacing.xl, paddingTop: 0 },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flex: 1, padding: spacing.xl, borderRadius: borderRadius.xl,
    alignItems: 'center', ...shadows.soft
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: bentoPalette.textPrimary, marginVertical: 4 },
  statLabel: { fontSize: 12, color: bentoPalette.textSecondary, textTransform: 'uppercase' },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: bentoPalette.textPrimary },
  seeAll: { color: bentoPalette.brandPrimary, fontWeight: '600' },
  itemCard: {
    flexDirection: 'row', backgroundColor: '#fff', padding: spacing.md,
    borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.sm, ...shadows.soft
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: bentoPalette.textPrimary },
  itemMeta: { fontSize: 13, color: bentoPalette.textSecondary },
  approveButton: { 
    backgroundColor: bentoPalette.success, paddingHorizontal: 16, 
    paddingVertical: 8, borderRadius: borderRadius.md 
  },
  approveText: { color: '#fff', fontWeight: 'bold' },
  activityCard: { padding: spacing.xl, backgroundColor: '#f8fafc', borderRadius: borderRadius.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0' },
  activityText: { color: bentoPalette.textTertiary, textAlign: 'center' },
  emptyCard: { 
    padding: spacing.xxl, alignItems: 'center', backgroundColor: '#fff', 
    borderRadius: borderRadius.xl, ...shadows.soft 
  },
  emptyText: { marginTop: spacing.md, color: bentoPalette.textTertiary, textAlign: 'center' }
});
