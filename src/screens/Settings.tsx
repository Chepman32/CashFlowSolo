import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import currencyService, {
  CURRENCIES,
  type CurrencyCode,
} from '../services/currencyService';
import type { ThemeMode } from '../types';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'zh', label: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'pt', label: 'Portuguese (Brazilian)', native: 'Português' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
  { code: 'th', label: 'Thai', native: 'ไทย' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'pl', label: 'Polish', native: 'Polski' },
  { code: 'uk', label: 'Ukrainian', native: 'Українська' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'he', label: 'Hebrew', native: 'עברית' },
  { code: 'sv', label: 'Swedish', native: 'Svenska' },
  { code: 'no', label: 'Norwegian', native: 'Norsk' },
  { code: 'da', label: 'Danish', native: 'Dansk' },
  { code: 'fi', label: 'Finnish', native: 'Suomi' },
  { code: 'cs', label: 'Czech', native: 'Čeština' },
  { code: 'hu', label: 'Hungarian', native: 'Magyar' },
  { code: 'ro', label: 'Romanian', native: 'Română' },
  { code: 'el', label: 'Greek', native: 'Ελληνικά' },
  { code: 'ms', label: 'Malay', native: 'Bahasa Melayu' },
  { code: 'fil', label: 'Filipino', native: 'Filipino' },
];

const THEMES: { mode: ThemeMode; labelKey: string }[] = [
  { mode: 'system', labelKey: 'theme.system' },
  { mode: 'light', labelKey: 'theme.light' },
  { mode: 'dark', labelKey: 'theme.dark' },
  { mode: 'solar', labelKey: 'theme.solar' },
  { mode: 'mono', labelKey: 'theme.mono' },
];

export default function Settings() {
  const { colors: theme } = useAppTheme();
  const settings = useAppStore(s => s.settings);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const updateSettings = useAppStore(s => s.updateSettings);
  const { t, i18n } = useTranslation();

  const currentLanguage =
    LANGUAGES.find(l => l.code === settings.language) || LANGUAGES[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16 }}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('settings.title')}
        </Text>

        {/* Base Currency */}
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {t('settings.base_currency')}
          </Text>
          <Pressable
            onPress={() => setShowCurrencyPicker(true)}
            style={styles.currencySelector}
          >
            <Text style={{ color: theme.textSecondary, marginRight: 8 }}>
              {CURRENCIES[settings.base_currency as CurrencyCode]?.flag}{' '}
              {settings.base_currency}
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              {t('symbols.dropdown')}
            </Text>
          </Pressable>
        </View>

        {/* Theme */}
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {t('settings.theme')}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {THEMES.map(({ mode, labelKey }) => (
            <Pressable
              key={mode}
              onPress={async () => updateSettings({ theme: mode })}
              style={[
                styles.chip,
                {
                  borderColor: theme.border,
                  backgroundColor:
                    settings.theme === mode
                      ? colors.light.primary
                      : 'transparent',
                },
              ]}
            >
              <Text
                style={{
                  color: settings.theme === mode ? 'white' : theme.textPrimary,
                  fontWeight: '700',
                }}
              >
                {t(labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sound */}
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {t('settings.sound')}
          </Text>
          <Switch
            value={settings.sound_enabled ?? true}
            onValueChange={async value => {
              await updateSettings({ sound_enabled: value });
            }}
          />
        </View>

        {/* Haptics */}
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {t('settings.haptics')}
          </Text>
          <Switch
            value={settings.haptics_enabled ?? true}
            onValueChange={async value => {
              await updateSettings({ haptics_enabled: value });
            }}
          />
        </View>

        {/* Language Accordion */}
        <Pressable
          style={[styles.row, { borderColor: theme.border }]}
          onPress={() => setLanguageExpanded(!languageExpanded)}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {t('settings.language')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: theme.textSecondary, marginRight: 8 }}>
              {currentLanguage.native}
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                transform: [{ rotate: languageExpanded ? '180deg' : '0deg' }],
              }}
            >
              {t('symbols.dropdown')}
            </Text>
          </View>
        </Pressable>

        {languageExpanded && (
          <View
            style={[
              styles.accordionContent,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {LANGUAGES.map(lang => (
              <Pressable
                key={lang.code}
                onPress={async () => {
                  // Change i18n language first for immediate UI update
                  await i18n.changeLanguage(lang.code);
                  // Then persist to store/database
                  await updateSettings({ language: lang.code });
                  setLanguageExpanded(false);
                }}
                style={[
                  styles.languageOption,
                  {
                    borderColor: theme.border,
                    backgroundColor:
                      settings.language === lang.code
                        ? colors.light.primary
                        : 'transparent',
                  },
                ]}
              >
                <View>
                  <Text
                    style={{
                      color:
                        settings.language === lang.code
                          ? 'white'
                          : theme.textPrimary,
                      fontWeight: '600',
                      fontSize: 15,
                    }}
                  >
                    {lang.native}
                  </Text>
                  <Text
                    style={{
                      color:
                        settings.language === lang.code
                          ? 'rgba(255,255,255,0.8)'
                          : theme.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    {lang.label}
                  </Text>
                </View>
                {settings.language === lang.code && (
                  <Text style={{ color: 'white', fontSize: 18 }}>
                    {t('symbols.checkmark')}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Currency Picker Modal */}
        <Modal
          visible={showCurrencyPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCurrencyPicker(false)}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {t('currency.selectBase')}
              </Text>
            </View>

            <ScrollView style={styles.currencyList}>
              {Object.values(CURRENCIES).map(currency => {
                const localizedCurrency =
                  currencyService.getLocalizedCurrencyInfo(currency.code, t);
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
                        backgroundColor:
                          settings.base_currency === currency.code
                            ? colors.light.primary
                            : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.currencyOptionContent}>
                      <Text style={{ fontSize: 24, marginRight: 12 }}>
                        {currency.flag}
                      </Text>
                      <View>
                        <Text
                          style={[
                            styles.currencyName,
                            {
                              color:
                                settings.base_currency === currency.code
                                  ? 'white'
                                  : theme.textPrimary,
                            },
                          ]}
                        >
                          {localizedCurrency.name}
                        </Text>
                        <Text
                          style={[
                            styles.currencyCode,
                            {
                              color:
                                settings.base_currency === currency.code
                                  ? 'rgba(255,255,255,0.8)'
                                  : theme.textSecondary,
                            },
                          ]}
                        >
                          {currency.code} ({currency.symbol})
                        </Text>
                      </View>
                    </View>
                    {settings.base_currency === currency.code && (
                      <Text style={{ color: 'white', fontSize: 20 }}>
                        {t('symbols.checkmark')}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>

        {/* Passcode */}
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {t('settings.passcode')}
          </Text>
          <Switch value={settings.passcode_enabled} onChange={() => {}} />
        </View>

        {/* Notifications */}
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {t('settings.notifications')}
          </Text>
          <Switch
            value={settings.notifications_enabled ?? true}
            onValueChange={async value => {
              await updateSettings({ notifications_enabled: value });
            }}
          />
        </View>
      </View>
    </ScrollView>
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
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
  accordionContent: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
