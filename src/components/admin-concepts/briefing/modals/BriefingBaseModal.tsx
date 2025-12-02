// =========================================================
// BriefingBaseModal - Themed modal for Morning Briefing
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
import { useTheme } from '../../../../contexts/ThemeContext';

interface BriefingBaseModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    headerRight?: ReactNode;
    scrollable?: boolean;
}

export default function BriefingBaseModal({
    visible,
    onClose,
    title,
    children,
    headerRight,
    scrollable = true,
}: BriefingBaseModalProps) {
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
            <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas, paddingTop: insets.top }]}>
                {/* Header - Newspaper Style */}
                <View style={[styles.header, { borderBottomColor: theme.colors.textPrimary }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        {title.toUpperCase()}
                    </Text>

                    <View style={styles.headerRight}>
                        {headerRight || <View style={{ width: 24 }} />}
                    </View>
                </View>

                {/* Content */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {content}
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    headerRight: {
        minWidth: 24,
        alignItems: 'flex-end',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
});
