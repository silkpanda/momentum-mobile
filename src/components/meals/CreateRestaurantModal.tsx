// src/components/meals/CreateRestaurantModal.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { X, Utensils, MapPin, Phone, DollarSign, Check } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

interface CreateRestaurantModalProps {
    visible: boolean;
    onClose: () => void;
    onRestaurantCreated: (restaurant: any) => void;
}

export default function CreateRestaurantModal({ visible, onClose, onRestaurantCreated }: CreateRestaurantModalProps) {
    const { currentTheme: theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        address: '',
        phone: '',
        website: '',
        priceRange: '$',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            Alert.alert('Validation Error', 'Restaurant name is required.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.createRestaurant(formData);
            if (response.data && response.data.restaurant) {
                onRestaurantCreated(response.data.restaurant);
                // Reset form
                setFormData({
                    name: '',
                    cuisine: '',
                    address: '',
                    phone: '',
                    website: '',
                    priceRange: '$',
                });
                onClose();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create restaurant');
        } finally {
            setIsLoading(false);
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
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgSurface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitle}>
                            <Utensils size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Add Restaurant</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Name */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                value={formData.name}
                                onChangeText={(value) => handleChange('name', value)}
                                placeholder="e.g., Pizza Palace"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                        </View>

                        {/* Cuisine */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Cuisine</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                value={formData.cuisine}
                                onChangeText={(value) => handleChange('cuisine', value)}
                                placeholder="e.g., Italian"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                        </View>

                        {/* Price Range */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Price Range</Text>
                            <View style={styles.priceRangeContainer}>
                                {['$', '$$', '$$$', '$$$$'].map((price) => (
                                    <TouchableOpacity
                                        key={price}
                                        style={[
                                            styles.priceButton,
                                            { borderColor: theme.colors.borderSubtle },
                                            formData.priceRange === price && {
                                                backgroundColor: theme.colors.actionPrimary,
                                                borderColor: theme.colors.actionPrimary,
                                            }
                                        ]}
                                        onPress={() => handleChange('priceRange', price)}
                                    >
                                        <Text style={[
                                            styles.priceButtonText,
                                            { color: theme.colors.textPrimary },
                                            formData.priceRange === price && { color: '#FFFFFF' }
                                        ]}>
                                            {price}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Address */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Address</Text>
                            <View style={styles.inputWithIcon}>
                                <MapPin size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.inputWithIconPadding, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        color: theme.colors.textPrimary,
                                        borderColor: theme.colors.borderSubtle
                                    }]}
                                    value={formData.address}
                                    onChangeText={(value) => handleChange('address', value)}
                                    placeholder="123 Main St"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>
                        </View>

                        {/* Phone */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Phone</Text>
                            <View style={styles.inputWithIcon}>
                                <Phone size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.inputWithIconPadding, {
                                        backgroundColor: theme.colors.bgCanvas,
                                        color: theme.colors.textPrimary,
                                        borderColor: theme.colors.borderSubtle
                                    }]}
                                    value={formData.phone}
                                    onChangeText={(value) => handleChange('phone', value)}
                                    placeholder="(555) 123-4567"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Website (Optional) */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Website (Optional)</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                value={formData.website}
                                onChangeText={(value) => handleChange('website', value)}
                                placeholder="https://example.com"
                                placeholderTextColor={theme.colors.textTertiary}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </ScrollView>

                    {/* Submit Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.colors.actionPrimary },
                                isLoading && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Check size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Add Restaurant</Text>
                                </>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        maxHeight: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputWithIcon: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: 12,
        zIndex: 1,
    },
    inputWithIconPadding: {
        paddingLeft: 40,
    },
    priceRangeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    priceButton: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
    },
    priceButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        gap: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
