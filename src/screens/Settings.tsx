import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Modal, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import Paywall from './Paywall';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { colors: theme } = useAppTheme();
  const settings = useAppStore(s => s.settings);
  const [showPaywall, setShowPaywall] = useState(false);
  const updateSettings = useAppStore(s => s.updateSettings);
  const { t, i18n } = useTranslation();

  return (
    <View style={{ padding: 16 }}>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('settings.title')}</Text>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{t('settings.base_currency')}</Text>
        <Text style={{ color: theme.textSecondary }}>{settings.base_currency}</Text>
      </View>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{t('settings.theme')}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {(['system','light','dark'] as const).map(mode => (
          <Pressable key={mode} onPress={async () => updateSettings({ theme: mode })} style={[styles.chip, { borderColor: theme.border, backgroundColor: settings.theme === mode ? colors.light.primary : 'transparent' }]}> 
            <Text style={{ color: settings.theme === mode ? 'white' : theme.textPrimary, fontWeight: '700' }}>{t(`theme.${mode}`)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{t('settings.language')}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {[
          { code: 'en', label: 'English' },
          { code: 'ru', label: 'Русский' },
          { code: 'es', label: 'Español' },
          { code: 'fr', label: 'Français' },
          { code: 'de', label: 'Deutsch' },
          { code: 'zh', label: '中文' },
          { code: 'ja', label: '日本語' },
        ].map(lang => (
          <Pressable key={lang.code} onPress={async () => { await updateSettings({ language: lang.code }); i18n.changeLanguage(lang.code); }} style={[styles.chip, { borderColor: theme.border, backgroundColor: (settings as any).language === lang.code ? colors.light.primary : 'transparent' }]}> 
            <Text style={{ color: (settings as any).language === lang.code ? 'white' : theme.textPrimary, fontWeight: '700' }}>{lang.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{t('settings.pro')}</Text>
        <Text style={{ color: theme.textSecondary }}>{settings.is_pro ? t('settings.enabled') : t('settings.free')}</Text>
      </View>
      {!settings.is_pro && (
        <Pressable onPress={() => setShowPaywall(true)} style={[styles.upgrade, { backgroundColor: colors.light.primary }]}> 
          <Text style={{ color: 'white', fontWeight: '800' }}>{t('settings.upgrade')}</Text>
        </Pressable>
      )}

      <Modal visible={showPaywall} animationType="slide" onRequestClose={() => setShowPaywall(false)}>
        <Paywall onClose={() => setShowPaywall(false)} />
      </Modal>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{t('settings.passcode')}</Text>
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
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
});
