import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { bentoPalette, spacing, borderRadius, shadows } from '../../theme/bentoTokens';
import { ArrowLeft, Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react-native';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'approval', title: 'Task Completed', body: 'Jane completed "Clean Room". Review now?', time: '2m ago', icon: 'info' },
  { id: '2', type: 'consensus', title: 'Setting Request', body: 'The other parent wants to enable "Point Sharing".', time: '1h ago', icon: 'alert' },
  { id: '3', type: 'system', title: 'System Updated', body: 'Momentum Mobile v2.0 is now live!', time: '1d ago', icon: 'check' },
];

export function NotificationCenterScreen() {
  const navigation = useNavigation();

  const renderIcon = (type: string) => {
    switch (type) {
      case 'approval': return <Info size={20} color={bentoPalette.brandPrimary} />;
      case 'consensus': return <AlertTriangle size={20} color={bentoPalette.alert} />;
      case 'system': return <CheckCircle size={20} color={bentoPalette.success} />;
      default: return <Bell size={20} color={bentoPalette.textTertiary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={bentoPalette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.iconBox}>
              {renderIcon(item.type)}
            </View>
            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell size={48} color={bentoPalette.textTertiary} opacity={0.3} />
            <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bentoPalette.canvas },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...shadows.soft },
  title: { fontSize: 20, fontWeight: 'bold', color: bentoPalette.textPrimary },
  list: { paddingHorizontal: spacing.xl },
  notificationCard: { flexDirection: 'row', backgroundColor: '#fff', padding: spacing.lg, borderRadius: borderRadius.xl, marginBottom: spacing.sm, ...shadows.soft },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: bentoPalette.textPrimary },
  time: { fontSize: 11, color: bentoPalette.textTertiary },
  body: { fontSize: 13, color: bentoPalette.textSecondary, lineHeight: 18 },
  empty: { flex: 1, paddingTop: 100, alignItems: 'center' },
  emptyText: { marginTop: spacing.md, color: bentoPalette.textTertiary, fontSize: 16 }
});
