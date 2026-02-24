import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Create the context
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setThemeMode: async (mode: 'light' | 'dark') => {},
  isLoading: true,
});

// Create a provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme');
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          // Use device theme as default if no saved preference
          setTheme(deviceTheme || 'light');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  // Function to toggle theme
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('userTheme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // Function to set theme explicitly
const setThemeMode = async (mode: 'light' | 'dark') => {
    setTheme(mode);
    try {
        await AsyncStorage.setItem('userTheme', mode);
    } catch (error) {
        console.error('Failed to save theme:', error);
    }
};

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};