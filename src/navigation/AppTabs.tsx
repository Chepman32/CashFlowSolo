import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { Text, useColorScheme } from 'react-native';
import Dashboard from '../screens/Dashboard';
import Envelopes from '../screens/Envelopes';
import Transactions from '../screens/Transactions';
import Challenges from '../screens/Challenges';
import Settings from '../screens/Settings';

export type RootTabParamList = {
  Dashboard: undefined;
  Envelopes: undefined;
  Transactions: undefined;
  Challenges: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function Icon({ name, focused }: { name: string; focused: boolean }) {
  return <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.7 }}>{name}</Text>;
}

export default function AppTabs() {
  enableScreens(true);
  const isDark = useColorScheme() === 'dark';
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={{ headerShown: false, tabBarLabelStyle: { fontSize: 12 } }}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} options={{ tabBarIcon: ({ focused }) => <Icon name="🏠" focused={focused} /> }} />
        <Tab.Screen name="Envelopes" component={Envelopes as any} options={{ tabBarIcon: ({ focused }) => <Icon name="✉️" focused={focused} /> }} />
        <Tab.Screen name="Transactions" component={Transactions} options={{ tabBarIcon: ({ focused }) => <Icon name="📋" focused={focused} /> }} />
        <Tab.Screen name="Challenges" component={Challenges} options={{ tabBarIcon: ({ focused }) => <Icon name="🏆" focused={focused} /> }} />
        <Tab.Screen name="Settings" component={Settings} options={{ tabBarIcon: ({ focused }) => <Icon name="⚙️" focused={focused} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
