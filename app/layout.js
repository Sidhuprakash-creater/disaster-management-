// _layout.js (Root layout in Expo Router)
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './theme-context';
import { View } from 'react-native';

// Wrapper component to apply theme
function ThemedApp() {
  const { theme, isLoading } = useTheme();
  const colors = getThemeColors(theme);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
        {/* You could add a loading indicator here */}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.statusBar} />
      <Slot />
    </View>
  );
}

// Root layout with ThemeProvider
export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}