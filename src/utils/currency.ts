// Currency formatting and conversion utilities for multi-currency support
import { supabase } from '@/integrations/supabase/client';

// Supported currency configuration
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

export interface Country {
  code: string;
  name: string;
  defaultCurrency: string;
  taxSystem: string;
  isActive: boolean;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
  source: string;
}

// Cache for currencies and exchange rates
let currenciesCache: Currency[] | null = null;
let countriesCache: Country[] | null = null;
let exchangeRatesCache: Map<string, ExchangeRate> = new Map();
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all supported currencies
 */
export const getSupportedCurrencies = async (): Promise<Currency[]> => {
  // Check cache first
  if (currenciesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return currenciesCache;
  }

  try {
    const { data, error } = await supabase
      .from('supported_currencies')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (error) throw error;

    currenciesCache = data.map(curr => ({
      code: curr.code,
      name: curr.name,
      symbol: curr.symbol,
      decimalPlaces: curr.decimal_places,
      isActive: curr.is_active
    }));

    cacheTimestamp = Date.now();
    return currenciesCache;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    // Return default currencies if database fails
    return getDefaultCurrencies();
  }
};

/**
 * Get all supported countries
 */
export const getSupportedCountries = async (): Promise<Country[]> => {
  // Check cache first
  if (countriesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return countriesCache;
  }

  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    countriesCache = data.map(country => ({
      code: country.code,
      name: country.name,
      defaultCurrency: country.default_currency,
      taxSystem: country.tax_system,
      isActive: country.is_active
    }));

    return countriesCache;
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Return default countries if database fails
    return getDefaultCountries();
  }
};

/**
 * Get exchange rate between two currencies
 */
export const getExchangeRate = async (
  fromCurrency: string,
  toCurrency: string,
  date?: string
): Promise<number | null> => {
  // Same currency
  if (fromCurrency === toCurrency) {
    return 1.0;
  }

  const cacheKey = `${fromCurrency}-${toCurrency}-${date || 'latest'}`;
  
  // Check cache first
  if (exchangeRatesCache.has(cacheKey)) {
    const cached = exchangeRatesCache.get(cacheKey);
    if (cached && Date.now() - new Date(cached.rateDate).getTime() < CACHE_DURATION) {
      return cached.rate;
    }
  }

  try {
    const { data, error } = await supabase
      .rpc('get_exchange_rate', {
        from_curr: fromCurrency,
        to_curr: toCurrency,
        rate_date: date || new Date().toISOString().split('T')[0]
      });

    if (error) throw error;

    if (data) {
      // Cache the result
      exchangeRatesCache.set(cacheKey, {
        fromCurrency,
        toCurrency,
        rate: data,
        rateDate: date || new Date().toISOString(),
        source: 'database'
      });
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }
};

/**
 * Convert amount between currencies
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date?: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = await getExchangeRate(fromCurrency, toCurrency, date);
  if (rate === null) {
    console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
    return amount; // Return original amount if no rate available
  }

  return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
};

/**
 * Format currency amount with proper localization
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'PHP',
  locale: string = 'en-PH',
  options: Partial<Intl.NumberFormatOptions> = {}
): string => {
  try {
    // Validate and sanitize inputs
    if (typeof amount !== 'number' || isNaN(amount)) {
      return `${getCurrencySymbol(currencyCode)}0.00`;
    }

    // Ensure we have a valid locale with better validation
    let validLocale = 'en-US'; // Default fallback
    if (locale && typeof locale === 'string' && locale.trim()) {
      const trimmedLocale = locale.trim();
      // Basic locale format validation (language-country or language)
      if (/^[a-z]{2}(-[A-Z]{2})?$/.test(trimmedLocale)) {
        validLocale = trimmedLocale;
      } else {
        console.warn(`Invalid locale format "${locale}", using fallback en-US`);
      }
    }

    const validCurrencyCode = currencyCode && currencyCode.trim() ? currencyCode.trim() : 'PHP';

    // Get currency info
    const currency = getCurrencyInfo(validCurrencyCode);

    const formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: validCurrencyCode,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
      ...options
    };

    // Special handling for Philippine Peso
    if (validCurrencyCode === 'PHP') {
      // Use Filipino locale for proper formatting
      const formatter = new Intl.NumberFormat('fil-PH', formatOptions);
      return formatter.format(amount);
    }

    // Use provided locale or default, with multiple fallback layers
    try {
      const formatter = new Intl.NumberFormat(validLocale, formatOptions);
      return formatter.format(amount);
    } catch (localeError) {
      console.warn(`Invalid locale "${validLocale}", trying fallback locales`);

      // Try common fallback locales
      const fallbackLocales = ['en-US', 'en', 'en-GB'];
      for (const fallbackLocale of fallbackLocales) {
        try {
          const fallbackFormatter = new Intl.NumberFormat(fallbackLocale, formatOptions);
          return fallbackFormatter.format(amount);
        } catch (fallbackError) {
          console.warn(`Fallback locale "${fallbackLocale}" also failed`);
        }
      }

      // If all locales fail, throw to outer catch
      throw new Error(`All locale formatting attempts failed for locale: ${validLocale}`);
    }
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Enhanced fallback formatting
    const symbol = getCurrencySymbol(currencyCode);
    const formattedAmount = typeof amount === 'number' && !isNaN(amount)
      ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';
    return `${symbol}${formattedAmount}`;
  }
};

/**
 * Format currency amount with custom symbol placement
 */
export const formatCurrencyCustom = (
  amount: number,
  currencyCode: string = 'PHP',
  showSymbol: boolean = true,
  symbolPosition: 'before' | 'after' = 'before'
): string => {
  const currency = getCurrencyInfo(currencyCode);
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  });

  if (!showSymbol) {
    return formattedAmount;
  }

  const symbol = currency.symbol;
  return symbolPosition === 'before' 
    ? `${symbol}${formattedAmount}`
    : `${formattedAmount} ${symbol}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string, currencyCode: string = 'PHP'): number => {
  try {
    // Remove currency symbols and spaces
    const currency = getCurrencyInfo(currencyCode);
    let cleanString = currencyString
      .replace(currency.symbol, '')
      .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and minus

    const parsed = parseFloat(cleanString);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing currency:', error);
    return 0;
  }
};

/**
 * Get currency information
 */
export const getCurrencyInfo = (currencyCode: string): Currency => {
  const defaultCurrencies = getDefaultCurrencies();
  return defaultCurrencies.find(c => c.code === currencyCode) || defaultCurrencies[0];
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return getCurrencyInfo(currencyCode).symbol;
};

/**
 * Get country information
 */
export const getCountryInfo = (countryCode: string): Country | null => {
  const defaultCountries = getDefaultCountries();
  return defaultCountries.find(c => c.code === countryCode) || null;
};

/**
 * Get default currency for a country
 */
export const getDefaultCurrencyForCountry = (countryCode: string): string => {
  const country = getCountryInfo(countryCode);
  return country?.defaultCurrency || 'USD';
};

/**
 * Default currencies (fallback when database is unavailable)
 */
const getDefaultCurrencies = (): Currency[] => [
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2, isActive: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, isActive: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0, isActive: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, isActive: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2, isActive: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2, isActive: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2, isActive: true },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2, isActive: true },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2, isActive: true }
];

/**
 * Default countries (fallback when database is unavailable)
 */
const getDefaultCountries = (): Country[] => [
  { code: 'PH', name: 'Philippines', defaultCurrency: 'PHP', taxSystem: 'BIR', isActive: true },
  { code: 'US', name: 'United States', defaultCurrency: 'USD', taxSystem: 'IRS', isActive: true },
  { code: 'GB', name: 'United Kingdom', defaultCurrency: 'GBP', taxSystem: 'HMRC', isActive: true },
  { code: 'AU', name: 'Australia', defaultCurrency: 'AUD', taxSystem: 'ATO', isActive: true },
  { code: 'CA', name: 'Canada', defaultCurrency: 'CAD', taxSystem: 'CRA', isActive: true },
  { code: 'SG', name: 'Singapore', defaultCurrency: 'SGD', taxSystem: 'IRAS', isActive: true },
  { code: 'HK', name: 'Hong Kong', defaultCurrency: 'HKD', taxSystem: 'IRD', isActive: true },
  { code: 'JP', name: 'Japan', defaultCurrency: 'JPY', taxSystem: 'NTA', isActive: true },
  { code: 'DE', name: 'Germany', defaultCurrency: 'EUR', taxSystem: 'BMF', isActive: true },
  { code: 'FR', name: 'France', defaultCurrency: 'EUR', taxSystem: 'DGFiP', isActive: true }
];

/**
 * Clear currency cache (useful for testing or forced refresh)
 */
export const clearCurrencyCache = (): void => {
  currenciesCache = null;
  countriesCache = null;
  exchangeRatesCache.clear();
  cacheTimestamp = 0;
};

/**
 * Philippine-specific currency formatting
 */
export const formatPhilippinePeso = (amount: number): string => {
  return formatCurrency(amount, 'PHP', 'fil-PH');
};

/**
 * Check if currency code is valid
 */
export const isValidCurrencyCode = (code: string): boolean => {
  const defaultCurrencies = getDefaultCurrencies();
  return defaultCurrencies.some(c => c.code === code);
};

/**
 * Check if country code is valid
 */
export const isValidCountryCode = (code: string): boolean => {
  const defaultCountries = getDefaultCountries();
  return defaultCountries.some(c => c.code === code);
};
