// src/components/meals/CreateRecipeModal.tsx
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
import { X, ChefHat, Clock, Users, Plus, Trash2, Check } from 'lucide-react-native';
import { api } from '../../services/api';
import { themes } from '../../theme/colors';

interface CreateRecipeModalProps {
    visible: boolean;
    onClose: () => void;
    onRecipeCreated: (recipe: any) => void;
}

export default function CreateRecipeModal({ visible, onClose, onRecipeCreated }: CreateRecipeModalProps) {
    const theme = themes.calmLight;
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        ingredients: [''],
        instructions: [''],
    });

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: 'ingredients' | 'instructions', index: number, value: string) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addItem = (field: 'ingredients' | 'instructions') => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeItem = (field: 'ingredients' | 'instructions', index: number) => {
        if (formData[field].length > 1) {
            const newArray = formData[field].filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, [field]: newArray }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || formData.ingredients.some(i => !i.trim())) {
            Alert.alert('Validation Error', 'Please provide a title and valid ingredients.');
            return;
        }

        setIsLoading(true);
        try {
            // Transform data to match API schema
            const apiData = {
                name: formData.title,
                description: formData.description,
                prepTimeMinutes: formData.prepTime,
                cookTimeMinutes: formData.cookTime,
                ingredients: formData.ingredients.filter(i => i.trim()),
                instructions: formData.instructions.filter(i => i.trim()),
            };

            const response = await api.createMeal(apiData);
            if (response.data && response.data.recipe) {
                onRecipeCreated(response.data.recipe);
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    prepTime: 15,
                    cookTime: 30,
                    servings: 4,
                    ingredients: [''],
                    instructions: [''],
                });
                onClose();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create recipe');
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
                            <ChefHat size={24} color={theme.colors.actionPrimary} />
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Add New Recipe</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Recipe Title</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                value={formData.title}
                                onChangeText={(value) => handleChange('title', value)}
                                placeholder="e.g., Mom's Spaghetti"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: theme.colors.bgCanvas,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.borderSubtle
                                }]}
                                value={formData.description}
                                onChangeText={(value) => handleChange('description', value)}
                                placeholder="Brief description..."
                                placeholderTextColor={theme.colors.textTertiary}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Time & Servings Row */}
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Prep (mins)</Text>
                                <View style={styles.inputWithIcon}>
                                    <Clock size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithIconPadding, {
                                            backgroundColor: theme.colors.bgCanvas,
                                            color: theme.colors.textPrimary,
                                            borderColor: theme.colors.borderSubtle
                                        }]}
                                        value={String(formData.prepTime)}
                                        onChangeText={(value) => handleChange('prepTime', parseInt(value) || 0)}
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>

                            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Cook (mins)</Text>
                                <View style={styles.inputWithIcon}>
                                    <Clock size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithIconPadding, {
                                            backgroundColor: theme.colors.bgCanvas,
                                            color: theme.colors.textPrimary,
                                            borderColor: theme.colors.borderSubtle
                                        }]}
                                        value={String(formData.cookTime)}
                                        onChangeText={(value) => handleChange('cookTime', parseInt(value) || 0)}
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>

                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Servings</Text>
                                <View style={styles.inputWithIcon}>
                                    <Users size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithIconPadding, {
                                            backgroundColor: theme.colors.bgCanvas,
                                            color: theme.colors.textPrimary,
                                            borderColor: theme.colors.borderSubtle
                                        }]}
                                        value={String(formData.servings)}
                                        onChangeText={(value) => handleChange('servings', parseInt(value) || 0)}
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Ingredients */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Ingredients</Text>
                            {formData.ingredients.map((ingredient, index) => (
                                <View key={index} style={styles.arrayItem}>
                                    <TextInput
                                        style={[styles.input, styles.arrayInput, {
                                            backgroundColor: theme.colors.bgCanvas,
                                            color: theme.colors.textPrimary,
                                            borderColor: theme.colors.borderSubtle
                                        }]}
                                        value={ingredient}
                                        onChangeText={(value) => handleArrayChange('ingredients', index, value)}
                                        placeholder={`Ingredient ${index + 1}`}
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                    {formData.ingredients.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => removeItem('ingredients', index)}
                                            style={styles.removeButton}
                                        >
                                            <Trash2 size={18} color={theme.colors.signalAlert} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity
                                onPress={() => addItem('ingredients')}
                                style={styles.addButton}
                            >
                                <Plus size={16} color={theme.colors.actionPrimary} />
                                <Text style={[styles.addButtonText, { color: theme.colors.actionPrimary }]}>
                                    Add Ingredient
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Instructions */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Instructions</Text>
                            {formData.instructions.map((instruction, index) => (
                                <View key={index} style={styles.arrayItem}>
                                    <Text style={[styles.stepNumber, { color: theme.colors.textTertiary }]}>
                                        {index + 1}.
                                    </Text>
                                    <TextInput
                                        style={[styles.input, styles.arrayInput, styles.textArea, {
                                            backgroundColor: theme.colors.bgCanvas,
                                            color: theme.colors.textPrimary,
                                            borderColor: theme.colors.borderSubtle
                                        }]}
                                        value={instruction}
                                        onChangeText={(value) => handleArrayChange('instructions', index, value)}
                                        placeholder={`Step ${index + 1}`}
                                        placeholderTextColor={theme.colors.textTertiary}
                                        multiline
                                        numberOfLines={2}
                                    />
                                    {formData.instructions.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => removeItem('instructions', index)}
                                            style={styles.removeButton}
                                        >
                                            <Trash2 size={18} color={theme.colors.signalAlert} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity
                                onPress={() => addItem('instructions')}
                                style={styles.addButton}
                            >
                                <Plus size={16} color={theme.colors.actionPrimary} />
                                <Text style={[styles.addButtonText, { color: theme.colors.actionPrimary }]}>
                                    Add Step
                                </Text>
                            </TouchableOpacity>
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
                                    <Text style={styles.submitButtonText}>Save Recipe</Text>
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
        maxHeight: '90%',
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
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
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
    arrayItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    arrayInput: {
        flex: 1,
    },
    stepNumber: {
        fontSize: 12,
        width: 20,
    },
    removeButton: {
        padding: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    addButtonText: {
        fontSize: 14,
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
