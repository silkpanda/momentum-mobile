// src/components/modals/IconPickerModal.tsx
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
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { TASK_ICONS, ICON_CATEGORIES, getIconsByCategory } from '../../constants/taskIcons';

const { width } = Dimensions.get('window');

interface IconPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (iconName: string) => void;
    selectedIcon?: string;
}

export default function IconPickerModal({ visible, onClose, onSelect, selectedIcon }: IconPickerModalProps) {
    const { currentTheme: theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState<'routine' | 'chores' | 'school' | 'fun' | 'care' | 'special'>(ICON_CATEGORIES[0].id);

    const handleSelect = (iconName: string) => {
        onSelect(iconName);
        onClose();
    };

    const iconsInCategory = getIconsByCategory(selectedCategory);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <View
                    style={[
                        styles.modalContainer,
                        { backgroundColor: theme.colors.bgSurface },
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                            Choose an Icon
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Category Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                        contentContainerStyle={styles.categoryContainer}
                    >
                        {ICON_CATEGORIES.map((category) => {
                            const isSelected = category.id === selectedCategory;
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    onPress={() => setSelectedCategory(category.id)}
                                    style={[
                                        styles.categoryTab,
                                        {
                                            backgroundColor: isSelected
                                                ? theme.colors.actionPrimary
                                                : theme.colors.bgCanvas,
                                            borderColor: isSelected
                                                ? theme.colors.actionPrimary
                                                : theme.colors.borderSubtle,
                                        },
                                    ]}
                                >
                                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.categoryLabel,
                                            {
                                                color: isSelected
                                                    ? '#FFFFFF'
                                                    : theme.colors.textSecondary,
                                            },
                                        ]}
                                    >
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Icon Grid */}
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        <View style={styles.iconGrid}>
                            {iconsInCategory.map((icon) => {
                                const IconComponent = icon.component;
                                const isSelected = icon.name === selectedIcon;
                                return (
                                    <TouchableOpacity
                                        key={icon.name}
                                        onPress={() => handleSelect(icon.name)}
                                        style={[
                                            styles.iconButton,
                                            {
                                                backgroundColor: isSelected
                                                    ? `${theme.colors.actionPrimary}20`
                                                    : theme.colors.bgCanvas,
                                                borderColor: isSelected
                                                    ? theme.colors.actionPrimary
                                                    : theme.colors.borderSubtle,
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.iconCircle,
                                                { backgroundColor: `${icon.color || theme.colors.actionPrimary}20` },
                                            ]}
                                        >
                                            <IconComponent
                                                size={28}
                                                color={icon.color || theme.colors.actionPrimary}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.iconLabel,
                                                { color: theme.colors.textSecondary },
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {icon.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: Math.min(width - 40, 500),
        maxHeight: '85%',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    categoryScroll: {
        maxHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    categoryContainer: {
        padding: 12,
        gap: 8,
    },
    categoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    categoryEmoji: {
        fontSize: 16,
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    scrollView: {
        maxHeight: 450,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    iconButton: {
        width: (width - 40 - 48) / 3, // 3 columns with gaps
        maxWidth: 140,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconLabel: {
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '500',
    },
});
