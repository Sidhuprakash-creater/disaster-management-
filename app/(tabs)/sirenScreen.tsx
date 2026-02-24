// declare module '*.mp3' {
//   const value: string;
//   export default value;
// }

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Platform,
//   Vibration,
//   Alert,
//   Linking,
//   PermissionsAndroid,
// } from 'react-native';
// import Geolocation from 'react-native-geolocation-service';
// import { AlertTriangle, Volume2, VolumeX } from 'lucide-react-native';
// import { Audio } from 'expo-av';
// import { useTheme } from '../theme-context';
// import { getThemeColors } from '../theme-styles';
// // Corrected path to the siren sound file
// import sirenSound from './emergency.mp3';


// export default function SirenScreen() {
//   const { theme } = useTheme();
//   const colors = getThemeColors(theme);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [pulseAnim] = useState(new Animated.Value(1));
//   const [flashAnim] = useState(new Animated.Value(0));

//   useEffect(() => {
//     const loadSound = async () => {
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         require('../../../assets/emergency-siren.mp3'),
//         { isLooping: true, volume: 1.0 }
//       );
//       setSound(newSound);
//     };
//     loadSound();
//   }, []);
  

//   // Request location permission
//   const requestLocationPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Permission',
//           message: 'This app needs access to your location to send an SOS alert.',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true; // iOS permissions are handled automatically
//   };

//   // Send SOS message via WhatsApp
//   const sendSOSMessage = async () => {
//     const hasPermission = await requestLocationPermission();
//     if (!hasPermission) {
//       Alert.alert('Permission Denied', 'Location permission is required to send an SOS alert.');
//       return;
//     }

//     Geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         const message = `SOS! I need help. My location: https://maps.google.com/?q=${latitude},${longitude}`;
//         const phoneNumber = '+1234567890'; // Replace with your friend's phone number
//         const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

//         Linking.openURL(url).catch(() =>
//           Alert.alert('Error', 'Unable to open WhatsApp. Please ensure it is installed.')
//         );
//       },
//       (error) => {
//         Alert.alert('Error', 'Unable to fetch location. Please try again.');
//         console.error(error);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//     );
//   };

//   // Create pulsing animation
//   useEffect(() => {
//     if (isPlaying) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.3,
//             duration: 500,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 500,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();

//       // Flash animation for background
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(flashAnim, {
//             toValue: 1,
//             duration: 500,
//             useNativeDriver: false,
//           }),
//           Animated.timing(flashAnim, {
//             toValue: 0,
//             duration: 500,
//             useNativeDriver: false,
//           }),
//         ])
//       ).start();

//       // Vibration pattern
//       if (isPlaying) {
//         const pattern = [0, 500, 200, 500];
//         Vibration.vibrate(pattern, true);
//       }
//     } else {
//       pulseAnim.setValue(1);
//       flashAnim.setValue(0);
//       Vibration.cancel();
//     }

//     return () => {
//       Vibration.cancel();
//     };
//   }, [isPlaying]);

//   // Load and play sound
//   const playSiren = async () => {
//     try {
//       if (sound) {
//         await sound.unloadAsync();
//       }

//       // Show confirmation dialog before playing
//       if (!isPlaying) {
//         Alert.alert(
//           'Activate Emergency Siren',
//           'This will play a loud emergency siren sound. Are you sure you want to continue?',
//           [
//             {
//               text: 'Cancel',
//               style: 'cancel',
//             },
//             {
//               text: 'Activate',
//               onPress: async () => {
//                 const { sound: newSound } = await Audio.Sound.createAsync(
//                   require('../assets/sounds/emergency-siren.mp3'),
//                   { isLooping: true, volume: 1.0 }
//                 );
//                 setSound(newSound);
//                 await newSound.playAsync();
//                 setIsPlaying(true);
//               },
//               style: 'destructive',
//             },
//           ]
//         );
//       } else {
//         if (sound) {
//           await sound.stopAsync();
//           await sound.unloadAsync();
//           setSound(null);
//         }
//         setIsPlaying(false);
//       }
//     } catch (error) {
//       console.error('Error playing sound:', error);
//       Alert.alert('Error', 'Failed to play emergency siren');
//     }
//   };

//   // Clean up
//   useEffect(() => {
//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, [sound]);

//   // Dynamic styles based on theme
//   const dynamicStyles = StyleSheet.create({
//     container: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     animatedBackground: {
//       ...StyleSheet.absoluteFillObject,
//       backgroundColor: colors.background,
//     },
//     buttonContainer: {
//       width: '100%',
//       marginTop: 16,
//     },
//     button: {
//       backgroundColor: isPlaying ? '#dc2626' : colors.text,
//       borderRadius: 12,
//       padding: 16,
//       alignItems: 'center',
//       justifyContent: 'center',
//       flexDirection: 'row',
//     },
//     buttonText: {
//       color: '#ffffff',
//       fontSize: 18,
//       fontWeight: 'bold',
//       marginLeft: 8,
//     },
//   });

//   return (
//     <Animated.View style={[dynamicStyles.container]}>
//       <TouchableOpacity style={dynamicStyles.button} onPress={playSiren}>
//         {isPlaying ? (
//           <VolumeX size={24} color="#ffffff" />
//         ) : (
//           <Volume2 size={24} color="#ffffff" />
//         )}
//         <Text style={dynamicStyles.buttonText}>
//           {isPlaying ? 'Stop Siren' : 'Activate Siren'}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[dynamicStyles.button, { marginTop: 16 }]}
//         onPress={sendSOSMessage}
//       >
//         <Text style={dynamicStyles.buttonText}>Send SOS Alert</Text>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }