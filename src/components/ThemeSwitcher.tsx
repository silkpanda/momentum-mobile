// src/components/ThemeSwitcher.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Palette, Check, Lock } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function ThemeSwitcher() {
    const { currentTheme, setTheme, availableThemes, hasPremiumAccess } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleThemeSelect = (themeId: string) => {
        setTheme(themeId);
        setIsOpen(false);
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setIsOpen(true)}
                style={[
                    styles.triggerButton,
                    {
                        backgroundColor: currentTheme.colors.bgSurface,
                        borderColor: currentTheme.colors.borderSubtle,
                    },
                ]}
            >
                <Palette size={20} color={currentTheme.colors.actionPrimary} />
                <Text style={[styles.triggerText, { color: currentTheme.colors.textPrimary }]}>
                    {currentTheme.name}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View
                        style={[
                            styles.modalContainer,
                            { backgroundColor: currentTheme.colors.bgSurface },
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        {/* Header */}
                        <View
                            style={[
                                styles.header,
                                { borderBottomColor: currentTheme.colors.borderSubtle },
                            ]}
                        >
                            <Text style={[styles.headerTitle, { color: currentTheme.colors.textPrimary }]}>
                                Choose Theme
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: currentTheme.colors.textSecondary }]}>
                                {hasPremiumAccess
                                    ? 'All themes unlocked'
                                    : 'Premium themes require subscription'}
                            </Text>
                        </View>

                        {/* Theme List */}
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            <View style={styles.themeList}>
                                {availableThemes.map((theme) => (
                                    <ThemeOption
                                        key={theme.id}
                                        theme={theme}
                                        isSelected={theme.id === currentTheme.id}
                                        onSelect={() => handleThemeSelect(theme.id)}
                                        currentTheme={currentTheme}
                                    />
                                ))}
                            </View>
                        </ScrollView>

                        {/* Premium Footer */}
                        {!hasPremiumAccess && (
                            <View
                                style={[
                                    styles.footer,
                                    {
                                        borderTopColor: currentTheme.colors.borderSubtle,
                                        backgroundColor: currentTheme.colors.actionPrimary + '0D', // 5% opacity
                                    },
                                ]}
                            >
                                <Lock size={14} color={currentTheme.colors.textSecondary} />
                                <Text style={[styles.footerText, { color: currentTheme.colors.textSecondary }]}>
                                    Unlock {availableThemes.length > 2 ? 'more' : 'premium'} themes with
                                    Momentum Premium
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

interface ThemeOptionProps {
    theme: Theme;
    isSelected: boolean;
    onSelect: () => void;
    currentTheme: Theme;
}

function ThemeOption({ theme, isSelected, onSelect, currentTheme }: ThemeOptionProps) {
    return (
        <TouchableOpacity
            onPress={onSelect}
            style={[
                styles.themeOption,
                {
                    backgroundColor: isSelected
                        ? currentTheme.colors.actionPrimary + '1A' // 10% opacity
                        : 'transparent',
                    borderColor: isSelected
                        ? currentTheme.colors.actionPrimary
                        : 'transparent',
                },
            ]}
        >
            <View style={styles.themeOptionContent}>
                {/* Color Preview */}
                <View style={styles.colorPreview}>
                    <View
                        style={[
                            styles.colorDot,
                            {
                                backgroundColor: theme.colors.actionPrimary,
                                borderColor: currentTheme.colors.borderSubtle,
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.colorDot,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                borderColor: currentTheme.colors.borderSubtle,
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.colorDot,
                            {
                                backgroundColor: theme.colors.signalSuccess,
                                borderColor: currentTheme.colors.borderSubtle,
                            },
                        ]}
                    />
                </View>

                {/* Theme Info */}
                <View style={styles.themeInfo}>
                    <View style={styles.themeNameRow}>
                        <Text style={[styles.themeName, { color: currentTheme.colors.textPrimary }]}>
                            {theme.name}
                        </Text>
                        {theme.isPremium && (
                            <Lock size={12} color={currentTheme.colors.textSecondary} />
                        )}
                    </View>
                    <Text style={[styles.themeDescription, { color: currentTheme.colors.textSecondary }]}>
                        {theme.description}
                    </Text>
                </View>
            </View>

            {/* Selected Indicator */}
            {isSelected && (
                <Check size={20} color={currentTheme.colors.actionPrimary} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    triggerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    triggerText: {
        fontSize: 14,
        fontWeight: '500',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: Math.min(width - 40, 400),
        maxHeight: '80%',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 4,
    },
    scrollView: {
        maxHeight: 400,
    },
    themeList: {
        padding: 12,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    themeOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    colorPreview: {
        flexDirection: 'row',
        gap: 4,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    themeInfo: {
        flex: 1,
    },
    themeNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    themeName: {
        fontSize: 14,
        fontWeight: '500',
    },
    themeDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        gap: 6,
    },
    footerText: {
        fontSize: 11,
        flex: 1,
    },
});
