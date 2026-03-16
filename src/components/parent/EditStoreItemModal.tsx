import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { StoreItem } from '../../types';

interface EditStoreItemModalProps {
    visible: boolean;
    onClose: () => void;
    onItemUpdated: () => void;
    item: StoreItem | null;
}

export default function EditStoreItemModal({ visible, onClose, onItemUpdated, item }: EditStoreItemModalProps) {
    const { currentTheme: theme } = useTheme();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isInfinite, setIsInfinite] = useState(true);
    const [stock, setStock] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible && item) {
            setTitle(item.itemName || '');
            setDescription(item.description || '');
            setPrice(String(item.cost ?? ''));
            setIsInfinite(item.isInfinite ?? true);
            setStock(item.stock !== undefined ? String(item.stock) : '');
            setIsSubmitting(false);
        } else if (visible) {
            // reset for new edit (shouldn't happen)
            setTitle('');
            setDescription('');
            setPrice('');
            setIsInfinite(true);
            setStock('');
        }
    }, [visible, item]);

    const handleUpdate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter an item title');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload: any = {
                itemName: title,
                description,
                cost: parseInt(price) || 0,
                isInfinite,
                stock: isInfinite ? undefined : parseInt(stock) || 0,
            };
            await api.updateStoreItem(item!._id || item!.id, payload);
            onItemUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating store item:', error);
            Alert.alert('Error', 'Failed to update item');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.bgSurface }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Edit Reward</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            {/* Title */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle, color: theme.colors.textPrimary }]}
                                    placeholder="e.g. Extra Screen Time"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle, color: theme.colors.textPrimary }]}
                                    placeholder="Add details..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Cost */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Cost (Points)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle, color: theme.colors.textPrimary }]}
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Stock Management */}
                            <View style={styles.inputGroup}>
                                <View style={styles.switchContainer}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary, marginBottom: 0 }]}>Infinite Stock</Text>
                                    <Switch
                                        value={isInfinite}
                                        onValueChange={setIsInfinite}
                                        trackColor={{ false: theme.colors.borderSubtle, true: theme.colors.actionPrimary }}
                                    />
                                </View>
                                {!isInfinite && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Quantity Available</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle, color: theme.colors.textPrimary }]}
                                            value={stock}
                                            onChangeText={setStock}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
                            <TouchableOpacity
                                style={[styles.updateButton, { backgroundColor: theme.colors.actionPrimary }]}
                                onPress={handleUpdate}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.updateButtonText}>Update Reward</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '70%', padding: 24, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold' },
    closeButton: { padding: 4 },
    form: { flex: 1 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footer: { paddingTop: 16, borderTopWidth: 1 },
    updateButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
    updateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
