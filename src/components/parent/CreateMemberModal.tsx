import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { X, Check, UserPlus, Link } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

interface CreateMemberModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    householdId: string;
    usedColors?: string[];
}

const PROFILE_COLORS = [
    { hex: '#EF4444', name: 'Red' },
    { hex: '#F97316', name: 'Orange' },
    { hex: '#F59E0B', name: 'Amber' },
    { hex: '#10B981', name: 'Emerald' },
    { hex: '#06B6D4', name: 'Cyan' },
    { hex: '#3B82F6', name: 'Blue' },
    { hex: '#6366F1', name: 'Indigo' },
    { hex: '#8B5CF6', name: 'Violet' },
    { hex: '#EC4899', name: 'Pink' },
    { hex: '#6B7280', name: 'Gray' },
];

export default function CreateMemberModal({ visible, onClose, onSuccess, householdId, usedColors = [] }: CreateMemberModalProps) {
    const { currentTheme: theme } = useTheme();
    const [mode, setMode] = useState<'create' | 'link'>('create');
    const [firstName, setFirstName] = useState('');
    const [role, setRole] = useState<'Parent' | 'Child'>('Child');
    const [selectedColor, setSelectedColor] = useState<string>(PROFILE_COLORS[0].hex);
    const [linkCode, setLinkCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!firstName.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'create') {
                await api.createMember({
                    householdId,
                    firstName: firstName.trim(),
                    displayName: firstName.trim(),
                    role,
                    profileColor: selectedColor,
                });
            } else {
                if (!linkCode.trim()) {
                    throw new Error('Please enter a link code');
                }
                await api.linkExistingChild(linkCode.trim(), firstName.trim(), selectedColor);
            }

            // Reset form
            setFirstName('');
            setRole('Child');
            setLinkCode('');
            setSelectedColor(PROFILE_COLORS[0].hex);
            setMode('create');

            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                            {mode === 'create' ? 'Add Family Member' : 'Link Existing Child'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Mode Switcher */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                mode === 'create' && { borderBottomColor: theme.colors.actionPrimary, borderBottomWidth: 2 }
                            ]}
                            onPress={() => setMode('create')}
                        >
                            <UserPlus size={16} color={mode === 'create' ? theme.colors.actionPrimary : theme.colors.textSecondary} />
                            <Text style={[
                                styles.tabText,
                                { color: mode === 'create' ? theme.colors.actionPrimary : theme.colors.textSecondary }
                            ]}>Create New</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                mode === 'link' && { borderBottomColor: theme.colors.actionPrimary, borderBottomWidth: 2 }
                            ]}
                            onPress={() => setMode('link')}
                        >
                            <Link size={16} color={mode === 'link' ? theme.colors.actionPrimary : theme.colors.textSecondary} />
                            <Text style={[
                                styles.tabText,
                                { color: mode === 'link' ? theme.colors.actionPrimary : theme.colors.textSecondary }
                            ]}>Link Existing</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {mode === 'link' && (
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Link Code</Text>
                                <TextInput
                                    style={[styles.input, {
                                        borderColor: theme.colors.borderSubtle,
                                        color: theme.colors.textPrimary,
                                        backgroundColor: theme.colors.bgCanvas,
                                        textTransform: 'uppercase'
                                    }]}
                                    placeholder="e.g. EMMA-2024-XYZ"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={linkCode}
                                    onChangeText={setLinkCode}
                                    autoCapitalize="characters"
                                />
                                <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
                                    Enter the code generated from the child's profile in the other household.
                                </Text>
                            </View>
                        )}

                        {/* Name Input */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                {mode === 'link' ? 'Display Name (in this household)' : 'Name'}
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary,
                                    backgroundColor: theme.colors.bgCanvas
                                }]}
                                placeholder="e.g. Alex"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>

                        {/* Role Selection - Only for Create Mode */}
                        {mode === 'create' && (
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Role</Text>
                                <View style={styles.roleContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleButton,
                                            role === 'Child' && { backgroundColor: theme.colors.actionPrimary, borderColor: theme.colors.actionPrimary },
                                            role !== 'Child' && { borderColor: theme.colors.borderSubtle }
                                        ]}
                                        onPress={() => setRole('Child')}
                                    >
                                        <Text style={[
                                            styles.roleText,
                                            role === 'Child' ? { color: '#FFF' } : { color: theme.colors.textSecondary }
                                        ]}>Child</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleButton,
                                            role === 'Parent' && { backgroundColor: theme.colors.actionPrimary, borderColor: theme.colors.actionPrimary },
                                            role !== 'Parent' && { borderColor: theme.colors.borderSubtle }
                                        ]}
                                        onPress={() => setRole('Parent')}
                                    >
                                        <Text style={[
                                            styles.roleText,
                                            role === 'Parent' ? { color: '#FFF' } : { color: theme.colors.textSecondary }
                                        ]}>Parent</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Color Selection */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Profile Color</Text>
                            <View style={styles.colorGrid}>
                                {PROFILE_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color.hex}
                                        style={[
                                            styles.colorButton,
                                            { backgroundColor: color.hex },
                                            selectedColor === color.hex && styles.selectedColor
                                        ]}
                                        onPress={() => setSelectedColor(color.hex)}
                                    >
                                        {selectedColor === color.hex && <Check size={16} color="#FFF" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.colors.actionPrimary },
                                loading && { opacity: 0.7 }
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    {mode === 'create' ? (
                                        <UserPlus size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    ) : (
                                        <Link size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    )}
                                    <Text style={styles.submitButtonText}>
                                        {mode === 'create' ? 'Add Member' : 'Link Child'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    container: {
        borderRadius: 16,
        maxHeight: '90%',
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
