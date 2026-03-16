import React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';
import { describe, it, expect } from '@jest/globals';

describe('Mobile Health Check', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<Text>Snapshot test!</Text>).toJSON();
        expect(tree).toMatchSnapshot();
    });
});

