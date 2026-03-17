import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { bentoPalette, spacing, borderRadius, shadows, typography } from '../../../theme/bentoTokens';
import { useData } from '../../../contexts/DataContext';
import { Plus, Search, Filter, MoreVertical, Calendar } from 'lucide-react-native';

export default function TaskManagement() {
  const { tasks, members } = useData();
  const [activeTab, setActiveTab] = useState('Assigned');

  const filteredTasks = tasks.filter(t => t.status === activeTab || (activeTab === 'Assigned' && t.status === 'PendingApproval'));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>All Tasks</Text>
          <Text style={styles.subtitle}>{tasks.length} total tasks</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Assigned', 'Completed', 'Approved'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskCore}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <View style={styles.taskMeta}>
                <Text style={styles.metaLabel}>Assigned to:</Text>
                {item.assignedTo.map(id => (
                  <View key={id} style={styles.memberTag}>
                    <Text style={styles.tagText}>{id.slice(0, 3)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.taskRight}>
              <Text style={styles.points}>{item.pointsValue} pts</Text>
              <TouchableOpacity><MoreVertical size={20} color={bentoPalette.textTertiary} /></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks found in this category.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bentoPalette.canvas },
  header: { padding: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: bentoPalette.textPrimary },
  subtitle: { fontSize: 14, color: bentoPalette.textSecondary },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: bentoPalette.brandPrimary, justifyContent: 'center', alignItems: 'center', ...shadows.float },
  tabContainer: { flexDirection: 'row', paddingHorizontal: spacing.xl, marginBottom: spacing.md, gap: spacing.md },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: bentoPalette.surface },
  activeTab: { backgroundColor: bentoPalette.brandPrimary },
  tabText: { fontWeight: '600', color: bentoPalette.textSecondary },
  activeTabText: { color: '#fff' },
  list: { padding: spacing.xl, paddingTop: 0 },
  taskCard: { 
    flexDirection: 'row', backgroundColor: '#fff', padding: spacing.md, 
    borderRadius: borderRadius.lg, marginBottom: spacing.sm, ...shadows.soft 
  },
  taskCore: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: bentoPalette.textPrimary, marginBottom: 4 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 12, color: bentoPalette.textSecondary },
  memberTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 10, color: '#475569', fontWeight: 'bold' },
  taskRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  points: { fontSize: 14, fontWeight: 'bold', color: bentoPalette.brandPrimary },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: bentoPalette.textTertiary }
});
