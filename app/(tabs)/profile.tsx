import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Moon, Globe, Volume2, ChevronRight, LogOut, Phone } from 'lucide-react-native';
import { getThemeColors } from '../theme-styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  return { theme, toggleTheme };
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const colors = getThemeColors(theme);
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [tempNumber, setTempNumber] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNumber = await AsyncStorage.getItem('emergency_number');
      if (savedNumber) {
        setEmergencyNumber(savedNumber);
        setTempNumber(savedNumber);
      } else {
        // Default number
        setEmergencyNumber('+919693437679');
        setTempNumber('+919693437679');
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const saveEmergencyNumber = async () => {
    try {
      await AsyncStorage.setItem('emergency_number', tempNumber);
      setEmergencyNumber(tempNumber);
      setIsEditingNumber(false);
      Alert.alert('Success', 'Emergency contact updated successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.subtext,
      marginBottom: 8,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginBottom: 8,
      ...Platform.select({
        ios: {
          shadowColor: '#000', // Default shadow color
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1, // Default shadow opacity
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    settingText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    input: {
      flex: 1,
      height: 40,
      backgroundColor: theme === 'light' ? '#fff' : '#333',
      borderRadius: 8,
      paddingHorizontal: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.divider,
      marginRight: 10,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: colors.error,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginVertical: 16,
    },
    logoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      marginTop: 16,
      marginBottom: insets.bottom > 0 ? insets.bottom : 16,
      alignItems: 'center',
    },
    version: {
      color: colors.subtext,
      fontSize: 12,
    },
  });

  return (
    <ScrollView
      style={[dynamicStyles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={dynamicStyles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>App Preferences</Text>
        <View style={dynamicStyles.card}>
          {/* Push Notifications */}
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Bell size={22} color={colors.icon} />
              <Text style={dynamicStyles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{
                false: colors.switch.trackInactive,
                true: colors.switch.trackActive
              }}
              thumbColor={notifications ?
                colors.switch.thumbActive :
                colors.switch.thumbInactive
              }
            />
          </View>

          <View style={dynamicStyles.divider} />

          {/* Dark Mode */}
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Moon size={22} color={colors.icon} />
              <Text style={dynamicStyles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{
                false: colors.switch.trackInactive,
                true: colors.switch.trackActive
              }}
              thumbColor={theme === 'dark' ?
                colors.switch.thumbActive :
                colors.switch.thumbInactive
              }
            />
          </View>

          <View style={dynamicStyles.divider} />

          {/* Sound Alerts */}
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Volume2 size={22} color={colors.icon} />
              <Text style={dynamicStyles.settingText}>Sound Alerts</Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{
                false: colors.switch.trackInactive,
                true: colors.switch.trackActive
              }}
              thumbColor={soundAlerts ?
                colors.switch.thumbActive :
                colors.switch.thumbInactive
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>Emergency Settings</Text>
        <View style={dynamicStyles.card}>
          <View style={styles.setting}>
            <View style={{ flex: 1 }}>
              <View style={styles.settingInfo}>
                <Phone size={22} color={colors.icon} />
                <Text style={dynamicStyles.settingText}>Emergency Contact</Text>
              </View>
              {isEditingNumber ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <TextInput
                    style={dynamicStyles.input}
                    value={tempNumber}
                    onChangeText={setTempNumber}
                    placeholder="e.g. 919693437679"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.subtext}
                  />
                  <TouchableOpacity
                    style={dynamicStyles.saveButton}
                    onPress={saveEmergencyNumber}
                  >
                    <Text style={dynamicStyles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditingNumber(false);
                      setTempNumber(emergencyNumber);
                    }}
                    style={{ marginLeft: 10 }}
                  >
                    <Text style={{ color: colors.error }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingNumber(true)}
                  style={{ marginTop: 4, marginLeft: 34 }}
                >
                  <Text style={{ color: colors.primary, fontSize: 16 }}>
                    {emergencyNumber || 'Not set'}
                  </Text>
                  <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 2 }}>
                    Tap to change contact number (Add country code, e.g. 91...)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>General</Text>
        <View style={dynamicStyles.card}>
          <TouchableOpacity style={styles.settingButton}>
            <View style={styles.settingInfo}>
              <Globe size={22} color={colors.icon} />
              <Text style={dynamicStyles.settingText}>Language</Text>
            </View>
            <View style={styles.settingAction}>
              <Text style={[dynamicStyles.settingText, { color: colors.subtext, fontSize: 14 }]}>
                English (US)
              </Text>
              <ChevronRight size={18} color={colors.subtext} />
            </View>
          </TouchableOpacity>
        </View>
      </View>



      <View style={dynamicStyles.footer}>
        <Text style={dynamicStyles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

// Static styles that don't change with theme
const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});