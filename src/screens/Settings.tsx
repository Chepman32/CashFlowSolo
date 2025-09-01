import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Modal, Pressable, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import Paywall from './Paywall';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import currencyService, { CURRENCIES, type CurrencyCode } from '../services/currencyService';

export default function Settings() {
  const { colors: theme } = useAppTheme();
  const settings = useAppStore(s => s.settings);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const updateSettings = useAppStore(s => s.updateSettings);
  const { t, i18n } = useTranslation();

  return (
    <View style={{ padding: 16 }}>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('settings.title')}</Text>

      <View style={[styles.row, { borderColor: theme.border }]}> 
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{t('settings.base_currency')}</Text>
        <Pressable onPress={() => setShowCurrencyPicker(true)} style={styles.currencySelector}>
          <Text style={{ color: theme.textSecondary, marginRight: 8 }}>
            {CURRENCIES[settings.base_currency as CurrencyCode]?.flag} {settings.base_currency}
          </Text>
          <Text style={{ color: theme.textSecondary }}>▼</Text>
        </Pressable>
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

      <Modal visible={showCurrencyPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCurrencyPicker(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t('currency.selectBase')}</Text>
          </View>
          
          <View style={styles.currencyList}>
            {Object.values(CURRENCIES).map(currency => {
              const localizedCurrency = currencyService.getLocalizedCurrencyInfo(currency.code, t);
              return (
                <Pressable
                  key={currency.code}
                  onPress={async () => {
                    if (currency.code !== settings.base_currency) {
                      await updateSettings({ base_currency: currency.code });
                    }
                    setShowCurrencyPicker(false);
                  }}
                  style={[
                    styles.currencyOption,
                    { 
                      borderColor: theme.border,
                      backgroundColor: settings.base_currency === currency.code ? colors.light.primary : 'transparent'
                    }
                  ]}
                >
                  <View style={styles.currencyOptionContent}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{currency.flag}</Text>
                    <View>
                      <Text style={[
                        styles.currencyName,
                        { color: settings.base_currency === currency.code ? 'white' : theme.textPrimary }
                      ]}>
                        {localizedCurrency.name}
                      </Text>
                      <Text style={[
                        styles.currencyCode,
                        { color: settings.base_currency === currency.code ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                      ]}>
                        {currency.code} ({currency.symbol})
                      </Text>
                    </View>
                  </View>
                  {settings.base_currency === currency.code && (
                    <Text style={{ color: 'white', fontSize: 20 }}>✓</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

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
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  currencyList: {
    padding: 20,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  currencyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '400',
  },
});
