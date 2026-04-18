import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, Switch} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useTheme} from '../../hooks/useTheme';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  setCalendarSyncEnabled,
  setNotificationsEnabled,
  setShowCompletedTasks,
} from '../../store/slices/settingsSlice';
import {signOut} from '../../store/slices/authSlice';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(s => s.settings);
  const auth = useAppSelector(s => s.auth);

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch {}
    dispatch(signOut());
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    onPress,
    right,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.row, {borderBottomColor: theme.colors.divider}]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={[styles.iconWrap, {backgroundColor: `${theme.colors.primary}22`}]}>
        <Icon name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, {color: theme.colors.onSurface}]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, {color: theme.colors.taskComplete}]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right || (onPress ? <Icon name="chevron-right" size={18} color={theme.colors.taskComplete} /> : null)}
    </TouchableOpacity>
  );

  const SectionHeader = ({title}: {title: string}) => (
    <Text style={[styles.sectionHeader, {color: theme.colors.taskComplete}]}>{title}</Text>
  );

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Settings</Text>
      </View>

      {auth.user && (
        <View style={[styles.profile, {backgroundColor: theme.colors.surface}]}>
          <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
            <Text style={styles.avatarText}>
              {auth.user.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View>
            <Text style={[styles.userName, {color: theme.colors.onSurface}]}>
              {auth.user.name}
            </Text>
            <Text style={[styles.userEmail, {color: theme.colors.taskComplete}]}>
              {auth.user.email}
            </Text>
          </View>
        </View>
      )}

      <SectionHeader title="APPEARANCE" />
      <SettingRow
        icon="palette-outline"
        title="Theme"
        subtitle="Light, dark, or system"
        onPress={() => navigation.navigate('Theme')}
      />

      <SectionHeader title="TASKS" />
      <SettingRow
        icon="eye-outline"
        title="Show completed tasks"
        right={
          <Switch
            value={settings.showCompletedTasks}
            onValueChange={v => { dispatch(setShowCompletedTasks(v)); }}
            trackColor={{true: theme.colors.primary}}
          />
        }
      />

      <SectionHeader title="NOTIFICATIONS" />
      <SettingRow
        icon="bell-outline"
        title="Enable notifications"
        right={
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={v => { dispatch(setNotificationsEnabled(v)); }}
            trackColor={{true: theme.colors.primary}}
          />
        }
      />

      <SectionHeader title="GOOGLE CALENDAR" />
      <SettingRow
        icon="google"
        title="Calendar sync"
        subtitle="Two-way sync with Google Calendar"
        onPress={() => navigation.navigate('CalendarSync')}
        right={
          <Switch
            value={settings.calendarSyncEnabled}
            onValueChange={v => { dispatch(setCalendarSyncEnabled(v)); }}
            trackColor={{true: theme.colors.primary}}
          />
        }
      />

      <SectionHeader title="FOCUS" />
      <SettingRow
        icon="timer-outline"
        title="Focus settings"
        subtitle={`Pomodoro: ${settings.pomodoroMinutes}m / Break: ${settings.shortBreakMinutes}m`}
        onPress={() => {}}
      />

      <SectionHeader title="ACCOUNT" />
      {auth.user ? (
        <SettingRow
          icon="logout"
          title="Sign out"
          onPress={handleSignOut}
        />
      ) : (
        <SettingRow
          icon="login"
          title="Sign in with Google"
          onPress={() => navigation.navigate('Auth')}
        />
      )}
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
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: '#FFF', fontSize: 20, fontWeight: '700'},
  userName: {fontSize: 16, fontWeight: '600'},
  userEmail: {fontSize: 13, marginTop: 2},
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowContent: {flex: 1},
  rowTitle: {fontSize: 15},
  rowSubtitle: {fontSize: 12, marginTop: 2},
});

export default SettingsScreen;
