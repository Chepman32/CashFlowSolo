import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppTabs from './src/navigation/AppTabs';
import { hydrateFromDB, seedIfEmpty } from './src/store/persistence';
import { useAppStore } from './src/store/useAppStore';
import Onboarding from './src/screens/Onboarding';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import './src/i18n';
import i18n from './src/i18n';

function InnerApp() {
  const { isDark, colors: palette } = useAppTheme();
  const [booted, setBooted] = useState(false);
  const setHydrated = useAppStore.setState;
  const accounts = useAppStore(s => s.accounts);
  const envelopes = useAppStore(s => s.envelopes);

  const initializeApp = useCallback(async () => {
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
        if ((data.settings as any).language) {
          try { i18n.changeLanguage((data.settings as any).language); } catch {}
        }
      }
    } catch (e) {
      // noop: falls back to in-memory defaults
    } finally {
      setBooted(true);
    }
  }, [setHydrated]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: palette.background },
        ]}
        edges={['top']}
      >
        {!booted ? (
          <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}> 
            <ActivityIndicator />
            <Text style={{ marginTop: 8, color: palette.textSecondary }}>Preparing your data…</Text>
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

function App() {
  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});

export default App;
