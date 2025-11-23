import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { X, Check, Save, Trash2 } from 'lucide-react-native';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';
import { Member } from '../../types';

interface EditMemberModalProps {
    visible: boolean;
    member: Member | null;
    onClose: () => void;
    onSuccess: () => void;
    householdId: string;
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

export default function EditMemberModal({ visible, member, onClose, onSuccess, householdId }: EditMemberModalProps) {
    const theme = themes.calmLight;
    const [firstName, setFirstName] = useState('');
    const [role, setRole] = useState<'Parent' | 'Child'>('Child');
    const [selectedColor, setSelectedColor] = useState<string>(PROFILE_COLORS[0].hex);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (member) {
            setFirstName(member.firstName);
            setRole(member.role);
            setSelectedColor(member.profileColor || PROFILE_COLORS[0].hex);
        }
    }, [member]);

    const handleUpdate = async () => {
        if (!member || !firstName.trim()) return;

        setLoading(true);
        try {
            await api.updateMember(member._id || member.id, {
                householdId,
                firstName: firstName.trim(),
                displayName: firstName.trim(),
                role,
                profileColor: selectedColor,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update member');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!member) return;

        Alert.alert(
            'Delete Member',
            `Are you sure you want to remove ${member.firstName}? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await api.deleteMember(member._id || member.id, householdId);
                            onSuccess();
                            onClose();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete member');
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    if (!member) return null;

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
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Edit Member</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {/* Name Input */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
                            <TextInput
                                style={[styles.input, {
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary,
                                    backgroundColor: theme.colors.bgCanvas
                                }]}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>

                        {/* Role Selection */}
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

                        {/* Update Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.colors.actionPrimary },
                                loading && { opacity: 0.7 }
                            ]}
                            onPress={handleUpdate}
                            disabled={loading || deleting}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.submitButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity
                            style={[
                                styles.deleteButton,
                                { borderColor: theme.colors.signalAlert },
                                deleting && { opacity: 0.7 }
                            ]}
                            onPress={handleDelete}
                            disabled={loading || deleting}
                        >
                            {deleting ? (
                                <ActivityIndicator color={theme.colors.signalAlert} />
                            ) : (
                                <>
                                    <Trash2 size={20} color={theme.colors.signalAlert} style={{ marginRight: 8 }} />
                                    <Text style={[styles.deleteButtonText, { color: theme.colors.signalAlert }]}>Remove Member</Text>
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
    deleteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
