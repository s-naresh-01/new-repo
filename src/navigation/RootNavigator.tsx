import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useAppSelector} from '../store';
import {setupNotifications} from '../services/notifications';
import {startSyncManager} from '../services/syncManager';
import {seedDatabaseIfNeeded} from '../utils/seedDatabase';
import SignInScreen from '../screens/auth/SignInScreen';
import DrawerNavigator from './DrawerNavigator';
import TaskEditScreen from '../screens/tasks/TaskEditScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';

const Stack = createStackNavigator();

const RootNavigator: React.FC = () => {
  const isSignedIn = useAppSelector(s => s.auth.isSignedIn);

  useEffect(() => {
    setupNotifications();
    startSyncManager();
    seedDatabaseIfNeeded();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isSignedIn ? (
          <Stack.Screen name="Auth" component={SignInScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{presentation: 'card'}}
            />
            <Stack.Screen
              name="TaskEdit"
              component={TaskEditScreen}
              options={{presentation: 'modal'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
