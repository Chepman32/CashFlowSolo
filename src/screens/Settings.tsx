import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Switch, Modal, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import Paywall from './Paywall';

export default function Settings() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const settings = useAppStore(s => s.settings);
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <View style={{ padding: 16 }}>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Base currency</Text>
        <Text style={{ color: theme.textSecondary }}>{settings.base_currency}</Text>
      </View>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Pro</Text>
        <Text style={{ color: theme.textSecondary }}>{settings.is_pro ? 'Enabled' : 'Free'}</Text>
      </View>
      {!settings.is_pro && (
        <Pressable onPress={() => setShowPaywall(true)} style={[styles.upgrade, { backgroundColor: colors.light.primary }]}> 
          <Text style={{ color: 'white', fontWeight: '800' }}>Upgrade to Pro</Text>
        </Pressable>
      )}

      <Modal visible={showPaywall} animationType="slide" onRequestClose={() => setShowPaywall(false)}>
        <Paywall onClose={() => setShowPaywall(false)} />
      </Modal>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Passcode</Text>
        <Switch value={settings.passcode_enabled} onChange={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upgrade: { marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
});
