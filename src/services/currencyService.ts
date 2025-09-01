export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export interface LocalizedCurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  lastUpdated: string;
}

// Currency information
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
  },
};

// Mock exchange rates (in a real app, these would come from an API)
// Rates are relative to USD as base
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.85, // 1 USD = 0.85 EUR
  GBP: 0.73, // 1 USD = 0.73 GBP
};

export class CurrencyService {
  private static instance: CurrencyService;
  private rates: Map<string, number> = new Map();

  private constructor() {
    this.initializeRates();
  }

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private initializeRates() {
    // Initialize all possible currency pairs
    const currencies = Object.keys(CURRENCIES) as CurrencyCode[];
    currencies.forEach(from => {
      currencies.forEach(to => {
        if (from === to) {
          this.rates.set(`${from}-${to}`, 1.0);
        } else {
          // Convert through USD as base
          const fromToUSD = 1 / EXCHANGE_RATES[from];
          const usdToTo = EXCHANGE_RATES[to];
          this.rates.set(`${from}-${to}`, fromToUSD * usdToTo);
        }
      });
    });
  }

  getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
    const key = `${from}-${to}`;
    return this.rates.get(key) || 1.0;
  }

  convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return amount;
    const rate = this.getExchangeRate(from, to);
    return amount * rate;
  }

  getAvailableCurrencies(): CurrencyCode[] {
    return Object.keys(CURRENCIES) as CurrencyCode[];
  }

  getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
    return CURRENCIES[code];
  }

  getLocalizedCurrencyInfo(code: CurrencyCode, t: (key: string) => string): LocalizedCurrencyInfo {
    const baseInfo = CURRENCIES[code];
    return {
      ...baseInfo,
      name: t(`currency.${code.toLowerCase()}`),
    };
  }

  formatCurrency(amount: number, currency: CurrencyCode): string {
    const info = this.getCurrencyInfo(currency);
    const symbol = info.symbol;
    
    // Format with appropriate decimal places
    const formattedAmount = Math.abs(amount).toFixed(2);
    const sign = amount < 0 ? '-' : '';
    
    return `${sign}${symbol}${formattedAmount}`;
  }

  // Update exchange rates (in a real app, this would fetch from an API)
  async updateExchangeRates(): Promise<void> {
    // Simulate API call delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
    
    // For demo purposes, we'll just use the static rates
    // In a real app, you'd fetch current rates from a service like:
    // - https://exchangeratesapi.io/
    // - https://fixer.io/
    // - https://currencylayer.com/
    
    console.log('Exchange rates updated');
  }
}

export default CurrencyService.getInstance();
