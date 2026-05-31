import { useColorScheme as useRNColorScheme } from 'react-native';
import { colors, ThemeColors } from '../theme';

export function useTheme(): { isDark: boolean; colors: ThemeColors } {
  const scheme = useRNColorScheme();
  const isDark = scheme === 'dark';
  return { isDark, colors: isDark ? colors.dark : colors.light };
}
