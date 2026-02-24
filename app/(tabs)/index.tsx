import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Marker } from '../../components/ThemedMapView';
import * as Location from 'expo-location';
import { Cloud, Sun, TriangleAlert as AlertTriangle, MapPin, Wind, Droplets, Shield, Navigation } from 'lucide-react-native';
import { getWeatherByCoords } from '../../weatherservice';
import { useTheme } from '../theme-context';
import { getThemeColors } from '../theme-styles';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type WeatherStatus = {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState<WeatherStatus | null>(null);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({});
      }
      setLocation(location);

      if (location) {
        const weatherData = await getWeatherByCoords(
          location.coords.latitude,
          location.coords.longitude
        );

        if (weatherData) {
          setWeather({
            temperature: Math.round(weatherData.main.temp),
            humidity: weatherData.main.humidity,
            condition: weatherData.weather[0].main.toLowerCase(),
            windSpeed: weatherData.wind.speed,
          });
        }
      }
    })();
  }, []);

  const weatherAlerts: Record<string, { alert: string; tips: string[]; severity: 'high' | 'moderate' | 'low' }> = {
    rain: {
      alert: "Showers expected. Keep your gear ready.",
      tips: ["Carry an umbrella", "Avoid waterlogging", "Slow driving"],
      severity: 'moderate',
    },
    thunderstorm: {
      alert: "Severe Thunderstorm Hazard! Take cover.",
      tips: ["Unplug electronics", "Stay indoors", "Stay away from windows"],
      severity: 'high',
    },
    flood: {
      alert: "Critical Flood Warning! Evacuate if needed.",
      tips: ["Higher ground", "Avoid moving water", "Shut off utilities"],
      severity: 'high',
    },
    clear: {
      alert: "The sky is clear. It's a great day.",
      tips: ["Stay hydrated", "Sunscreen recommended", "Enjoy the sun"],
      severity: 'low',
    },
    clouds: {
      alert: "Overcast skies today. Stay cozy.",
      tips: ["Keep a light jacket", "Check for updates", "Safe travels"],
      severity: 'low',
    }
  };

  const alertInfo = weather?.condition ? (weatherAlerts[weather.condition] || weatherAlerts['clear']) : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
      >
        {/* Cinematic Header */}
        <Animated.View entering={FadeInUp.duration(800)}>
          <LinearGradient
            colors={theme === 'dark' ? ['#0A1229', '#030816'] : ['#243B53', '#486581']}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>Disaster Control</Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color={colors.accent} />
                  <Text style={styles.locationText}>{location ? 'Live Location' : 'Searching...'}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.surface + '30' }]}>
                <Shield size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Weather Hero Segment */}
            <View style={styles.weatherHero}>
              <View style={styles.tempColumn}>
                <Text style={styles.heroTemp}>{weather ? `${weather.temperature}°` : '--'}</Text>
                <Text style={styles.heroCondition}>
                  {weather?.condition ? weather.condition.toUpperCase() : 'LOADING...'}
                </Text>
              </View>
              <Animated.View entering={ZoomIn.delay(300).duration(800)} style={styles.heroIconContainer}>
                {weather?.condition === 'clear' ? <Sun size={80} color="#FFD166" /> : <Cloud size={80} color="#fff" />}
              </Animated.View>
            </View>

            <View style={styles.weatherDetailsRow}>
              <View style={styles.detailItem}>
                <Droplets size={16} color="#4FD1C5" />
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{weather?.humidity || 0}%</Text>
              </View>
              <View style={[styles.detailItem, styles.detailSeparator]}>
                <Wind size={16} color="#61a0ff" />
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>{weather?.windSpeed || 0} m/s</Text>
              </View>
              <View style={styles.detailItem}>
                <Navigation size={16} color="#FF5A5F" />
                <Text style={styles.detailLabel}>Pressure</Text>
                <Text style={styles.detailValue}>1012 hPa</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Alert Zone (3D Card Effect) */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Real-time Hazard</Text>
          <View style={[
            styles.hazardCard,
            {
              backgroundColor: alertInfo?.severity === 'high' ? '#D64545' + '20' : colors.surface,
              borderColor: alertInfo?.severity === 'high' ? '#D64545' : colors.border
            }
          ]}>
            <View style={[styles.statusIndicator, { backgroundColor: alertInfo?.severity === 'high' ? '#D64545' : '#38A169' }]} />
            <View style={styles.hazardContent}>
              <View style={styles.hazardHeader}>
                <AlertTriangle size={20} color={alertInfo?.severity === 'high' ? '#D64545' : '#38A169'} />
                <Text style={[styles.hazardTitle, { color: alertInfo?.severity === 'high' ? '#D64545' : colors.text }]}>
                  {alertInfo?.severity === 'high' ? 'CRITICAL ALERT' : 'SYSTEM STATUS: SAFE'}
                </Text>
              </View>
              <Text style={[styles.hazardDesc, { color: colors.subtext }]}>
                {alertInfo ? alertInfo.alert : 'Monitoring environmental signals for your safety.'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Cinematic Map View */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Area Overview</Text>
            <TouchableOpacity><Text style={{ color: colors.primary, fontWeight: '600' }}>Expand</Text></TouchableOpacity>
          </View>
          <View style={[styles.mapWrapper, { shadowColor: colors.shadow.color, shadowOpacity: colors.shadow.opacity }]}>
            {location && (
              <MapView
                style={styles.map}
                mapType="satellite"
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Command Center"
                />
              </MapView>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={styles.mapOverlay}
            />
          </View>
        </Animated.View>

        {/* Interactive Tips */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Protocol & Tips</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {alertInfo?.tips.map((tip, index) => (
              <Animated.View
                key={index}
                entering={FadeInRight.delay(800 + (index * 100))}
                style={[styles.tipCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.tipIconBox}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                <Text style={styles.tipSubtext}>Official Guideline</Text>
              </Animated.View>
            )) || (
                <View style={[styles.tipCard, { backgroundColor: colors.surface, width: width - 32 }]}>
                  <Text style={[styles.tipText, { color: colors.text }]}>No specific threats. Keep your emergency kit ready as a standard precaution.</Text>
                </View>
              )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // No top padding here as it's handled by header
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: '#9FB3C8',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  weatherHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tempColumn: {
    flex: 1,
  },
  heroTemp: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    includeFontPadding: false,
  },
  heroCondition: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4FD1C5',
    letterSpacing: 2,
  },
  heroIconContainer: {
    padding: 10,
  },
  weatherDetailsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailSeparator: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    fontSize: 11,
    color: '#9FB3C8',
    marginTop: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  hazardCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  hazardContent: {
    flex: 1,
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hazardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 1,
  },
  hazardDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  mapWrapper: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  horizontalScroll: {
    paddingLeft: 0,
    marginTop: 4,
  },
  tipCard: {
    width: 160,
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  tipSubtext: {
    fontSize: 10,
    color: '#9FB3C8',
    fontWeight: '600',
  }
});