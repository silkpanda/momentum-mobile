import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { X } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { StoreItem } from '../../types';
import {
    validateForm,
    getInitialFormData,
    sanitizeFormData,
    type FormField,
    type FormData
} from 'momentum-shared';

interface CreateStoreItemModalProps {
    visible: boolean;
    onClose: () => void;
    onItemCreated: () => void;
    initialItem?: StoreItem | null;
}

const STORE_ITEM_FORM_FIELDS: FormField[] = [
    { name: 'itemName', label: 'Title', type: 'text', required: true, min: 3 },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'cost', label: 'Cost (Points)', type: 'number', required: true, min: 1, defaultValue: 50 },
];

export default function CreateStoreItemModal({ visible, onClose, onItemCreated, initialItem }: CreateStoreItemModalProps) {
    const { currentTheme: theme } = useTheme();

    // Form State
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stock State
    const [isInfinite, setIsInfinite] = useState(true);
    const [stock, setStock] = useState('1');

    useEffect(() => {
        if (visible) {
            if (initialItem) {
                // Edit Mode
                setFormData({
                    itemName: initialItem.itemName,
                    description: initialItem.description,
                    cost: initialItem.cost,
                });
                setIsInfinite(initialItem.isInfinite ?? true);
                setStock(initialItem.stock ? String(initialItem.stock) : '1');
            } else {
                // Create Mode
                setFormData(getInitialFormData(STORE_ITEM_FORM_FIELDS));
                setIsInfinite(true);
                setStock('1');
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [visible, initialItem]);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSave = async () => {
        // 1. Validate Form Fields
        const validation = validateForm(formData, STORE_ITEM_FORM_FIELDS);

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsSubmitting(true);
        try {
            // 2. Sanitize Data
            const sanitizedData = sanitizeFormData(formData, STORE_ITEM_FORM_FIELDS);

            const payload = {
                itemName: sanitizedData.itemName,
                description: sanitizedData.description,
                cost: sanitizedData.cost,
                isAvailable: true,
                isInfinite: isInfinite,
                stock: isInfinite ? undefined : parseInt(stock) || 0,
            };

            if (initialItem && (initialItem.id || initialItem._id)) {
                await api.updateStoreItem(initialItem.id || initialItem._id!, payload);
            } else {
                await api.createStoreItem(payload);
            }

            onItemCreated();
            onClose();
        } catch (error) {
            console.error('Error saving store item:', error);
            Alert.alert('Error', 'Failed to save item');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.bgSurface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                            {initialItem ? 'Edit Reward' : 'New Reward'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: errors.itemName ? theme.colors.signalAlert : theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                placeholder="e.g. Extra Screen Time"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={formData.itemName as string}
                                onChangeText={(text) => handleChange('itemName', text)}
                            />
                            {errors.itemName && (
                                <Text style={[styles.errorText, { color: theme.colors.signalAlert }]}>{errors.itemName}</Text>
                            )}
                        </View>

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                placeholder="Add details..."
                                placeholderTextColor={theme.colors.textSecondary}
                                value={formData.description as string}
                                onChangeText={(text) => handleChange('description', text)}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Cost Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Cost (Points)</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: errors.cost ? theme.colors.signalAlert : theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                value={String(formData.cost || '')}
                                onChangeText={(text) => handleChange('cost', text)}
                                keyboardType="numeric"
                            />
                            {errors.cost && (
                                <Text style={[styles.errorText, { color: theme.colors.signalAlert }]}>{errors.cost}</Text>
                            )}
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
                                        style={[styles.input, {
                                            backgroundColor: theme.colors.bgCanvas,
                                            borderColor: theme.colors.borderSubtle,
                                            color: theme.colors.textPrimary
                                        }]}
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
                            style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.createButtonText}>
                                    {initialItem ? 'Save Changes' : 'Create Reward'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    footer: {
        paddingTop: 16,
        borderTopWidth: 1,
    },
    createButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
