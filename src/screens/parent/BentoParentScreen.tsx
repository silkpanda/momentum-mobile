import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import BentoGrid from '../../components/bento/BentoGrid';
import BentoCard from '../../components/bento/BentoCard';
import FloatingDock from '../../components/bento/FloatingDock';
import MorningBriefWidget from '../../components/bento/widgets/MorningBriefWidget';
import ApprovalsWidget from '../../components/bento/widgets/ApprovalsWidget';
import TaskMasterWidget from '../../components/bento/widgets/TaskMasterWidget';
import MealPlannerWidget from '../../components/bento/widgets/MealPlannerWidget';
import TheBankWidget from '../../components/bento/widgets/TheBankWidget';
import { bentoPalette } from '../../theme/bentoTokens';

export default function BentoParentScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handleHomePress = () => {
        // For now, navigate back to the old Parent Dashboard
        navigation.navigate('Parent');
    };

    const handleCreatePress = () => {
        // Placeholder for Create Action Sheet
        Alert.alert('Create', 'Open Create Modal');
    };

    const handleSwitchPress = () => {
        // Switch to Family View
        navigation.navigate('Family');
    };

    return (
        <View style={{ flex: 1, backgroundColor: bentoPalette.canvas }}>
            <BentoGrid>
                {/* Row 1: Hero */}
                <MorningBriefWidget />

                {/* Row 2: Action & Status */}
                <ApprovalsWidget />
                <TheBankWidget />

                {/* Row 3: Lists & Utility */}
                <TaskMasterWidget />
                <View style={{ width: '47%', gap: 16 }}>
                    <MealPlannerWidget style={{ width: '100%' }} />
                    {/* Placeholder for future widget to balance the Tall TaskMaster */}
                    <BentoCard
                        size="standard"
                        onPress={() => console.log('Calendar')}
                        style={{ width: '100%' }}
                    >
                        <Text>Calendar</Text>
                    </BentoCard>
                </View>
            </BentoGrid>

            <FloatingDock
                onHomePress={handleHomePress}
                onCreatePress={handleCreatePress}
                onSwitchPress={handleSwitchPress}
            />
        </View>
    );
}
