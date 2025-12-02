// =========================================================
// ThemeSelectorModal - Switch App Theme
// =========================================================
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Check, Palette } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';

interface ThemeSelectorModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ThemeSelectorModal({ visible, onClose }: ThemeSelectorModalProps) {
    const { currentTheme: theme, availableThemes, setTheme } = useTheme();

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title="Theme Settings"
            scrollable={false}
        >
            <View style={styles.container}>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Choose a look for your dashboard
                </Text>

                <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                    {availableThemes.map((t) => {
                        const isSelected = t.id === theme.id;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                style={[
                                    styles.themeCard,
                                    {
                                        backgroundColor: t.colors.bgSurface,
                                        borderColor: isSelected ? theme.colors.actionPrimary : theme.colors.borderSubtle,
                                    },
                                    isSelected && { borderWidth: 2 },
                                ]}
                                onPress={() => setTheme(t.id)}
                            >
                                {/* Preview Header */}
                                <View style={[styles.previewHeader, { backgroundColor: t.colors.actionPrimary }]}>
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <Check size={12} color={t.colors.actionPrimary} />
                                        </View>
                                    )}
                                </View>

                                {/* Theme Info */}
                                <View style={styles.cardContent}>
                                    <Text style={[styles.themeName, { color: t.colors.textPrimary }]}>
                                        {t.name}
                                    </Text>
                                    <View style={styles.colorRow}>
                                        <View style={[styles.colorDot, { backgroundColor: t.colors.bgCanvas }]} />
                                        <View style={[styles.colorDot, { backgroundColor: t.colors.textPrimary }]} />
                                        <View style={[styles.colorDot, { backgroundColor: t.colors.actionHover }]} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 20,
    },
    themeCard: {
        width: '47%',
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    previewHeader: {
        height: 60,
        width: '100%',
        position: 'relative',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        padding: 12,
        gap: 8,
    },
    themeName: {
        fontSize: 16,
        fontWeight: '600',
    },
    colorRow: {
        flexDirection: 'row',
        gap: 6,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
});
