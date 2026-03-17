import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Theme { name: string; colors: { background: string; surface: string; text: string; primary: string; secondary: string }; }

const defaultTheme: Theme = {
  name: 'default',
  colors: { background: '#FFF9F5', surface: '#FFFFFF', text: '#1C1917', primary: '#6366f1', secondary: '#818cf8' },
};

const darkTheme: Theme = {
  name: 'dark',
  colors: { background: '#0f172a', surface: '#1e293b', text: '#f1f5f9', primary: '#818cf8', secondary: '#a5b4fc' },
};

interface ThemeContextType { theme: Theme; setThemeName: (name: string) => void; isDark: boolean; }

const ThemeContext = createContext<ThemeContextType>({ theme: defaultTheme, setThemeName: () => {}, isDark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState('default');
  const theme = themeName === 'dark' ? darkTheme : defaultTheme;
  return <ThemeContext.Provider value={{ theme, setThemeName, isDark: themeName === 'dark' }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
