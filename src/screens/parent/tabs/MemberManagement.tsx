import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { bentoPalette, spacing, borderRadius, shadows } from '../../../theme/bentoTokens';
import { useData } from '../../../contexts/DataContext';
import { UserPlus, ChevronRight, Mail, Phone } from 'lucide-react-native';

export default function MemberManagement() {
  const { members } = useData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Family Members</Text>
          <Text style={styles.subtitle}>{members.length} members linked</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <UserPlus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {members.map(member => (
          <TouchableOpacity key={member.id} style={styles.memberCard}>
            <View style={[styles.avatar, { backgroundColor: member.profileColor }]}>
              <Text style={styles.avatarText}>{member.firstName.charAt(0)}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.name}>{member.firstName} {member.lastName}</Text>
              <Text style={styles.role}>{member.role}</Text>
              <View style={styles.contactRow}>
                <Mail size={12} color={bentoPalette.textTertiary} />
                <Text style={styles.contactText}>{member.email}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={bentoPalette.textTertiary} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.inviteCard}>
          <View style={styles.inviteIcon}>
            <Mail size={24} color={bentoPalette.brandPrimary} />
          </View>
          <View style={styles.inviteInfo}>
            <Text style={styles.inviteTitle}>Invite Co-Parent</Text>
            <Text style={styles.inviteSubtitle}>Link another household for management</Text>
          </View>
        </TouchableOpacity>
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
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, ...shadows.soft },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  memberInfo: { flex: 1, marginLeft: spacing.md },
  name: { fontSize: 16, fontWeight: 'bold', color: bentoPalette.textPrimary },
  role: { fontSize: 12, color: bentoPalette.brandPrimary, marginBottom: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { fontSize: 12, color: bentoPalette.textTertiary },
  inviteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', padding: spacing.lg, borderRadius: borderRadius.xl, marginTop: spacing.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: '#bae6fd' },
  inviteIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  inviteInfo: { marginLeft: spacing.md },
  inviteTitle: { fontSize: 16, fontWeight: 'bold', color: '#0369a1' },
  inviteSubtitle: { fontSize: 12, color: '#0ea5e9' }
});
