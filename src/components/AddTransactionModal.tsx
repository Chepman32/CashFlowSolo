import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image, Alert, Platform, ActionSheetIOS } from 'react-native';
import { colors } from '../theme/colors';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
// Document picker loaded lazily to avoid bundler error if the package
// hasn't been installed yet. We'll prompt the user when missing.
import type { Attachment } from '../types';
import type { Envelope } from '../types';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import currencyService, { CURRENCIES, type CurrencyCode } from '../services/currencyService';
import { getTranslatedEnvelopeName } from '../utils/translationHelpers';

export default function AddTransactionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors: theme } = useAppTheme();
  const accounts = useAppStore(s => s.accounts);
  const envelopes = useAppStore(s => s.envelopes);
  const addTransaction = useAppStore(s => s.addTransaction);
  const { t } = useTranslation();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const defaultAccount = accounts[0]?.id;
  const [selectedEnvelope, setSelectedEnvelope] = useState<string | undefined>(undefined);
  const [phase, setPhase] = useState<'pick' | 'form'>('pick');
  const [query, setQuery] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (visible) {
      // Reset to picker view each time it opens
      setPhase('pick');
      setQuery('');
      setSelectedEnvelope(undefined);
      setAmount('');
      setNote('');
      setType('expense');
      setSelectedCurrency('USD');
      setAttachments([]);
    }
  }, [visible]);

  const defaultEnvelope = type !== 'income' ? (selectedEnvelope ?? envelopes[0]?.id) : selectedEnvelope;

  const canSave = useMemo(() => {
    const v = Number(amount);
    if (Number.isNaN(v)) return false;
    if (type !== 'income' && !defaultEnvelope) return false;
    return !!defaultAccount && v !== 0;
  }, [amount, type, defaultAccount, defaultEnvelope]);

  async function onSave() {
    if (!canSave || !defaultAccount) return;
    const v = Number(amount);
    const now = new Date().toISOString();
    
    // Get the base currency from settings
    const baseCurrency = useAppStore.getState().settings.base_currency as CurrencyCode;
    
    // Calculate exchange rate to base currency
    const exchangeRate = currencyService.getExchangeRate(selectedCurrency, baseCurrency);
    
    await addTransaction({
      id: `tx-${Date.now()}`,
      amount: type === 'expense' ? -Math.abs(v) : Math.abs(v),
      type,
      note: note || undefined,
      currency: selectedCurrency,
      exchange_rate_to_base: exchangeRate,
      date: now,
      created_at: now,
      // Attach envelope for expenses/transfers, and for income only if user picked one
      envelope_id: type === 'income' ? selectedEnvelope : defaultEnvelope,
      account_id: defaultAccount,
      attachments: attachments.length ? attachments : undefined,
    });
    onClose();
    setAmount('');
    setNote('');
    setType('expense');
    setSelectedCurrency('USD');
  }

  const headerTitle = phase === 'pick' ? t('picker.categoryPicker') : t('addTx.title');

  async function chooseAttachment(): Promise<Attachment[]> {
    if (Platform.OS === 'ios') {
      return new Promise(resolve => {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            title: t('addTx.attachments'),
            options: [t('common.cancel'), t('attachments.mediaLibrary'), t('attachments.files')],
            cancelButtonIndex: 0,
          },
          idx => {
            // Present picker after the ActionSheet finishes dismissing.
            const run = async () => {
              if (idx === 1) resolve(await pickFromMediaLibrary(t));
              else if (idx === 2) resolve(await pickFiles(false, t));
              else resolve([]);
            };
            setTimeout(run, 220);
          },
        );
      });
    }
    // Android (and others): simple alert chooser
    return new Promise(resolve => {
      Alert.alert(
        t('addTx.addAttachment'),
        t('addTx.chooseSource'),
        [
          { text: t('attachments.mediaLibrary'), onPress: async () => resolve(await pickFromMediaLibrary(t)) },
          { text: t('attachments.files'), onPress: async () => resolve(await pickFiles(false, t)) },
          { text: t('common.cancel'), style: 'cancel', onPress: () => resolve([]) },
        ],
        { cancelable: true },
      );
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      {/* A Modal renders outside the root tree. Wrap it in its own SafeAreaProvider
          so SafeAreaView receives correct insets on iOS notch devices. */}
      <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top','bottom']}> 
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{headerTitle}</Text>
          {phase === 'pick' && (
            <Pressable onPress={onClose} hitSlop={10} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ color: colors.light.primary, fontWeight: '700', fontSize: 16 }}>{t('common.cancel')}</Text>
            </Pressable>
          )}
        </View>
        {phase === 'pick' ? (
          <View style={[styles.card, { backgroundColor: theme.surface }]}> 
            <Text style={{ color: theme.textSecondary }}>{t('picker.type')}</Text>
            <View style={[styles.row, { marginTop: 8 }]}>
              {(['expense', 'income'] as const).map(txType => (
                <Chip key={txType} label={txType} active={type === txType} onPress={() => setType(txType)} borderColor={theme.border} />
              ))}
            </View>

            <View style={[styles.search, { backgroundColor: theme.surface, shadowColor: '#000' }]}> 
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('picker.search')}
                placeholderTextColor={theme.textSecondary}
                style={{ flex: 1, marginLeft: 8, color: theme.textPrimary }}
              />
            </View>

            <CategoryGrid
              type={type}
              query={query}
              envelopes={envelopes}
              onPick={id => { setSelectedEnvelope(id); setPhase('form'); }}
            />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.surface }]}> 
            {selectedEnvelope && (
              <Text style={{ color: theme.textSecondary, marginBottom: 6 }}>{`${t('common.category')}: ${envelopes.find(e => e.id === selectedEnvelope)?.name}`}</Text>
            )}
            <Text style={{ color: theme.textSecondary }}>{t('addTx.amount')}</Text>
            <View style={styles.amountRow}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.textPrimary, flex: 1 }]}
              />
              <Pressable 
                onPress={() => setShowCurrencyPicker(true)}
                style={[styles.currencyButton, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
                  {CURRENCIES[selectedCurrency].flag} {selectedCurrency}
                </Text>
              </Pressable>
            </View>

            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>{t('addTx.note')}</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={`${t('addTx.note')} (${t('common.optional')})`}
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.textPrimary }]}
            />

            <Text style={{ color: theme.textSecondary, marginTop: 12, marginBottom: 6 }}>{t('addTx.attachments')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
              <Pressable onPress={async () => { const items = await chooseAttachment(); if (items.length) setAttachments(prev => [...prev, ...items]); }} style={[styles.attachBtn]}> 
                <Feather name="paperclip" size={18} color={theme.textPrimary} />
                <Text style={{ marginLeft: 6, color: theme.textPrimary, fontWeight: '600' }}>{t('attachments.add')}</Text>
              </Pressable>
              {attachments.map(a => (
                <AttachmentChip key={a.id} a={a} onRemove={() => setAttachments(prev => prev.filter(x => x.id !== a.id))} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.footer}>
          <Pressable
            onPress={phase === 'pick' ? onClose : () => setPhase('pick')}
            style={[styles.button, styles.buttonLarge, { backgroundColor: theme.surface, borderColor: theme.border }]}
          > 
            <Text style={[styles.buttonLargeText, { color: theme.textPrimary, fontWeight: '800' }]}>{phase === 'pick' ? t('common.cancel') : t('common.back')}</Text>
          </Pressable>
          {phase === 'form' && (
            <Pressable disabled={!canSave} onPress={onSave} style={[styles.button, styles.buttonLarge, { backgroundColor: canSave ? colors.light.primary : '#94A3B8' }]}> 
              <Text style={[styles.buttonLargeText, { color: 'white', fontWeight: '800' }]}>{t('common.save')}</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
      </SafeAreaProvider>

      {/* Currency Picker Modal */}
      <Modal visible={showCurrencyPicker} animationType="slide" transparent>
        <View style={styles.currencyModalOverlay}>
          <View style={[styles.currencyModalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.currencyModalHeader}>
              <Text style={[styles.currencyModalTitle, { color: theme.textPrimary }]}>{t('addTx.selectCurrency')}</Text>
              <Pressable onPress={() => setShowCurrencyPicker(false)} style={styles.currencyModalClose}>
                <Text style={{ color: theme.textSecondary, fontSize: 24 }}>{t('symbols.close')}</Text>
              </Pressable>
            </View>
            
            <View style={styles.currencyModalList}>
              {Object.values(CURRENCIES).map(currency => (
                <Pressable
                  key={currency.code}
                  onPress={() => {
                    setSelectedCurrency(currency.code);
                    setShowCurrencyPicker(false);
                  }}
                  style={[
                    styles.currencyModalOption,
                    { 
                      borderColor: theme.border,
                      backgroundColor: selectedCurrency === currency.code ? colors.light.primary : 'transparent'
                    }
                  ]}
                >
                  <View style={styles.currencyModalOptionContent}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{currency.flag}</Text>
                    <View>
                      <Text style={[
                        styles.currencyModalOptionName,
                        { color: selectedCurrency === currency.code ? 'white' : theme.textPrimary }
                      ]}>
                        {currency.name}
                      </Text>
                      <Text style={[
                        styles.currencyModalOptionCode,
                        { color: selectedCurrency === currency.code ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                      ]}>
                        {currency.code} ({currency.symbol})
                      </Text>
                    </View>
                  </View>
                  {selectedCurrency === currency.code && (
                    <Text style={{ color: 'white', fontSize: 20 }}>{t('symbols.checkmark')}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  card: { padding: 16, borderRadius: 16 },
  input: {
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonLarge: { paddingVertical: 18, borderRadius: 16 },
  buttonLargeText: { fontSize: 18 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footer: { marginTop: 'auto', flexDirection: 'row', gap: 12 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  attachBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currencyButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, minWidth: 80, alignItems: 'center' },
  currencyModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  currencyModalContent: { width: '90%', maxHeight: '80%', borderRadius: 16, overflow: 'hidden' },
  currencyModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  currencyModalTitle: { fontSize: 20, fontWeight: '700' },
  currencyModalClose: { padding: 8 },
  currencyModalList: { padding: 20 },
  currencyModalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  currencyModalOptionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  currencyModalOptionName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  currencyModalOptionCode: { fontSize: 14, fontWeight: '400' },
});

function Chip({ label, active, onPress, borderColor }: { label: string; active: boolean; onPress: () => void; borderColor: string }) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[aStyle]}> 
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.96))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        style={[styles.chip, { backgroundColor: active ? colors.light.primary : 'transparent', borderColor }]}
      >
        <Text style={{ color: active ? 'white' : '#111827', fontWeight: '600' }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function CategoryTile({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
  const size = 92;
  return (
    <View style={{ width: '30%', marginBottom: 18, alignItems: 'center' }}>
      <Pressable onPress={onPress} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 32 }}>{icon}</Text>
      </Pressable>
      <Text style={{ marginTop: 8, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

const getSuggestedCategories = (t: (key: string) => string) => [
  { name: t('categories.transport'), icon: '🚗', color: '#22C55E' },
  { name: t('categories.education'), icon: '📚', color: '#A855F7' },
  { name: t('categories.gifts'), icon: '🎁', color: '#3B82F6' },
  { name: t('categories.entertainment'), icon: '🎬', color: '#F59E0B' },
  { name: t('categories.shopping'), icon: '🛍️', color: '#06B6D4' },
  { name: t('categories.subscriptions'), icon: '💳', color: '#8B5CF6' },
];

const getSuggestedIncomeCategories = (t: (key: string) => string) => [
  { name: t('categories.earnedIncome'), icon: '💼', color: '#22C55E' },
  { name: t('categories.profitIncome'), icon: '📈', color: '#10B981' },
  { name: t('categories.interestIncome'), icon: '🏦', color: '#3B82F6' },
  { name: t('categories.dividendIncome'), icon: '💸', color: '#60A5FA' },
  { name: t('categories.rentalIncome'), icon: '🏠', color: '#F59E0B' },
  { name: t('categories.capitalGains'), icon: '📊', color: '#A855F7' },
  { name: t('categories.royaltyIncome'), icon: '🎵', color: '#F97316' },
  { name: t('categories.licensingIncome'), icon: '🧾', color: '#0EA5E9' },
  { name: t('categories.portfolioIncome'), icon: '🧺', color: '#2DD4BF' },
];

function CategoryGrid({
  type,
  query,
  envelopes,
  onPick,
}: {
  type: 'expense' | 'income' | 'transfer';
  query: string;
  envelopes: Envelope[];
  onPick: (id: string) => void;
}) {
  const { t } = useTranslation();
  const q = query.trim().toLowerCase();
  const existingByName = new Map(
    envelopes.map(e => [e.name.trim().toLowerCase(), e]),
  );

  const tiles: Array<{ key: string; label: string; icon: string; color: string; id?: string; createIfNeeded?: boolean }> = [];

  // Show existing envelopes first
  envelopes
    .filter(e => e.name.toLowerCase().includes(q))
    .forEach(e => tiles.push({ key: e.id, id: e.id, label: getTranslatedEnvelopeName(e.name, t), icon: e.icon, color: e.color }));

  // Then suggested categories that aren't present yet
  const suggestions = type === 'income' ? getSuggestedIncomeCategories(t) : getSuggestedCategories(t);
  suggestions.filter(s => s.name.toLowerCase().includes(q)).forEach(s => {
    if (!existingByName.has(s.name.toLowerCase())) {
      tiles.push({ key: `suggest-${s.name}`, label: s.name, icon: s.icon, color: s.color, createIfNeeded: true });
    }
  });

  // Always include "Add New Category"
  tiles.push({ key: 'add-new', label: t('categories.newCategory'), icon: '📚', color: '#B45309', createIfNeeded: true });

  return (
    <View style={styles.grid}>
      {tiles.map(tile => (
        <CategoryTile
          key={tile.key}
          label={tile.label}
          icon={tile.icon}
          color={tile.color}
          onPress={async () => {
            if (tile.id) {
              onPick(tile.id);
              return;
            }
            // Create if needed
            const now = new Date().toISOString();
            const id = `env-${Date.now()}`;
            const isNewCategory = tile.label === t('categories.newCategory');
            await useAppStore.getState().addEnvelope({
              id,
              name: isNewCategory ? t('categories.newCategory') : tile.label,
              icon: isNewCategory ? '🗂️' : tile.icon,
              color: tile.color,
              budgeted_amount: 0,
              budget_interval: 'monthly',
              created_at: now,
            });
            onPick(id);
          }}
        />
      ))}
    </View>
  );
}

async function pickFiles(imagesOnly = false, t?: (key: string) => string) {
  // Load module lazily so the app still runs if it's not installed
  let DocumentPicker: any;
  let isCancelFn: ((e: any) => boolean) | undefined;
  let pickerTypes: any = undefined;
  try {
    const NAME = 'react-native-document' + '-picker';
    const mod = require(NAME);
    DocumentPicker = mod.default || mod;
    isCancelFn = mod.isCancel || DocumentPicker.isCancel;
    pickerTypes = mod.types || DocumentPicker.types;
  } catch (e) {
    Alert.alert(
      t ? t('attachments.attachmentPickerNotInstalled') : 'Attachment Picker Not Installed',
      t ? t('attachments.attachmentPickerNotInstalledBody') : 'Attachment picker not installed',
    );
    return [] as Attachment[];
  }

  try {
    // Some iOS versions can be picky about copyTo; cachesDirectory is safest
    const opts: any = { type: imagesOnly ? (pickerTypes?.images || pickerTypes?.image) : pickerTypes?.allFiles, copyTo: 'cachesDirectory' };
    const res: any[] = await DocumentPicker.pickMultiple(opts);
    return res.map((r: any) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: r.name ?? (t ? t('attachments.attachment') : 'Attachment'),
      uri: r.fileCopyUri ?? r.uri,
      mime: r.type ?? null,
      size: r.size ?? null,
    }));
  } catch (err: any) {
    if (isCancelFn && isCancelFn(err)) return [] as Attachment[];
    // Fallback to single-picker if multi not supported in some environments
    try {
      const r: any = await DocumentPicker.pick({ type: imagesOnly ? (pickerTypes?.images || pickerTypes?.image) : pickerTypes?.allFiles, copyTo: 'cachesDirectory' });
      const item: Attachment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: r.name ?? (t ? t('attachments.attachment') : 'Attachment'),
        uri: r.fileCopyUri ?? r.uri,
        mime: r.type ?? null,
        size: r.size ?? null,
      };
      return [item];
    } catch (err2: any) {
      if (isCancelFn && isCancelFn(err2)) return [] as Attachment[];
      Alert.alert(t ? t('attachments.unableToAttachFile') : 'Unable to attach file', err2?.message || err?.message || 'An unexpected error occurred while selecting a file.');
      return [] as Attachment[];
    }
  }
}

async function pickFromMediaLibrary(t?: (key: string) => string): Promise<Attachment[]> {
  return new Promise(resolve => {
    const options: any = {
      mediaType: 'photo',
      selectionLimit: 0,
      includeBase64: false,
      quality: 1,
      presentationStyle: 'fullScreen',
    };
    launchImageLibrary(options, (response: any) => {
      if (!response || response.didCancel) return resolve([]);
      if (response.errorCode) {
        // Permission denied or unavailable; inform and fall back to images-only Files picker
        if (response.errorMessage && t) {
          Alert.alert(t('attachments.photosAccess'), response.errorMessage);
        }
        pickFiles(true, t).then(resolve);
        return;
      }
      const assets: any[] = response.assets || [];
      resolve(
        assets.map(a => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: a.fileName || (t ? t('attachments.image') : 'Image'),
          uri: a.uri,
          mime: a.type || 'image/*',
          size: a.fileSize || null,
        })),
      );
    });
  });
}



function AttachmentChip({ a, onRemove }: { a: Attachment; onRemove: () => void }) {
  const ext = a.name.split('.').pop()?.toLowerCase();
  const isImage = (a.mime || '').startsWith('image/') || ['jpg','jpeg','png','gif','heic','webp'].includes(ext || '');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: '#CBD5E1', marginRight: 8 }}>
      {isImage ? (
        <Image source={{ uri: a.uri }} style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: '#E5E7EB' }} />
      ) : (
        <Feather name="file" size={18} color="#111827" />
      )}
      <Text numberOfLines={1} style={{ maxWidth: 140, marginLeft: 6 }}>{a.name}</Text>
      <Pressable onPress={onRemove} hitSlop={10} style={{ marginLeft: 6 }}>
        <Feather name="x" size={16} color="#6B7280" />
      </Pressable>
    </View>
  );
}
