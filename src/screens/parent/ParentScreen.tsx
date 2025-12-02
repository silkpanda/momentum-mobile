// =========================================================
// momentum-mobile/src/screens/parent/ParentScreen.tsx
// Parent View - Admin Concepts Showcase (Bento Default)
// =========================================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Grid3x3, Sun, Rocket } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Import the 3 concept implementations
import BentoCommandCenter from '../../components/admin-concepts/BentoCommandCenter';
import MorningBriefing from '../../components/admin-concepts/MorningBriefing';
import MissionControl from '../../components/admin-concepts/MissionControl';

type ConceptType = 'bento' | 'briefing' | 'mission';

const concepts = [
    { id: 'bento' as ConceptType, name: 'Bento', icon: Grid3x3, description: 'Widget dashboard' },
    { id: 'briefing' as ConceptType, name: 'Briefing', icon: Sun, description: 'Daily overview' },
    { id: 'mission' as ConceptType, name: 'Mission', icon: Rocket, description: 'Command panel' },
];

export default function ParentScreen() {
    // Default to Bento Command Center
    const [selectedConcept, setSelectedConcept] = useState<ConceptType>('bento');
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { currentTheme: theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgSurface }}>
            {/* Header with Concept Switcher */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + 12,
                    backgroundColor: theme.colors.bgSurface,
                    borderBottomColor: theme.colors.borderSubtle
                }
            ]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={20} color={theme.colors.textPrimary} />
                    <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Family</Text>
                </TouchableOpacity>

                {/* Concept Switcher Pills */}
                <View style={styles.conceptSwitcher}>
                    {concepts.map((concept) => {
                        const Icon = concept.icon;
                        const isActive = selectedConcept === concept.id;
                        return (
                            <TouchableOpacity
                                key={concept.id}
                                style={[
                                    styles.conceptPill,
                                    isActive
                                        ? { backgroundColor: theme.colors.actionPrimary }
                                        : { backgroundColor: theme.colors.bgCanvas, borderWidth: 1, borderColor: theme.colors.borderSubtle }
                                ]}
                                onPress={() => setSelectedConcept(concept.id)}
                            >
                                <Icon size={16} color={isActive ? '#FFFFFF' : theme.colors.textSecondary} />
                                <Text style={[
                                    styles.conceptPillText,
                                    { color: isActive ? '#FFFFFF' : theme.colors.textSecondary }
                                ]}>
                                    {concept.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Render the selected concept */}
            {selectedConcept === 'bento' && <BentoCommandCenter />}
            {selectedConcept === 'briefing' && <MorningBriefing />}
            {selectedConcept === 'mission' && <MissionControl />}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    backText: {
        fontSize: 15,
        fontWeight: '500',
    },
    conceptSwitcher: {
        flexDirection: 'row',
        gap: 8,
    },
    conceptPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    conceptPillText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
