// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';

// Mandatory PascalCase interface name
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  titleStyle?: string; // Allows for overriding text color (e.g., for tertiary button)
}

// Mandatory PascalCase component name
const Button: React.FC<ButtonProps> = ({ title, titleStyle, style, ...props }) => {
  const tw = useTailwind();

  // Primary Button Mandates: bg-action-primary, text-white, rounded-lg, py-3 px-5, shadow-sm
  const baseButtonClasses = 'bg-color-action-primary rounded-lg py-3 px-5 shadow-sm items-center justify-center';

  return (
    <TouchableOpacity
      {...props}
      // FIX APPLIED (Previous Step): Asserting as ViewStyle
      style={[tw(baseButtonClasses) as ViewStyle, style]}
      activeOpacity={0.8}
    >
      {/* Label Mandate: font-medium, text-base */}
      {/* FIX APPLIED (Current Step): Asserting the text style output as TextStyle to fix the Text component's style prop error. */}
      <Text style={tw(`text-white font-medium text-base ${titleStyle as string}`) as TextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;