// =========================================================
// EditStoreItemModal - Create/Edit Store Item with Full Form
// =========================================================
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { DollarSign, Package, Image as ImageIcon } from 'lucide-react-native';
import BaseModal from '../../../modals/BaseModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { api } from '../../../../services/api';
import { StoreItem } from '../../../../types';

interface EditStoreItemModalProps {
    visible: boolean;
    onClose: () => void;
    item?: StoreItem | null;
    onSaved: () => void;
}

export default function EditStoreItemModal({ visible, onClose, item, onSaved }: EditStoreItemModalProps) {
    const { currentTheme: theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        cost: 50,
        stock: 1,
        isInfinite: true,
        image: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form when item changes
    useEffect(() => {
        if (item) {
            setFormData({
                itemName: item.itemName || '',
                description: item.description || '',
                cost: item.cost || 50,
                stock: item.stock || 1,
                isInfinite: item.isInfinite ?? true,
                image: item.image || '',
            });
        } else {
            setFormData({
                itemName: '',
                description: '',
                cost: 50,
                stock: 1,
                isInfinite: true,
                image: '',
            });
        }
        setErrors({});
    }, [item, visible]);

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.itemName.trim()) {
            newErrors.itemName = 'Item name is required';
        } else if (formData.itemName.trim().length < 3) {
            newErrors.itemName = 'Name must be at least 3 characters';
        }

        if (formData.cost < 1) {
            newErrors.cost = 'Cost must be at least 1 point';
        }

        if (!formData.isInfinite && formData.stock < 0) {
            newErrors.stock = 'Stock cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                stock: formData.isInfinite ? undefined : formData.stock,
            };

            if (item) {
                // Update existing item
                await api.updateStoreItem(item._id || item.id, payload);
            } else {
                // Create new item
                await api.createStoreItem(payload);
            }

            onSaved();
        } catch (error) {
            console.error('Save item error:', error);
            Alert.alert('Error', `Failed to ${item ? 'update' : 'create'} item`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = () => {
        if (!item) return;

        Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteStoreItem(item._id || item.id);
                        onSaved();
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete item');
                    }
                },
            },
        ]);
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={item ? 'Edit Item' : 'Create Item'}
            headerRight={
                <View style={styles.headerActions}>
                    {item && (
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSubmitting}
                        style={[
                            styles.saveButton,
                            { backgroundColor: theme.colors.actionPrimary },
                            isSubmitting && { opacity: 0.6 },
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            }
        >
            <View style={styles.form}>
                {/* Item Name */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                        Item Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                color: theme.colors.textPrimary,
                                borderColor: errors.itemName ? '#EF4444' : theme.colors.borderSubtle,
                            },
                        ]}
                        placeholder="e.g., Extra Screen Time"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={formData.itemName}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, itemName: text }));
                            if (errors.itemName) setErrors((prev) => ({ ...prev, itemName: '' }));
                        }}
                    />
                    {errors.itemName && <Text style={styles.errorText}>{errors.itemName}</Text>}
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Description</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.borderSubtle,
                            },
                        ]}
                        placeholder="Add details (optional)"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={formData.description}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Cost */}
                <View style={styles.field}>
                    <View style={styles.labelRow}>
                        <DollarSign size={18} color={theme.colors.actionPrimary} />
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                            Cost (Points) <Text style={styles.required}>*</Text>
                        </Text>
                    </View>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                color: theme.colors.textPrimary,
                                borderColor: errors.cost ? '#EF4444' : theme.colors.borderSubtle,
                            },
                        ]}
                        placeholder="50"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={String(formData.cost)}
                        onChangeText={(text) => {
                            const value = parseInt(text) || 0;
                            setFormData((prev) => ({ ...prev, cost: value }));
                            if (errors.cost) setErrors((prev) => ({ ...prev, cost: '' }));
                        }}
                        keyboardType="number-pad"
                    />
                    {errors.cost && <Text style={styles.errorText}>{errors.cost}</Text>}
                </View>

                {/* Stock Management */}
                <View style={styles.field}>
                    <View style={styles.labelRow}>
                        <Package size={18} color={theme.colors.actionPrimary} />
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                            Availability
                        </Text>
                    </View>

                    <View style={[styles.switchContainer, { backgroundColor: theme.colors.bgCanvas, borderColor: theme.colors.borderSubtle }]}>
                        <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>Infinite Stock</Text>
                        <Switch
                            value={formData.isInfinite}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, isInfinite: value }))}
                            trackColor={{ false: theme.colors.borderSubtle, true: theme.colors.actionPrimary }}
                        />
                    </View>

                    {!formData.isInfinite && (
                        <View style={{ marginTop: 12 }}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 6 }]}>
                                Quantity Available
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.colors.bgCanvas,
                                        color: theme.colors.textPrimary,
                                        borderColor: errors.stock ? '#EF4444' : theme.colors.borderSubtle,
                                    },
                                ]}
                                value={String(formData.stock)}
                                onChangeText={(text) => {
                                    const value = parseInt(text) || 0;
                                    setFormData((prev) => ({ ...prev, stock: value }));
                                }}
                                keyboardType="number-pad"
                            />
                        </View>
                    )}
                </View>

                {/* Image URL (Placeholder for Image Picker) */}
                <View style={styles.field}>
                    <View style={styles.labelRow}>
                        <ImageIcon size={18} color={theme.colors.actionPrimary} />
                        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                            Image URL (Optional)
                        </Text>
                    </View>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.bgCanvas,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.borderSubtle,
                            },
                        ]}
                        placeholder="https://example.com/image.png"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={formData.image}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, image: text }))}
                        autoCapitalize="none"
                    />
                </View>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: 20,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    errorText: {
        fontSize: 13,
        color: '#EF4444',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    deleteButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
});
