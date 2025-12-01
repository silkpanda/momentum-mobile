import React from 'react';
import { View, Text } from 'react-native';
import BentoGrid from '../../components/bento/BentoGrid';
import BentoCard from '../../components/bento/BentoCard';
import FloatingDock from '../../components/bento/FloatingDock';
import { bentoPalette } from '../../theme/bentoTokens';

export default function BentoParentScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: bentoPalette.canvas }}>
            <BentoGrid>
                <BentoCard size="hero" onPress={() => console.log('Hero pressed')}>
                    <Text>Morning Brief Widget</Text>
                </BentoCard>

                <BentoCard size="standard" onPress={() => console.log('Approvals')}>
                    <Text>Approvals</Text>
                </BentoCard>

                <BentoCard size="tall" onPress={() => console.log('Tasks')}>
                    <Text>Task Master</Text>
                </BentoCard>

                <BentoCard size="standard" onPress={() => console.log('Meals')}>
                    <Text>Meal Planner</Text>
                </BentoCard>

                <BentoCard size="standard" onPress={() => console.log('Bank')}>
                    <Text>The Bank</Text>
                </BentoCard>
            </BentoGrid>

            <FloatingDock
                onHomePress={() => console.log('Home')}
                onCreatePress={() => console.log('Create')}
                onSwitchPress={() => console.log('Switch')}
            />
        </View>
    );
}
