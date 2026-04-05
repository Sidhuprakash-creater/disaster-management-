import 'dotenv/config';

export default () => ({
    expo: {
      extra: {
        WEATHER_API_KEY: process.env.WEATHER_API_KEY || 'b683e6446341486adf5e256bed11f95a',
      },
    },
  });
  