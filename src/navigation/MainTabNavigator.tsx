import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../hooks/useTheme';
import TodayScreen from '../screens/tasks/TodayScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import InboxScreen from '../screens/tasks/InboxScreen';
import UpcomingScreen from '../screens/tasks/UpcomingScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  const {theme} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
          elevation: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.taskComplete,
        tabBarLabelStyle: {fontSize: 11},
      }}>
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar-month-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="inbox" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Upcoming"
        component={UpcomingScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="clock-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
