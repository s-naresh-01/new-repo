import React from 'react';
import {View, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {useAppDispatch, useAppSelector} from '../../store';
import {setThemeMode, setAccentColor} from '../../store/slices/settingsSlice';
import {ThemeMode} from '../../types';
import {ACCENT_COLORS} from '../../theme/colors';

const THEME_OPTIONS: {mode: ThemeMode; label: string; icon: string}[] = [
  {mode: 'light', label: 'Light', icon: 'white-balance-sunny'},
  {mode: 'dark', label: 'Dark', icon: 'weather-night'},
  {mode: 'system', label: 'System', icon: 'theme-light-dark'},
];

const ThemeScreen: React.FC = () => {
  const {theme} = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(s => s.settings);

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Theme</Text>
      </View>

      <Text style={[styles.sectionLabel, {color: theme.colors.taskComplete}]}>MODE</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.mode}
            style={[
              styles.themeCard,
              {
                backgroundColor:
                  settings.themeMode === opt.mode
                    ? `${theme.colors.primary}22`
                    : theme.colors.surface,
                borderColor:
                  settings.themeMode === opt.mode
                    ? theme.colors.primary
                    : theme.colors.divider,
              },
            ]}
            onPress={() => dispatch(setThemeMode(opt.mode))}>
            <Icon
              name={opt.icon}
              size={28}
              color={
                settings.themeMode === opt.mode
                  ? theme.colors.primary
                  : theme.colors.taskComplete
              }
            />
            <Text
              style={[
                styles.themeLabel,
                {
                  color:
                    settings.themeMode === opt.mode
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                },
              ]}>
              {opt.label}
            </Text>
            {settings.themeMode === opt.mode && (
              <Icon name="check-circle" size={16} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, {color: theme.colors.taskComplete}]}>
        ACCENT COLOR
      </Text>
      <View style={styles.colorGrid}>
        {Object.entries(ACCENT_COLORS).map(([name, color]) => (
          <TouchableOpacity
            key={name}
            style={[
              styles.colorSwatch,
              {backgroundColor: color},
              settings.accentColor === color && styles.colorSwatchSelected,
            ]}
            onPress={() => dispatch(setAccentColor(color))}>
            {settings.accentColor === color && (
              <Icon name="check" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.preview, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.previewTitle, {color: theme.colors.onSurface}]}>
          Preview
        </Text>
        <View style={styles.previewTask}>
          <View style={[styles.previewCheck, {borderColor: settings.accentColor}]} />
          <Text style={[styles.previewTaskText, {color: theme.colors.onSurface}]}>
            Sample task item
          </Text>
        </View>
        <View style={styles.previewTask}>
          <View
            style={[
              styles.previewCheck,
              {backgroundColor: theme.colors.taskComplete, borderColor: theme.colors.taskComplete},
            ]}
          />
          <Text
            style={[
              styles.previewTaskText,
              {color: theme.colors.taskComplete, textDecorationLine: 'line-through'},
            ]}>
            Completed task
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {fontSize: 22, fontWeight: '700'},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    letterSpacing: 0.5,
  },
  themeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
  },
  themeLabel: {fontSize: 13, fontWeight: '500'},
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  preview: {
    margin: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  previewTitle: {fontSize: 14, fontWeight: '600', marginBottom: 12},
  previewTask: {flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12},
  previewCheck: {width: 22, height: 22, borderRadius: 11, borderWidth: 2},
  previewTaskText: {fontSize: 15},
});

export default ThemeScreen;
