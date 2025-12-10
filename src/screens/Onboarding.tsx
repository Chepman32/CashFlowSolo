import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  useColorScheme,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  ImageSourcePropType,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { CURRENCIES, type CurrencyCode } from '../services/currencyService';
import { useDeviceOrientation } from '../utils/device';

const { width, height } = Dimensions.get('window');

const onboardingImages = {
  secure: require('../assets/images/onboarding/Secure.png'),
  free: require('../assets/images/onboarding/Free.png'),
  fast: require('../assets/images/onboarding/Fast.png'),
  languages: require('../assets/images/onboarding/Languages.png'),
};

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const [page, setPage] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [budgetThreshold, setBudgetThreshold] = useState(500);
  const scrollRef = useRef<ScrollView>(null);

  const addAccount = useAppStore(s => s.addAccount);
  const addEnvelope = useAppStore(s => s.addEnvelope);
  const updateSettings = useAppStore(s => s.updateSettings);

  const totalPages = 7;

  function next() {
    const p = Math.min(totalPages - 1, page + 1);
    setPage(p);
    scrollRef.current?.scrollTo({ x: p * width, animated: true });
  }

  function back() {
    const p = Math.max(0, page - 1);
    setPage(p);
    scrollRef.current?.scrollTo({ x: p * width, animated: true });
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / width);
    if (newPage !== page && newPage >= 0 && newPage <= totalPages - 1) {
      setPage(newPage);
    }
  }

  async function finish() {
    const now = new Date().toISOString();
    await updateSettings({
      base_currency: currency,
      default_budget: budgetThreshold,
    });
    await addAccount({
      id: `acc-${Date.now()}`,
      name: t('onboarding.defaultAccountName'),
      icon: '💵',
      initial_balance: 0,
      created_at: now,
    });
    await addEnvelope({
      id: `env-${Date.now()}`,
      name: t('onboarding.defaultEnvelopeName'),
      icon: '🛒',
      color: colors.accents[0],
      budgeted_amount: budgetThreshold,
      budget_interval: 'monthly',
      created_at: now,
    });
    onDone();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        <VisualSlide image={onboardingImages.secure} />
        <VisualSlide image={onboardingImages.free} />
        <VisualSlide image={onboardingImages.fast} />
        <VisualSlide image={onboardingImages.languages} />
        <CurrencyPage currency={currency} onSelect={setCurrency} />
        <BudgetThresholdPage
          budget={budgetThreshold}
          onChangeBudget={setBudgetThreshold}
          currency={currency}
        />
        <GetStartedPage onFinish={finish} />
      </ScrollView>

      <View style={styles.dotsContainer}>
        <Dots count={totalPages} index={page} />
      </View>

      <Footer
        page={page}
        totalPages={totalPages}
        onBack={back}
        onNext={next}
        theme={theme}
      />
    </View>
  );
}

function VisualSlide({ image }: { image: ImageSourcePropType }) {
  return (
    <View style={[styles.visualSlide, { width }]}>
      <Image source={image} style={styles.visualImage} resizeMode="contain" />
    </View>
  );
}

function Page({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const { isTablet } = useDeviceOrientation();
  return (
    <View style={[styles.page, { width }]}>
      <Text
        style={[
          styles.title,
          { color: theme.textPrimary },
          isTablet && styles.titleTablet,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.body,
          { color: theme.textSecondary },
          isTablet && styles.bodyTablet,
        ]}
      >
        {body}
      </Text>
      <View style={{ marginTop: isTablet ? 24 : 16 }}>{children}</View>
    </View>
  );
}

function CurrencyPage({
  currency,
  onSelect,
}: {
  currency: CurrencyCode;
  onSelect: (c: CurrencyCode) => void;
}) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const { isTablet } = useDeviceOrientation();

  return (
    <View style={[styles.page, { width }]}>
      <Text
        style={[
          styles.title,
          { color: theme.textPrimary },
          isTablet && styles.titleTablet,
        ]}
      >
        {t('onboarding.baseCurrency')}
      </Text>
      <Text
        style={[
          styles.body,
          { color: theme.textSecondary },
          isTablet && styles.bodyTablet,
        ]}
      >
        {t('onboarding.baseCurrencyBody')}
      </Text>
      <View style={{ marginTop: isTablet ? 24 : 16, gap: isTablet ? 12 : 8 }}>
        {Object.values(CURRENCIES).map(currencyInfo => {
          const localizedCurrency = {
            name: t(`currency.${currencyInfo.code.toLowerCase()}`),
            code: currencyInfo.code,
            symbol: currencyInfo.symbol,
            flag: currencyInfo.flag,
          };
          const isSelected = currency === currencyInfo.code;
          return (
            <Pressable
              key={currencyInfo.code}
              onPress={() => onSelect(currencyInfo.code)}
              style={[
                styles.row,
                isTablet && styles.rowTablet,
                {
                  borderColor: theme.border,
                  backgroundColor: isSelected
                    ? colors.light.primary
                    : 'transparent',
                },
              ]}
            >
              <Text
                style={{
                  color: isSelected ? 'white' : theme.textPrimary,
                  fontWeight: '700',
                  fontSize: isTablet ? 18 : 14,
                }}
              >
                {currencyInfo.flag} {localizedCurrency.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BudgetThresholdPage({
  budget,
  onChangeBudget,
  currency,
}: {
  budget: number;
  onChangeBudget: (b: number) => void;
  currency: CurrencyCode;
}) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const { isTablet } = useDeviceOrientation();
  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  const presetAmounts = [100, 250, 500, 1000, 2000];

  return (
    <View style={[styles.page, { width }]}>
      <Text
        style={[
          styles.title,
          { color: theme.textPrimary },
          isTablet && styles.titleTablet,
        ]}
      >
        {t('onboarding.budgetThreshold')}
      </Text>
      <Text
        style={[
          styles.body,
          { color: theme.textSecondary },
          isTablet && styles.bodyTablet,
        ]}
      >
        {t('onboarding.budgetThresholdBody')}
      </Text>
      <View style={{ marginTop: isTablet ? 24 : 16, alignItems: 'center' }}>
        <View
          style={[styles.budgetInputContainer, { borderColor: theme.border }]}
        >
          <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>
            {currencySymbol}
          </Text>
          <TextInput
            style={[styles.budgetInput, { color: theme.textPrimary }]}
            value={budget.toString()}
            onChangeText={text => {
              const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(num)) {
                onChangeBudget(num);
              } else if (text === '') {
                onChangeBudget(0);
              }
            }}
            keyboardType="numeric"
            placeholder="500"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        <View style={styles.presetContainer}>
          {presetAmounts.map(amount => (
            <Pressable
              key={amount}
              onPress={() => onChangeBudget(amount)}
              style={[
                styles.presetButton,
                {
                  borderColor: theme.border,
                  backgroundColor:
                    budget === amount ? colors.light.primary : 'transparent',
                },
                isTablet && styles.presetButtonTablet,
              ]}
            >
              <Text
                style={{
                  color: budget === amount ? 'white' : theme.textPrimary,
                  fontWeight: '600',
                  fontSize: isTablet ? 16 : 14,
                }}
              >
                {currencySymbol}
                {amount}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function GetStartedPage({ onFinish }: { onFinish: () => void }) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const { isTablet } = useDeviceOrientation();

  return (
    <View style={[styles.page, { width }]}>
      <Text
        style={[
          styles.title,
          { color: theme.textPrimary },
          isTablet && styles.titleTablet,
        ]}
      >
        {t('onboarding.getStarted')}
      </Text>
      <Text
        style={[
          styles.body,
          { color: theme.textSecondary },
          isTablet && styles.bodyTablet,
        ]}
      >
        {t('onboarding.getStartedBody')}
      </Text>
      <View style={{ marginTop: isTablet ? 24 : 16 }}>
        <Pressable
          onPress={onFinish}
          style={[
            styles.button,
            { backgroundColor: colors.light.primary },
            isTablet && styles.buttonTablet,
          ]}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '800',
              fontSize: isTablet ? 20 : 14,
            }}
          >
            {t('onboarding.createBudget')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Dots({ count, index }: { count: number; index: number }) {
  const { isTablet } = useDeviceOrientation();
  const dotSize = isTablet ? 12 : 8;
  return (
    <View style={{ flexDirection: 'row', gap: isTablet ? 10 : 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: i === index ? colors.light.primary : '#CBD5E1',
          }}
        />
      ))}
    </View>
  );
}

function Footer({
  page,
  totalPages,
  onBack,
  onNext,
  theme,
}: {
  page: number;
  totalPages: number;
  onBack: () => void;
  onNext: () => void;
  theme: { border: string; textPrimary: string };
}) {
  const { t } = useTranslation();
  const { isTablet } = useDeviceOrientation();

  const buttonStyle = [
    styles.navButton,
    { borderColor: theme.border },
    isTablet && styles.navButtonTablet,
  ];
  const placeholderStyle = [
    styles.navButtonPlaceholder,
    isTablet && styles.navButtonPlaceholderTablet,
  ];
  const textStyle = {
    color: theme.textPrimary,
    fontWeight: '700' as const,
    fontSize: isTablet ? 18 : 14,
  };

  return (
    <View style={[styles.footer, isTablet && styles.footerTablet]}>
      {page > 0 ? (
        <Pressable onPress={onBack} style={buttonStyle}>
          <Text style={textStyle}>{t('common.back')}</Text>
        </Pressable>
      ) : (
        <View style={placeholderStyle} />
      )}
      {page < totalPages - 1 && (
        <Pressable onPress={onNext} style={buttonStyle}>
          <Text style={textStyle}>{t('onboarding.next')}</Text>
        </Pressable>
      )}
      {page === totalPages - 1 && <View style={placeholderStyle} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  visualSlide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualImage: {
    width: width,
    height: height,
  },
  page: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  body: { fontSize: 16, textAlign: 'center' },
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 70,
  },
  navButtonTablet: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 120,
  },
  navButtonPlaceholder: {
    minWidth: 70,
  },
  navButtonPlaceholderTablet: {
    minWidth: 120,
  },
  footerTablet: {
    bottom: 40,
    left: 40,
    right: 40,
  },
  row: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  rowTablet: {
    padding: 20,
    borderRadius: 16,
    minWidth: 280,
  },
  titleTablet: {
    fontSize: 36,
    marginBottom: 12,
  },
  bodyTablet: {
    fontSize: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonTablet: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 16,
    minWidth: 280,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
    minWidth: 200,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
  },
  budgetInput: {
    fontSize: 32,
    fontWeight: '800',
    minWidth: 120,
    textAlign: 'center',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 320,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  presetButtonTablet: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
});
