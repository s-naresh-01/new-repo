import {useColorScheme} from 'react-native';
import {useAppSelector} from '../store';
import {lightTheme, darkTheme} from '../theme';

export const useTheme = () => {
  const themeMode = useAppSelector(s => s.settings.themeMode);
  const systemScheme = useColorScheme();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  return {
    theme: isDark ? darkTheme : lightTheme,
    isDark,
  };
};
