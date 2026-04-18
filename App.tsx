import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './src/store';
import {useTheme} from './src/hooks/useTheme';
import RootNavigator from './src/navigation/RootNavigator';

const AppContent: React.FC = () => {
  const {theme} = useTheme();
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <RootNavigator />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <AppContent />
    </ReduxProvider>
  );
};

export default App;
