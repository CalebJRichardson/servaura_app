import { useColorScheme } from 'react-native';

// Theme definitions
const lightTheme = {
  text: '#000000',
  background: '#FFFFFF',
  cardBackground: '#F9F9F9',
  tint: '#e6d592',
  tabIconDefault: '#C4C4C4',
  tabIconSelected: '#e6d592',
  accent: '#e6d592',
  lightAccent: '#F5EDC720',
  border: '#EBEBEB',
  gray: '#555555',
  lightGray: '#C4C4C4',
  primary: '#FFFFFF',
  secondary: '#F5F5F5',
  accentGradientLight: '#f5edc7',
  accentGradientDark: '#c2b25e',
  dark: '#000000',
  headerBg: 'rgba(255, 255, 255, 0.9)',
  headerBgScroll: 'rgba(255, 255, 255, 0.95)',
  cardShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  heroOverlay: 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))',
  footerBg: '#F0F0F0',
};

const darkTheme = {
  text: '#FFFFFF',
  background: '#000000',
  cardBackground: '#1C1C1E',
  tint: '#e6d592',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#e6d592',
  accent: '#e6d592',
  lightAccent: '#F5EDC720',
  border: '#38383A',
  gray: '#AEAEB2',
  lightGray: '#8E8E93',
  primary: '#000000',
  secondary: '#1C1C1E',
  accentGradientLight: '#f5edc7',
  accentGradientDark: '#c2b25e',
  dark: '#FFFFFF',
  headerBg: 'rgba(0, 0, 0, 0.9)',
  headerBgScroll: 'rgba(0, 0, 0, 0.95)',
  cardShadow: '0 10px 30px rgba(255, 255, 255, 0.1)',
  heroOverlay: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',
  footerBg: '#1C1C1E',
};

// Hook to get theme-aware colors
export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

// Keep static export for backward compatibility (but recommend migrating)
const Colors = lightTheme;
export default Colors;