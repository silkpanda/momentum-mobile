import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { bentoPalette, spacing, borderRadius, shadows } from '../../../theme/bentoTokens';
import { useData } from '../../../contexts/DataContext';
import { Zap, Plus, Clock, Target } from 'lucide-react-native';

export default function QuestManagement() {
  const { quests } = useData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quest Board</Text>
          <Text style={styles.subtitle}>{quests.filter(q => q.isActive).length} active quests</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {quests.map(quest => (
          <View key={quest.id} style={styles.questCard}>
            <View style={styles.questHeader}>
              <View style={styles.iconBox}>
                <Target size={24} color={quest.isActive ? bentoPalette.alert : bentoPalette.textTertiary} />
              </View>
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questSubtitle}>{quest.description}</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{quest.pointsValue} pts</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.questFooter}>
              <View style={styles.stat}>
                <Clock size={14} color={bentoPalette.textTertiary} />
                <Text style={styles.statText}>{quest.isActive ? 'Active' : 'Expired'}</Text>
              </View>
              <View style={styles.stat}>
                <Zap size={14} color={bentoPalette.textTertiary} />
                <Text style={styles.statText}>{quest.claims.length} Claims</Text>
              </View>
            </View>
          </View>
        ))}

        {quests.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No quests created yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bentoPalette.canvas },
  header: { padding: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: bentoPalette.textPrimary },
  subtitle: { fontSize: 14, color: bentoPalette.textSecondary },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: bentoPalette.brandPrimary, justifyContent: 'center', alignItems: 'center', ...shadows.float },
  scroll: { padding: spacing.xl, paddingTop: 0 },
  questCard: { backgroundColor: '#fff', borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  questHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center' },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 16, fontWeight: 'bold', color: bentoPalette.textPrimary },
  questSubtitle: { fontSize: 12, color: bentoPalette.textSecondary },
  pointsBadge: { backgroundColor: bentoPalette.brandPrimary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pointsText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: spacing.md },
  questFooter: { flexDirection: 'row', gap: spacing.xl },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: bentoPalette.textTertiary },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: bentoPalette.textTertiary }
});
