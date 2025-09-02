import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
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

function Icon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return <Feather name={name as any} size={20} color={color} />;
}

export default function AppTabs() {
  enableScreens(true);
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  const activeColor = isDark ? '#14B8A6' : '#14B8A6';
  const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarLabel: t('tabs.dashboard'),
            tabBarIcon: ({ focused, color }) => <Icon name="home" focused={focused} color={color} />
          }}
        />
        <Tab.Screen
          name="Envelopes"
          component={Envelopes as any}
          options={{
            tabBarLabel: t('tabs.envelopes'),
            tabBarIcon: ({ focused, color }) => <Icon name="mail" focused={focused} color={color} />
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={Transactions}
          options={{
            tabBarLabel: t('tabs.transactions'),
            tabBarIcon: ({ focused, color }) => <Icon name="list" focused={focused} color={color} />
          }}
        />
        <Tab.Screen
          name="Challenges"
          component={Challenges}
          options={{
            tabBarLabel: t('tabs.challenges'),
            tabBarIcon: ({ focused, color }) => <Icon name="award" focused={focused} color={color} />
          }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            tabBarLabel: t('tabs.settings'),
            tabBarIcon: ({ focused, color }) => <Icon name="settings" focused={focused} color={color} />
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
