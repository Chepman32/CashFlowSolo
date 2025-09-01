import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import currencyService, { type CurrencyCode } from '../services/currencyService';

interface CurrencyDisplayProps extends TextProps {
  amount: number;
  currency: CurrencyCode;
  showBaseCurrency?: boolean;
  showSymbol?: boolean;
}

export default function CurrencyDisplay({ 
  amount, 
  currency, 
  showBaseCurrency = false, 
  showSymbol = true,
  style,
  ...props 
}: CurrencyDisplayProps) {
  const baseCurrency = useAppStore(s => s.settings.base_currency) as CurrencyCode;
  
  // Format the amount in its original currency
  const formattedAmount = currencyService.formatCurrency(amount, currency);
  
  // If showing base currency and it's different, convert and show both
  if (showBaseCurrency && currency !== baseCurrency) {
    const convertedAmount = currencyService.convertAmount(amount, currency, baseCurrency);
    const baseFormatted = currencyService.formatCurrency(convertedAmount, baseCurrency);
    
    return (
      <Text style={style} {...props}>
        {showSymbol ? formattedAmount : formattedAmount.replace(/[^\d.-]/g, '')} 
        <Text style={{ opacity: 0.6 }}> ({baseFormatted})</Text>
      </Text>
    );
  }
  
  // Just show the original amount
  return (
    <Text style={style} {...props}>
      {showSymbol ? formattedAmount : formattedAmount.replace(/[^\d.-]/g, '')}
    </Text>
  );
}
