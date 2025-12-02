// =========================================================
// momentum-mobile/src/screens/parent/AdminViewShowcase.tsx
// Admin View Concepts Showcase - Test 4 different UI approaches
// =========================================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Import the 4 concept implementations
import BentoCommandCenter from '../../components/admin-concepts/BentoCommandCenter';
import ContextCards from '../../components/admin-concepts/ContextCards';
import MorningBriefing from '../../components/admin-concepts/MorningBriefing';
import MissionControl from '../../components/admin-concepts/MissionControl';

type ConceptType = 'bento' | 'context' | 'briefing' | 'mission';

const concepts = [
    { id: 'bento' as ConceptType, name: '🍱 Bento Command Center', description: 'Widget-based dashboard' },
    { id: 'context' as ConceptType, name: '🃏 Context Cards', description: 'Job-focused card stack' },
    { id: 'briefing' as ConceptType, name: '☀️ Morning Briefing', description: 'Curated daily overview' },
    { id: 'mission' as ConceptType, name: '🚀 Mission Control', description: 'Command panel interface' },
];

export default function AdminViewShowcase() {
    const [selectedConcept, setSelectedConcept] = useState<ConceptType | null>(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { currentTheme: theme } = useTheme();

    // If a concept is selected, show it in full screen
    if (selectedConcept) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.bgSurface }}>
                {/* Back button to return to selector */}
                <View style={[styles.conceptHeader, { paddingTop: insets.top + 16, backgroundColor: theme.colors.bgSurface, borderBottomColor: theme.colors.borderSubtle }]}>
                    <TouchableOpacity
                        onPress={() => setSelectedConcept(null)}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={theme.colors.textPrimary} />
                        <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Back to Concepts</Text>
                    </TouchableOpacity>
                </View>

                {/* Render the selected concept */}
                {selectedConcept === 'bento' && <BentoCommandCenter />}
                {selectedConcept === 'context' && <ContextCards />}
                {selectedConcept === 'briefing' && <MorningBriefing />}
                {selectedConcept === 'mission' && <MissionControl />}
            </View>
        );
    }

    // Concept selector screen
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgSurface }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: theme.colors.borderSubtle }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                    <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Admin View Concepts</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Select a concept to explore different admin view approaches
                </Text>

                {concepts.map((concept) => (
                    <TouchableOpacity
                        key={concept.id}
                        style={[styles.conceptCard, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }]}
                        onPress={() => setSelectedConcept(concept.id)}
                    >
                        <Text style={[styles.conceptName, { color: theme.colors.textPrimary }]}>{concept.name}</Text>
                        <Text style={[styles.conceptDescription, { color: theme.colors.textSecondary }]}>{concept.description}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    conceptHeader: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 12,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
    },
    conceptCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    conceptName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    conceptDescription: {
        fontSize: 14,
    },
});
