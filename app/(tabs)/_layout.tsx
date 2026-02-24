import { Tabs } from 'expo-router';
import { Home, Search, Bell, User, Zap } from 'lucide-react-native';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { ThemeContext } from '../theme-context';
import { getThemeColors } from '../theme-styles';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext) as { theme: 'light' | 'dark' };
  const colors = getThemeColors(theme);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#0A1229' : '#FFFFFF',
          borderTopWidth: 0,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 8),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, any> = {
            index: Home,
            search: Search,
            notify: Zap,
            profile: User,
          };

          const IconComponent = icons[route.name] || Home;

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? (colors.primary + '15') : 'transparent',
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 16,
            }}>
              <IconComponent
                size={22}
                color={focused ? colors.primary : colors.subtext}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      />
      <Tabs.Screen
        name="notify"
        options={{
          title: 'SOS',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'System',
        }}
      />
    </Tabs>
  );
}