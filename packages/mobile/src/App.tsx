import React from 'react';
import {StatusBar, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import LibraryScreen from './screens/LibraryScreen';
import ReaderScreen from './screens/ReaderScreen';
import SettingsScreen from './screens/SettingsScreen';
import {ErrorBoundary} from './components';
import {colors} from './theme';

export type RootStackParamList = {
  Main: undefined;
  Reader: {
    text: string;
    title?: string;
    bookId?: string;
    chapterIndex?: number;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({name, focused}: {name: string; focused: boolean}) {
  const icons: Record<string, string> = {
    Home: focused ? '⚡' : '◇',
    Library: focused ? '📚' : '📖',
    Settings: focused ? '⚙️' : '○',
  };
  return <Text>{icons[name] || '•'}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
        },
        headerTintColor: colors.text,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Fast Reader'}}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{title: 'Library'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.background}
          />
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: colors.accent,
                background: colors.background,
                card: colors.backgroundSecondary,
                text: colors.text,
                border: colors.border,
                notification: colors.accent,
              },
            }}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: {backgroundColor: colors.background},
              }}>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="Reader"
                component={ReaderScreen}
                options={{
                  animation: 'fade',
                  gestureEnabled: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;
