import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

let MapView: any;
let Marker: any;

if (Platform.OS !== 'web') {
    MapView = require('react-native-maps').default;
    Marker = require('react-native-maps').Marker;
} else {
    // Mock for web
    MapView = ({ children, style, initialRegion }: any) => (
        <View style={[style, styles.webPlaceholder]}>
            <Text style={styles.webText}>Maps are not supported on web yet.</Text>
            <Text style={styles.webSubtext}>Region: {initialRegion?.latitude.toFixed(4)}, {initialRegion?.longitude.toFixed(4)}</Text>
            {children}
        </View>
    );
    Marker = () => null;
}

export type Region = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

export { MapView, Marker };

const styles = StyleSheet.create({
    webPlaceholder: {
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    webText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    webSubtext: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
});
