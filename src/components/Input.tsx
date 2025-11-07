// src/components/Input.tsx
import React from 'react';
import { TextInput, Text, View, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';

// Mandatory PascalCase interface name
interface InputProps extends TextInputProps {
  label: string;
}

// Mandatory PascalCase component name
const Input: React.FC<InputProps> = ({ label, style, ...props }) => {
  const tw = useTailwind();

  return (
    // FIX APPLIED (Previous Step): Asserted to ViewStyle
    <View style={tw('mb-4 w-full') as ViewStyle}>
      {/* Mandate: Label must be visible. Use font-medium text-sm text-text-secondary above input. */}
      {/* FIX APPLIED (Previous Step): Asserted to TextStyle */}
      <Text style={tw('font-medium text-sm text-text-secondary mb-1') as TextStyle}>{label}</Text>
      
      <TextInput
        {...props}
        // Input Field Mandates: rounded-md, border-subtle, p-3, bg-bg-surface
        // FIX APPLIED (Previous Step): Asserted to TextStyle
        style={[
          tw('rounded-md border border-border-subtle p-3 bg-bg-surface text-text-primary') as TextStyle,
          style, // Merging external styles if passed in
        ]}
        // FIX APPLIED (Current Step): Replaced tw.color() with tw('class').color 
        // to bypass the TypeScript error and extract the required color string.
        placeholderTextColor={(tw('text-text-secondary') as TextStyle).color}
      />
    </View>
  );
};

export default Input;