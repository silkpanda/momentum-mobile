import React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';

describe('Mobile Health Check', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<Text>Snapshot test!</Text>).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
