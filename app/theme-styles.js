// theme-styles.js
export const lightTheme = {
  background: '#F0F4F8',
  surface: '#FFFFFF',
  cardBackground: '#FFFFFF',
  text: '#102A43',
  subtext: '#486581',
  border: '#D9E2EC',
  primary: '#243B53', // Deep blue-gray
  accent: '#334E68',
  highlight: '#627D98',
  error: '#D64545',
  success: '#38A169',
  warning: '#E9B949',
  switch: {
    trackActive: '#243B53',
    trackInactive: '#BCCCDC',
    thumbActive: '#FFFFFF',
    thumbInactive: '#F0F4F8',
  },
  shadow: {
    color: '#102A43',
    opacity: 0.1,
  },
  statusBar: 'dark-content',
  icon: '#334E68',
  divider: '#D9E2EC',
  gradient: ['#243B53', '#334E68', '#486581'],
};

export const darkTheme = {
  background: '#030816', // Very deep space blue
  surface: '#0A1229',
  cardBackground: '#0D1B36',
  text: '#F0F4F8',
  subtext: '#9FB3C8',
  border: '#102A43',
  primary: '#2040d6', // Cyber blue
  accent: '#4FD1C5', // Teal accent
  highlight: '#81E6D9',
  error: '#FF5A5F',
  success: '#319795',
  warning: '#FFD166',
  switch: {
    trackActive: '#2040d6',
    trackInactive: '#102A43',
    thumbActive: '#FFFFFF',
    thumbInactive: '#486581',
  },
  shadow: {
    color: '#000000',
    opacity: 0.4,
  },
  statusBar: 'light-content',
  icon: '#9FB3C8',
  divider: '#102A43',
  gradient: ['#030816', '#0A1229', '#0D1B36'],
  accentGradient: ['#2040d6', '#1E3A8A', '#1E3A8A'],
};

export const getThemeColors = (theme) => {
  return theme === 'light' ? lightTheme : darkTheme;
};