import React from 'react';
import {View, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../hooks/useTheme';
import MainTabNavigator from './MainTabNavigator';
import AllTasksScreen from '../screens/tasks/AllTasksScreen';
import ListDetailScreen from '../screens/lists/ListDetailScreen';
import ListsScreen from '../screens/lists/ListsScreen';
import HabitsScreen from '../screens/habits/HabitsScreen';
import FocusScreen from '../screens/focus/FocusScreen';
import MatrixScreen from '../screens/eisenhower/MatrixScreen';
import StatsScreen from '../screens/stats/StatsScreen';
import TimelineScreen from '../screens/calendar/TimelineScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ThemeScreen from '../screens/settings/ThemeScreen';
import CalendarSyncScreen from '../screens/settings/CalendarSyncScreen';

const Drawer = createDrawerNavigator();

const NAV_ITEMS = [
  {name: 'MainTabs', label: 'Home', icon: 'home-outline'},
  {name: 'AllTasks', label: 'All Tasks', icon: 'format-list-bulleted'},
  {name: 'Lists', label: 'Lists', icon: 'view-list-outline'},
  {name: 'Habits', label: 'Habits', icon: 'calendar-check-outline'},
  {name: 'Focus', label: 'Focus', icon: 'timer-outline'},
  {name: 'Matrix', label: 'Priority Matrix', icon: 'grid-large'},
  {name: 'Timeline', label: 'Timeline', icon: 'timeline-outline'},
  {name: 'Statistics', label: 'Statistics', icon: 'chart-bar'},
  {name: 'Settings', label: 'Settings', icon: 'cog-outline'},
];

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const {theme} = useTheme();
  const {state, navigation} = props;
  const currentRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.drawer, {backgroundColor: theme.colors.sidebarBackground}]}>
      <View style={[styles.drawerHeader, {borderBottomColor: theme.colors.divider}]}>
        <View style={[styles.logo, {backgroundColor: theme.colors.primary}]}>
          <Text style={styles.logoText}>✓</Text>
        </View>
        <Text style={[styles.drawerTitle, {color: theme.colors.onSurface}]}>
          TickTick
        </Text>
      </View>
      <ScrollView style={styles.drawerItems}>
        {NAV_ITEMS.map(item => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.drawerItem,
                isActive && {backgroundColor: `${theme.colors.primary}18`},
              ]}
              onPress={() => navigation.navigate(item.name)}>
              <Icon
                name={item.icon}
                size={22}
                color={isActive ? theme.colors.primary : theme.colors.taskComplete}
              />
              <Text
                style={[
                  styles.drawerItemText,
                  {color: isActive ? theme.colors.primary : theme.colors.onSurface},
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const DrawerNavigator: React.FC = () => {
  const {theme} = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: theme.colors.sidebarBackground,
          width: 280,
        },
      }}>
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
      <Drawer.Screen name="AllTasks" component={AllTasksScreen} />
      <Drawer.Screen name="Lists" component={ListsScreen} />
      <Drawer.Screen name="ListDetail" component={ListDetailScreen} />
      <Drawer.Screen name="Habits" component={HabitsScreen} />
      <Drawer.Screen name="Focus" component={FocusScreen} />
      <Drawer.Screen name="Matrix" component={MatrixScreen} />
      <Drawer.Screen name="Timeline" component={TimelineScreen} />
      <Drawer.Screen name="Statistics" component={StatsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Theme" component={ThemeScreen} />
      <Drawer.Screen name="CalendarSync" component={CalendarSyncScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawer: {flex: 1},
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {fontSize: 20, color: '#FFF'},
  drawerTitle: {fontSize: 20, fontWeight: '700'},
  drawerItems: {flex: 1, paddingTop: 8},
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 1,
    gap: 14,
  },
  drawerItemText: {fontSize: 15, fontWeight: '500'},
});

export default DrawerNavigator;
