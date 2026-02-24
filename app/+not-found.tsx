import { Stack } from 'expo-router';
import { StyleSheet, Text, View, Button } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={80} color="#ffffff" />
        <Text style={styles.title}>Oops! Page Not Found</Text>
        <Text style={styles.text}>
          The page you are looking for doesn't exist or has been moved.
        </Text>
        <Button title="Go to Home" onPress={() => { /* Add navigation logic */ }} color="#1e90ff" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#001f3f', // Dark blue background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ffffff', // White text
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#dcdcdc', // Light gray text
  },
});
