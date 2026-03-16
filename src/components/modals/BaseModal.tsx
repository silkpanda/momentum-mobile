// =========================================================
// BaseModal - Reusable modal wrapper with consistent styling
// =========================================================
import React, { ReactNode } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    headerRight?: ReactNode;
    scrollable?: boolean;
    fullHeight?: boolean;
}

export default function BaseModal({
    visible,
    onClose,
    title,
    children,
    headerRight,
    scrollable = true,
    fullHeight = false,
}: BaseModalProps) {
    const { currentTheme: theme } = useTheme();
    const insets = useSafeAreaInsets();

    const content = scrollable ? (
        <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    ) : (
        <View style={styles.content}>{children}</View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.container, { backgroundColor: theme.colors.bgSurface }]}>
                    {/* Header */}
                    <View
                        style={[
                            styles.header,
                            {
                                paddingTop: insets.top + 12,
                                backgroundColor: theme.colors.bgSurface,
                                borderBottomColor: theme.colors.borderSubtle,
                            },
                        ]}
                    >
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                                {title}
                            </Text>
                        </View>
                        {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
                    </View>

                    {/* Content */}
                    {content}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerRight: {
        marginLeft: 12,
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
    },
    content: {
        flex: 1,
        padding: 16,
    },
});
