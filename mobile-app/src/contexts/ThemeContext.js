import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, darkTheme } from '../theme/theme';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateCurrentTheme();
  }, [isDarkMode, themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('theme_mode');
      if (savedThemeMode) {
        setThemeMode(savedThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('theme_mode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const updateCurrentTheme = () => {
    let shouldUseDarkMode = false;

    switch (themeMode) {
      case 'light':
        shouldUseDarkMode = false;
        break;
      case 'dark':
        shouldUseDarkMode = true;
        break;
      case 'system':
      default:
        shouldUseDarkMode = systemColorScheme === 'dark';
        break;
    }

    setIsDarkMode(shouldUseDarkMode);
    setCurrentTheme(shouldUseDarkMode ? darkTheme : theme);
  };

  const toggleTheme = async () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(newMode);
    await saveThemePreference(newMode);
  };

  const setLightTheme = async () => {
    setThemeMode('light');
    await saveThemePreference('light');
  };

  const setDarkTheme = async () => {
    setThemeMode('dark');
    await saveThemePreference('dark');
  };

  const setSystemTheme = async () => {
    setThemeMode('system');
    await saveThemePreference('system');
  };

  const value = {
    theme: currentTheme,
    isDarkMode,
    themeMode,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
