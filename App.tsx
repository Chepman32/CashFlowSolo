import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';
import AppTabs from './src/navigation/AppTabs';
import { hydrateFromDB, seedIfEmpty } from './src/store/persistence';
import { useAppStore } from './src/store/useAppStore';
import Onboarding from './src/screens/Onboarding';

function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = useMemo(() => (isDark ? 'dark' : 'light'), [isDark]);
  const [booted, setBooted] = useState(false);
  const setHydrated = useAppStore.setState;
  const accounts = useAppStore(s => s.accounts);
  const envelopes = useAppStore(s => s.envelopes);

  useEffect(() => {
    (async () => {
      try {
        await seedIfEmpty();
        const data = await hydrateFromDB();
        if (data.settings) {
          setHydrated({
            settings: data.settings,
            accounts: data.accounts,
            envelopes: data.envelopes,
            transactions: data.transactions,
            savings_challenges: data.savings_challenges,
          });
        }
      } catch (e) {
        // noop: falls back to in-memory defaults
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? colors.dark.background : colors.light.background },
        ]}
        edges={['top']}
      >
        {!booted ? (
          <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}> 
            <ActivityIndicator />
            <Text style={{ marginTop: 8, color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }}>Preparing your data…</Text>
          </View>
        ) : accounts.length === 0 || envelopes.length === 0 ? (
          <Onboarding onDone={() => { /* after onboarding, state updates trigger tabs */ }} />
        ) : (
          <View style={styles.container}>
            <AppTabs />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});

export default App;
