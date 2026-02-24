import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Alert, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Region, Marker } from '../../components/ThemedMapView';
import * as Location from 'expo-location';
import { Search as SearchIcon, Wind, Droplets, Thermometer, AlertTriangle, Map as MapIcon, Layers, Info, Shield } from 'lucide-react-native';
import { getWeatherByCoords } from '../../weatherservice';
import { getThemeColors } from '../theme-styles';
import { useTheme } from '../theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<Region | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const data = await getWeatherByCoords(lat, lon);
      if (data && data.main) {
        setWeather(data);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRisk = () => {
    if (!weather) return { level: 'Analyzing...', color: '#6b7280', description: 'Enter a location to initiate risk assessment scan.' };

    const windSpeed = weather.wind?.speed || 0;
    const humidity = weather.main?.humidity || 0;
    const temp = weather.main?.temp || 0;
    const condition = weather.weather?.[0]?.main?.toLowerCase() || '';

    if (windSpeed > 15 || condition.includes('thunderstorm') || condition.includes('tornado')) {
      return {
        level: 'Critical Hazard',
        color: '#D64545',
        description: `Severe environmental threat detected. ${condition.toUpperCase()} with sustained winds of ${windSpeed}m/s. High probability of infrastructure damage.`
      };
    } else if (windSpeed > 8 || humidity > 85 || condition.includes('rain')) {
      return {
        level: 'Elevated Risk',
        color: '#FFD166',
        description: `Atmospheric instability detected. ${condition.toUpperCase()} and ${humidity}% humidity. Potential for local flooding and navigational hazards.`
      };
    } else if (temp > 38) {
      return {
        level: 'Thermal Threat',
        color: '#FF5A5F',
        description: `Extreme thermal levels (${temp}°C) detected in the sector. Potential for heatstroke. Limit outdoor activity to necessary transit only.`
      };
    }

    return {
      level: 'Clear / Secure',
      color: '#38A169',
      description: 'Stabilized atmospheric conditions. No immediate disaster signals detected in the specified coordinates.'
    };
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
      fetchWeather(latitude, longitude);
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
        fetchWeather(latitude, longitude);
      } else {
        Alert.alert('Protocol Error', 'Coordinates for the specified location could not be resolved.');
      }
    } catch (error) {
      Alert.alert('System Error', 'Geencoding link failed. Please check network connectivity.');
    }
  };

  const risk = calculateRisk();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <LinearGradient
        colors={theme === 'dark' ? ['#0A1229', '#030816'] : ['#E0E7FF', '#C7D2FE']}
        style={[styles.searchArea, { paddingTop: insets.top + 10 }]}
      >
        <Text style={[styles.headerTitle, { color: theme === 'dark' ? '#F0F4F8' : '#1E293B' }]}>Environment Scanner</Text>
        <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#FFFFFF' }]}>
          <SearchIcon size={20} color={theme === 'dark' ? '#9FB3C8' : '#475569'} />
          <TextInput
            style={[styles.input, { color: theme === 'dark' ? '#fff' : '#1E293B' }]}
            placeholder="Search City or Sector..."
            placeholderTextColor={theme === 'dark' ? '#486581' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchActionBtn}>
            <Text style={{ color: '#4FD1C5', fontSize: 12, fontWeight: '900' }}>{loading ? '...' : 'SCAN'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Map Interface */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.mapContainer}>
          <View style={styles.mapCornerDecor} />
          <View style={[styles.mapWrapper, { shadowColor: colors.shadow.color }]}>
            {region && (
              <MapView
                style={styles.map}
                region={region}
                mapType="satellite"
                showsUserLocation={true}
              >
                <Marker
                  coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                  title="Scan Target"
                />
              </MapView>
            )}
            <View style={styles.mapHud}>
              <View style={styles.hudItem}><Layers size={16} color="#fff" /></View>
              <View style={styles.hudItem}><MapIcon size={16} color="#fff" /></View>
            </View>
          </View>
        </Animated.View>

        {/* Telemetry Strip */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.telemetryRow}>
          <View style={[styles.telemetryItem, { backgroundColor: colors.surface }]}>
            <Thermometer size={18} color="#FF5A5F" />
            <Text style={[styles.telemetryVal, { color: colors.text }]}>{weather ? Math.round(weather.main.temp) : '--'}°C</Text>
            <Text style={styles.telemetryLabel}>Thermal</Text>
          </View>
          <View style={[styles.telemetryItem, { backgroundColor: colors.surface }]}>
            <Droplets size={18} color="#4FD1C5" />
            <Text style={[styles.telemetryVal, { color: colors.text }]}>{weather ? weather.main.humidity : '--'}%</Text>
            <Text style={styles.telemetryLabel}>Moisture</Text>
          </View>
          <View style={[styles.telemetryItem, { backgroundColor: colors.surface }]}>
            <Wind size={18} color="#60A5FA" />
            <Text style={[styles.telemetryVal, { color: colors.text }]}>{weather ? weather.wind.speed : '--'}</Text>
            <Text style={styles.telemetryLabel}>Kinetic</Text>
          </View>
        </Animated.View>

        {/* Risk Analysis Card */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.riskArea}>
          <View style={styles.riskHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Intelligence Report</Text>
            <Info size={16} color={colors.subtext} />
          </View>
          <View style={[styles.riskCard, { backgroundColor: colors.surface, borderColor: risk.color + '40' }]}>
            <LinearGradient
              colors={[risk.color + '20', 'transparent']}
              style={styles.riskGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.riskContent}>
              <View style={styles.riskLevelRow}>
                <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                <Text style={[styles.riskLevelText, { color: risk.color }]}>{risk.level.toUpperCase()}</Text>
              </View>
              <Text style={[styles.riskDesc, { color: colors.subtext }]}>{risk.description}</Text>

              <View style={styles.riskMetadata}>
                <View style={styles.metaItem}>
                  <Shield size={12} color={colors.subtext} />
                  <Text style={styles.metaText}>CERTIFIED SCAN</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: risk.color }]}>
                  <Text style={styles.actionBtnText}>Full Protocol</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchArea: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    color: '#F0F4F8',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  searchActionBtn: {
    paddingHorizontal: 8,
    height: '100%',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapCornerDecor: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 40,
    height: 40,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#4FD1C5',
    zIndex: 1,
  },
  mapWrapper: {
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  map: {
    flex: 1,
  },
  mapHud: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  hudItem: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  telemetryItem: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  telemetryVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  telemetryLabel: {
    fontSize: 10,
    color: '#9FB3C8',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  riskArea: {
    flex: 1,
  },
  riskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  riskCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 4 },
    }),
  },
  riskGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 100,
  },
  riskContent: {
    padding: 20,
  },
  riskLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  riskDesc: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  riskMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9FB3C8',
    letterSpacing: 0.5,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  }
});