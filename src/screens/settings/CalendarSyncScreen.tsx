import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import {Text, Button, Switch} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../hooks/useTheme';
import {useAppDispatch, useAppSelector} from '../../store';
import {setCalendarSyncEnabled} from '../../store/slices/settingsSlice';
import {listCalendars, fullSync} from '../../services/googleCalendar';
import {database, listsCollection} from '../../database';
import {triggerManualSync} from '../../services/syncManager';

const CalendarSyncScreen: React.FC = () => {
  const {theme} = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(s => s.settings);
  const auth = useAppSelector(s => s.auth);

  const [googleCalendars, setGoogleCalendars] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (auth.isSignedIn) loadCalendars();
    listsCollection.query().fetch().then(setLists);
  }, [auth.isSignedIn]);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      const cals = await listCalendars();
      setGoogleCalendars(cals);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const linkListToCalendar = async (listId: string, calendarId: string) => {
    const now = Date.now();
    await database.write(async () => {
      const list = await listsCollection.find(listId);
      await list.update(l => {
        l.googleCalendarId = calendarId;
        l.updatedAt = now;
      });
    });
    const updated = await listsCollection.query().fetch();
    setLists(updated);
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      await triggerManualSync();
      Alert.alert('Sync complete', 'Your tasks and calendar are now in sync.');
    } catch (e: any) {
      Alert.alert('Sync failed', e.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>
          Google Calendar Sync
        </Text>
      </View>

      <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.syncRow}>
          <View style={styles.syncInfo}>
            <Text style={[styles.syncTitle, {color: theme.colors.onSurface}]}>
              Enable sync
            </Text>
            <Text style={[styles.syncSub, {color: theme.colors.taskComplete}]}>
              Two-way sync every {settings.calendarSyncInterval} minutes
            </Text>
          </View>
          <Switch
            value={settings.calendarSyncEnabled}
            onValueChange={v => dispatch(setCalendarSyncEnabled(v))}
            trackColor={{true: theme.colors.primary}}
          />
        </View>

        {settings.calendarSyncEnabled && (
          <Button
            mode="outlined"
            onPress={handleManualSync}
            loading={syncing}
            style={styles.syncBtn}
            icon="sync">
            Sync Now
          </Button>
        )}
      </View>

      {!auth.isSignedIn ? (
        <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.noAccount, {color: theme.colors.taskComplete}]}>
            Sign in with Google to enable calendar sync.
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionLabel, {color: theme.colors.taskComplete}]}>
            LINK LISTS TO CALENDARS
          </Text>

          {loading ? (
            <ActivityIndicator
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : (
            lists.map(list => {
              const linkedCal = googleCalendars.find(c => c.id === list.googleCalendarId);
              return (
                <View
                  key={list.id}
                  style={[styles.listRow, {borderBottomColor: theme.colors.divider}]}>
                  <View style={[styles.listDot, {backgroundColor: list.color}]} />
                  <View style={styles.listInfo}>
                    <Text style={[styles.listName, {color: theme.colors.onSurface}]}>
                      {list.name}
                    </Text>
                    <Text style={[styles.linkedCal, {color: theme.colors.taskComplete}]}>
                      {linkedCal ? `→ ${linkedCal.summary}` : 'Not linked'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (googleCalendars.length === 0) {
                        Alert.alert('No calendars', 'No Google Calendars found.');
                        return;
                      }
                      Alert.alert(
                        'Link to Calendar',
                        'Choose a Google Calendar:',
                        [
                          ...googleCalendars.map(cal => ({
                            text: cal.summary,
                            onPress: () => linkListToCalendar(list.id, cal.id),
                          })),
                          {text: 'Unlink', onPress: () => linkListToCalendar(list.id, '')},
                          {text: 'Cancel', style: 'cancel'},
                        ],
                      );
                    }}>
                    <Icon name="link-variant" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </>
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
  card: {margin: 16, padding: 16, borderRadius: 12},
  syncRow: {flexDirection: 'row', alignItems: 'center'},
  syncInfo: {flex: 1},
  syncTitle: {fontSize: 15, fontWeight: '500'},
  syncSub: {fontSize: 12, marginTop: 2},
  syncBtn: {marginTop: 12},
  noAccount: {textAlign: 'center', padding: 8},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    letterSpacing: 0.5,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listDot: {width: 14, height: 14, borderRadius: 7, marginRight: 12},
  listInfo: {flex: 1},
  listName: {fontSize: 15},
  linkedCal: {fontSize: 12, marginTop: 2},
  loader: {padding: 20},
});

export default CalendarSyncScreen;
