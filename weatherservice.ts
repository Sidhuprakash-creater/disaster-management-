import Constants from 'expo-constants';

const { WEATHER_API_KEY } = Constants.expoConfig?.extra || {};

export const getWeatherByCoords = async (lat: number, lon: number) => {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch weather data:', err);
    return null;
  }
};
