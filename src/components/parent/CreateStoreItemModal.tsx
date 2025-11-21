import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { themes } from '../../theme/colors';
import { api } from '../../services/api';

interface CreateStoreItemModalProps {
    visible: boolean;
    onClose: () => void;
    onItemCreated: () => void;
}

export default function CreateStoreItemModal({ visible, onClose, onItemCreated }: CreateStoreItemModalProps) {
    const theme = themes.calmLight;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('50');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            setTitle('');
            setDescription('');
            setPrice('50');
            setIsSubmitting(false);
        }
    }, [visible]);

    const handleCreate = async () => {
        if (!title.trim()) {
            alert('Please enter an item title');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createStoreItem({
                itemName: title,
                description,
                cost: parseInt(price) || 0,
                isAvailable: true,
            });
            onItemCreated();
            onClose();
        } catch (error) {
            console.error('Error creating store item:', error);
            alert('Failed to create item');
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
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>New Reward</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                placeholder="e.g. Extra Screen Time"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

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
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Cost (Points)</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    borderColor: theme.colors.borderSubtle,
                                    color: theme.colors.textPrimary
                                }]}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.colors.actionPrimary }]}
                            onPress={handleCreate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.createButtonText}>Create Reward</Text>
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
});
