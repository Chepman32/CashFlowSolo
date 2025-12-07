import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Modal,
  Pressable,
  ScrollView,
  Image,
  ImageSourcePropType,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import currencyService, {
  CURRENCIES,
  type CurrencyCode,
} from '../services/currencyService';
import type { ThemeMode } from '../types';

const FLAGS: Record<string, ImageSourcePropType> = {
  en: require('../assets/flags/en.png'),
  zh: require('../assets/flags/zh.png'),
  ja: require('../assets/flags/ja.png'),
  ko: require('../assets/flags/ko.png'),
  de: require('../assets/flags/de.png'),
  fr: require('../assets/flags/fr.png'),
  es: require('../assets/flags/es.png'),
  pt: require('../assets/flags/pt-BR.png'),
  ar: require('../assets/flags/ar.png'),
  ru: require('../assets/flags/ru.png'),
  it: require('../assets/flags/it.png'),
  nl: require('../assets/flags/nl.png'),
  tr: require('../assets/flags/tr.png'),
  th: require('../assets/flags/th.png'),
  vi: require('../assets/flags/vi.png'),
  id: require('../assets/flags/id.png'),
  pl: require('../assets/flags/pl.png'),
  uk: require('../assets/flags/uk.png'),
  hi: require('../assets/flags/hi.png'),
  he: require('../assets/flags/he.png'),
  sv: require('../assets/flags/sv.png'),
  no: require('../assets/flags/no.png'),
  da: require('../assets/flags/da.png'),
  fi: require('../assets/flags/fi.png'),
  cs: require('../assets/flags/cs.png'),
  hu: require('../assets/flags/hu.png'),
  ro: require('../assets/flags/ro.png'),
  el: require('../assets/flags/el.png'),
  ms: require('../assets/flags/ms.png'),
  fil: require('../assets/flags/fil.png'),
};

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

const ACCORDION_HEIGHT = LANGUAGES.length * 60; // Approximate height per language item

export default function Settings() {
  const { colors: theme } = useAppTheme();
  const settings = useAppStore(s => s.settings);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const updateSettings = useAppStore(s => s.updateSettings);
  const { t, i18n } = useTranslation();

  // Check notification permission status on mount
  const checkNotificationPermission = async () => {
    try {
      const notifee = require('@notifee/react-native').default;
      const notifSettings = await notifee.getNotificationSettings();
      // AuthorizationStatus: -1 = NOT_DETERMINED, 0 = DENIED, 1 = AUTHORIZED, 2 = PROVISIONAL
      const isAuthorized =
        notifSettings.authorizationStatus === 1 ||
        notifSettings.authorizationStatus === 2;
      setNotificationsEnabled(isAuthorized);
      return notifSettings.authorizationStatus;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return -1;
    }
  };

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  // Animation for accordion
  const accordionHeight = useSharedValue(0);
  const accordionOpacity = useSharedValue(0);
  const arrowRotation = useSharedValue(0);

  useEffect(() => {
    accordionHeight.value = withTiming(
      languageExpanded ? ACCORDION_HEIGHT : 0,
      {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
    );
    accordionOpacity.value = withTiming(languageExpanded ? 1 : 0, {
      duration: 200,
    });
    arrowRotation.value = withTiming(languageExpanded ? 180 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageExpanded]);

  const accordionAnimStyle = useAnimatedStyle(() => ({
    maxHeight: accordionHeight.value,
    opacity: accordionOpacity.value,
    overflow: 'hidden',
  }));

  const arrowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

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
            {FLAGS[currentLanguage.code] && (
              <Image
                source={FLAGS[currentLanguage.code]}
                style={styles.flagIcon}
                resizeMode="cover"
              />
            )}
            <Text style={{ color: theme.textSecondary, marginRight: 8 }}>
              {currentLanguage.native}
            </Text>
            <Animated.Text
              style={[{ color: theme.textSecondary }, arrowAnimStyle]}
            >
              {t('symbols.dropdown')}
            </Animated.Text>
          </View>
        </Pressable>

        <Animated.View
          style={[
            styles.accordionContent,
            { backgroundColor: theme.surface, borderColor: theme.border },
            accordionAnimStyle,
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {FLAGS[lang.code] && (
                  <Image
                    source={FLAGS[lang.code]}
                    style={styles.flagIconLarge}
                    resizeMode="cover"
                  />
                )}
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
              </View>
              {settings.language === lang.code && (
                <Text style={{ color: 'white', fontSize: 18 }}>
                  {t('symbols.checkmark')}
                </Text>
              )}
            </Pressable>
          ))}
        </Animated.View>

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
            <View style={styles.swipeIndicator} />
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
            value={notificationsEnabled}
            onValueChange={async () => {
              try {
                const notifee = require('@notifee/react-native').default;
                const currentStatus = await checkNotificationPermission();

                // AuthorizationStatus: -1 = NOT_DETERMINED, 0 = DENIED, 1 = AUTHORIZED, 2 = PROVISIONAL
                if (currentStatus === -1) {
                  // Not determined - request permission (shows system prompt)
                  const newSettings = await notifee.requestPermission();
                  const granted =
                    newSettings.authorizationStatus === 1 ||
                    newSettings.authorizationStatus === 2;
                  setNotificationsEnabled(granted);

                  if (!granted) {
                    // Permission was denied
                    Alert.alert(
                      t('settings.notifications'),
                      Platform.OS === 'ios'
                        ? 'Notifications permission was denied. You can enable it in Settings.'
                        : 'Notifications permission was denied. You can enable it in app settings.',
                      [
                        { text: 'OK', style: 'cancel' },
                        {
                          text: 'Open Settings',
                          onPress: () => {
                            if (Platform.OS === 'ios') {
                              Linking.openURL('app-settings:');
                            } else {
                              Linking.openSettings();
                            }
                          },
                        },
                      ],
                    );
                  }
                } else if (currentStatus === 0) {
                  // Previously denied - must go to settings
                  Alert.alert(
                    t('settings.notifications'),
                    Platform.OS === 'ios'
                      ? 'Notifications are disabled. Please enable them in Settings.'
                      : 'Notifications are disabled. Please enable them in app settings.',
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: 'Open Settings',
                        onPress: () => {
                          if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                          } else {
                            Linking.openSettings();
                          }
                        },
                      },
                    ],
                  );
                } else {
                  // Already authorized - user wants to disable, must go to settings
                  Alert.alert(
                    t('settings.notifications'),
                    Platform.OS === 'ios'
                      ? 'To disable notifications, please go to Settings.'
                      : 'To disable notifications, please go to app settings.',
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: 'Open Settings',
                        onPress: () => {
                          if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                          } else {
                            Linking.openSettings();
                          }
                        },
                      },
                    ],
                  );
                }
              } catch (error) {
                console.error('Error handling notification permission:', error);
              }
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
    paddingTop: 12,
  },
  swipeIndicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 8,
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
  flagIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 10,
  },
  flagIconLarge: {
    width: 28,
    height: 28,
    marginRight: 12,
    borderRadius: 14,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 0.5,
  },
});
