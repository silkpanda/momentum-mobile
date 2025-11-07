// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { useTailwind } from 'tailwindcss-react-native';

// Mandatory PascalCase interface name
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  titleStyle?: string; // Allows for overriding text color (e.g., for tertiary button)
}

// Mandatory PascalCase component name
const Button: React.FC<ButtonProps> = ({ title, titleStyle, ...props }) => {
  const tw = useTailwind();

  return (
    <TouchableOpacity
      {...props}
      // Primary Button Mandates: bg-action-primary, text-white, rounded-lg, py-3 px-5, shadow-sm
      style={tw(`bg-color-action-primary rounded-lg py-3 px-5 shadow-sm items-center justify-center ${props.style as string}`)}
      activeOpacity={0.8}
    >
      {/* Label Mandate: font-medium, text-base */}
      <Text style={tw(`text-white font-medium text-base ${titleStyle as string}`)}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;