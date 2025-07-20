// React hooks for currency management and formatting
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getSupportedCurrencies, 
  getSupportedCountries, 
  getExchangeRate,
  convertCurrency,
  formatCurrency,
  getCurrencyInfo,
  getDefaultCurrencyForCountry,
  type Currency,
  type Country
} from '@/utils/currency';
import type { UserProfile } from '@/types';

/**
 * Hook for managing user's currency preferences
 */
export const useCurrency = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's profile with currency preferences
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get supported currencies
  const { data: currencies = [], isLoading: currenciesLoading } = useQuery({
    queryKey: ['supported-currencies'],
    queryFn: getSupportedCurrencies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get supported countries
  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ['supported-countries'],
    queryFn: getSupportedCountries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user currency preferences
  const updateCurrencyPreferences = useMutation({
    mutationFn: async (preferences: { 
      country?: string; 
      currency?: string; 
      locale?: string; 
      timezone?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(preferences)
        .eq('id', user.id);

      if (error) throw error;
      return preferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      toast({
        title: "Preferences Updated",
        description: "Your currency preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating preferences",
        description: error.message || "Failed to update currency preferences.",
        variant: "destructive",
      });
    },
  });

  // Get user's current currency with proper validation
  const userCurrency = userProfile?.currency && userProfile.currency.trim() ? userProfile.currency.trim() : 'PHP';
  const userCountry = userProfile?.country && userProfile.country.trim() ? userProfile.country.trim() : 'PH';
  const userLocale = userProfile?.locale && userProfile.locale.trim() ? userProfile.locale.trim() : 'en-PH';

  // Format currency with user's preferences
  const formatUserCurrency = useCallback((
    amount: number,
    options?: Partial<Intl.NumberFormatOptions>
  ): string => {
    return formatCurrency(amount, userCurrency, userLocale, options);
  }, [userCurrency, userLocale]);

  // Convert amount to user's currency
  const convertToUserCurrency = useCallback(async (
    amount: number,
    fromCurrency: string
  ): Promise<number> => {
    if (fromCurrency === userCurrency) return amount;
    return await convertCurrency(amount, fromCurrency, userCurrency);
  }, [userCurrency]);

  // Get currency info for user's currency
  const userCurrencyInfo = getCurrencyInfo(userCurrency);

  return {
    // Data
    userProfile,
    currencies,
    countries,
    userCurrency,
    userCountry,
    userLocale,
    userCurrencyInfo,

    // Loading states
    isLoading: profileLoading || currenciesLoading || countriesLoading,
    profileLoading,
    currenciesLoading,
    countriesLoading,

    // Actions
    updateCurrencyPreferences,
    isUpdating: updateCurrencyPreferences.isPending,

    // Utilities
    formatUserCurrency,
    convertToUserCurrency,
  };
};

/**
 * Hook for currency conversion and exchange rates
 */
export const useExchangeRates = () => {
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('PHP');
  const [amount, setAmount] = useState<number>(1);

  // Get exchange rate
  const { data: exchangeRate, isLoading: rateLoading } = useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency],
    queryFn: () => getExchangeRate(fromCurrency, toCurrency),
    enabled: fromCurrency !== toCurrency,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate converted amount
  const convertedAmount = exchangeRate ? amount * exchangeRate : amount;

  // Convert specific amount
  const convertAmount = useCallback(async (
    inputAmount: number,
    from: string,
    to: string
  ): Promise<number> => {
    return await convertCurrency(inputAmount, from, to);
  }, []);

  return {
    // State
    fromCurrency,
    toCurrency,
    amount,
    exchangeRate,
    convertedAmount,

    // Actions
    setFromCurrency,
    setToCurrency,
    setAmount,
    convertAmount,

    // Loading
    isLoading: rateLoading,
  };
};

/**
 * Hook for currency formatting utilities
 */
export const useCurrencyFormatter = () => {
  const { userCurrency, userLocale } = useCurrency();

  // Format currency with different options
  const formatters = {
    // Standard currency formatting
    standard: useCallback((amount: number, currency?: string) => {
      return formatCurrency(amount, currency || userCurrency, userLocale);
    }, [userCurrency, userLocale]),

    // Compact formatting (e.g., ₱1.2K, ₱1.5M)
    compact: useCallback((amount: number, currency?: string) => {
      return formatCurrency(amount, currency || userCurrency, userLocale, {
        notation: 'compact',
        compactDisplay: 'short'
      });
    }, [userCurrency, userLocale]),

    // No decimal places
    integer: useCallback((amount: number, currency?: string) => {
      return formatCurrency(amount, currency || userCurrency, userLocale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }, [userCurrency, userLocale]),

    // Accounting format (negative in parentheses)
    accounting: useCallback((amount: number, currency?: string) => {
      return formatCurrency(amount, currency || userCurrency, userLocale, {
        currencySign: 'accounting'
      });
    }, [userCurrency, userLocale]),

    // No currency symbol, just number
    number: useCallback((amount: number) => {
      try {
        const validLocale = userLocale && userLocale.trim() ? userLocale.trim() : 'en-US';
        return new Intl.NumberFormat(validLocale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
      } catch (error) {
        console.warn('Error formatting number, using fallback:', error);
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
      }
    }, [userLocale]),
  };

  return formatters;
};

/**
 * Hook for country-based currency selection
 */
export const useCountryCurrency = () => {
  const { countries } = useCurrency();

  // Get default currency for a country
  const getCountryDefaultCurrency = useCallback((countryCode: string): string => {
    const country = countries.find(c => c.code === countryCode);
    return country?.default_currency || getDefaultCurrencyForCountry(countryCode);
  }, [countries]);

  // Get country info
  const getCountryInfo = useCallback((countryCode: string): Country | undefined => {
    return countries.find(c => c.code === countryCode);
  }, [countries]);

  // Get countries by currency
  const getCountriesByCurrency = useCallback((currencyCode: string): Country[] => {
    return countries.filter(c => c.default_currency === currencyCode);
  }, [countries]);

  return {
    countries,
    getCountryDefaultCurrency,
    getCountryInfo,
    getCountriesByCurrency,
  };
};
