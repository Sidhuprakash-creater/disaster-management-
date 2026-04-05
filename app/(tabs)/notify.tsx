import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Linking,
  PermissionsAndroid,
  Clipboard,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert as AlertCircle, ShieldAlert, MapPin, MessageSquare, Smartphone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, withRepeat, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { getThemeColors } from '../theme-styles';
import { useTheme } from '../theme-context';

const { width } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const NotifyScreen = () => {
  const insets = useSafeAreaInsets();
  const [sending, setSending] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState('+916371850005');
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const scale = useSharedValue(1);

  useEffect(() => {
    const loadEmergencyNumber = async () => {
      try {
        const savedNumber = await AsyncStorage.getItem('emergency_number');
        if (savedNumber) {
          setEmergencyNumber(savedNumber);
        }
      } catch (e) {
        console.error('Failed to load emergency number', e);
      }
    };
    loadEmergencyNumber();

    scale.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sending ? 0.95 : scale.value }],
  }));

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const requestSMSPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs permission to send SMS as a fallback.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const sendViaSMSWithNumber = async (message: string, number: string) => {
    try {
      const hasPermission = await requestSMSPermission();
      if (!hasPermission) return false;
      const url = `sms:${number}?body=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('SMS Error:', error);
      return false;
    }
  };

  const sendViaWhatsAppWithNumber = async (message: string, number: string) => {
    try {
      const cleanedNumber = number.replace(/\D/g, '');
      const url = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('WhatsApp Error:', error);
      return false;
    }
  };

  const copyToClipboard = (message: string) => {
    Clipboard.setString(message);
    Alert.alert('Copied', 'Emergency message copied to clipboard');
  };

  const handleSendSOS = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setSending(true);

    let currentNumber = emergencyNumber;
    try {
      const savedNumber = await AsyncStorage.getItem('emergency_number');
      if (savedNumber) {
        currentNumber = savedNumber;
        setEmergencyNumber(savedNumber);
      }
    } catch (e) {
      console.error('Error loading number during SOS', e);
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to send an SOS alert.');
      setSending(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const message = `🚨 SOS EMERGENCY! I need immediate help!\n\n📍 My current location: https://maps.google.com/?q=${latitude},${longitude}\n\nSent via DisasterApp Control`;

      const whatsappSuccess = await sendViaWhatsAppWithNumber(message, currentNumber);
      if (!whatsappSuccess) {
        const smsSuccess = await sendViaSMSWithNumber(message, currentNumber);
        if (!smsSuccess) {
          Alert.alert('Protocol Failure', 'Could not open communication channels.', [
            { text: 'Copy Alert', onPress: () => copyToClipboard(message) },
            { text: 'Cancel' },
          ]);
        }
      }
    } catch (error) {
      Alert.alert('Location Error', 'Critical: Could not acquire coordinates.');
    } finally {
      setTimeout(() => setSending(false), 2000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient
          colors={theme === 'dark' ? ['#030816', '#0A1229'] : ['#D64545', '#991B1B']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <Animated.View entering={FadeIn.duration(800)}>
            <ShieldAlert size={40} color="#fff" style={{ alignSelf: 'center', marginBottom: 15 }} />
            <Text style={styles.title}>EMERGENCY PROTOCOL</Text>
            <Text style={styles.subtitle}>Direct Link to Command Center</Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.sosZone}>
          <Animated.View style={[styles.pulseCircle, animatedButtonStyle]} />
          <AnimatedTouchableOpacity
            style={[styles.sosButton, sending && styles.sosButtonActive]}
            onPress={handleSendSOS}
            disabled={sending}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#D64545', '#991B1B']}
              style={styles.buttonGradient}
            >
              <AlertCircle size={60} color="#fff" />
              <Text style={styles.sosText}>
                {sending ? 'INITIATING...' : 'SEND SOS'}
              </Text>
              <Text style={styles.sosSubtext}>TAP TO BROADCAST</Text>
            </LinearGradient>
          </AnimatedTouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.protocolsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transmission Details</Text>
          <View style={[styles.protocolCard, { backgroundColor: colors.surface }]}>
            <View style={styles.protocolItem}>
              <MapPin size={18} color={colors.primary} />
              <Text style={[styles.protocolText, { color: colors.subtext }]}>GPS Coordinates will be attached</Text>
            </View>
            <View style={styles.protocolItem}>
              <MessageSquare size={18} color={colors.primary} />
              <Text style={[styles.protocolText, { color: colors.subtext }]}>WhatsApp & SMS channels will be used</Text>
            </View>
            <View style={styles.protocolItem}>
              <Smartphone size={18} color={colors.primary} />
              <Text style={[styles.protocolText, { color: colors.subtext }]}>Broadcasting to: {emergencyNumber}</Text>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>USE ONLY IN GENUINE EMERGENCY SITUATIONS</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sosZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  pulseCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#D64545',
    opacity: 0.15,
  },
  sosButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#D64545', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
      android: { elevation: 20 },
    }),
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonActive: {
    opacity: 0.8,
  },
  sosText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 1,
  },
  sosSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  protocolsContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 1,
  },
  protocolCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  protocolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  protocolText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 24,
    backgroundColor: 'rgba(214, 69, 69, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 69, 69, 0.2)',
  },
  warningText: {
    color: '#D64545',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  }
});

export default NotifyScreen;
