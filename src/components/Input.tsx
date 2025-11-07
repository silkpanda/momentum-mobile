// src/components/Input.tsx
import React from 'react';
import { TextInput, Text, View, TextInputProps } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';

// Mandatory PascalCase interface name
interface InputProps extends TextInputProps {
  label: string;
}

// Mandatory PascalCase component name
const Input: React.FC<InputProps> = ({ label, ...props }) => {
  const tw = useTailwind();

  return (
    <View style={tw('mb-4 w-full')}>
      {/* Mandate: Label must be visible. Use font-medium text-sm text-text-secondary above input. */}
      <Text style={tw('font-medium text-sm text-text-secondary mb-1')}>{label}</Text>
      
      <TextInput
        {...props}
        // Input Field Mandates: rounded-md, border-subtle, p-3, bg-bg-surface
        style={tw('rounded-md border border-border-subtle p-3 bg-bg-surface text-text-primary')}
        placeholderTextColor={tw.color('text-text-secondary')}
      />
    </View>
  );
};

export default Input;