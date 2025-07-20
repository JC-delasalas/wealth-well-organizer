// Country and Currency Selection Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, DollarSign, MapPin, Clock, Languages } from 'lucide-react';
import { useCurrency, useCountryCurrency } from '@/hooks/useCurrency';
import { formatCurrency, getCurrencyInfo } from '@/utils/currency';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CountryCurrencySelectorProps {
  onSave?: (preferences: {
    country: string;
    currency: string;
    locale: string;
    timezone: string;
  }) => void;
  showSaveButton?: boolean;
  className?: string;
}

export const CountryCurrencySelector: React.FC<CountryCurrencySelectorProps> = ({
  onSave,
  showSaveButton = true,
  className = ''
}) => {
  const { 
    userProfile, 
    currencies, 
    countries, 
    isLoading, 
    updateCurrencyPreferences,
    isUpdating 
  } = useCurrency();
  
  const { getCountryDefaultCurrency } = useCountryCurrency();

  // Local state for selections
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedLocale, setSelectedLocale] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('');

  // Initialize with user's current preferences
  useEffect(() => {
    if (userProfile) {
      setSelectedCountry(userProfile.country || 'PH');
      setSelectedCurrency(userProfile.currency || 'PHP');
      setSelectedLocale(userProfile.locale || 'en-PH');
      setSelectedTimezone(userProfile.timezone || 'Asia/Manila');
    }
  }, [userProfile]);

  // Auto-update currency when country changes
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    
    // Auto-select default currency for the country
    const defaultCurrency = getCountryDefaultCurrency(countryCode);
    setSelectedCurrency(defaultCurrency);

    // Auto-select locale and timezone based on country
    const localeMap: Record<string, string> = {
      'PH': 'en-PH',
      'US': 'en-US',
      'GB': 'en-GB',
      'AU': 'en-AU',
      'CA': 'en-CA',
      'SG': 'en-SG',
      'HK': 'en-HK',
      'JP': 'ja-JP',
      'DE': 'de-DE',
      'FR': 'fr-FR'
    };

    const timezoneMap: Record<string, string> = {
      'PH': 'Asia/Manila',
      'US': 'America/New_York',
      'GB': 'Europe/London',
      'AU': 'Australia/Sydney',
      'CA': 'America/Toronto',
      'SG': 'Asia/Singapore',
      'HK': 'Asia/Hong_Kong',
      'JP': 'Asia/Tokyo',
      'DE': 'Europe/Berlin',
      'FR': 'Europe/Paris'
    };

    setSelectedLocale(localeMap[countryCode] || 'en-US');
    setSelectedTimezone(timezoneMap[countryCode] || 'UTC');
  };

  // Save preferences
  const handleSave = async () => {
    const preferences = {
      country: selectedCountry,
      currency: selectedCurrency,
      locale: selectedLocale,
      timezone: selectedTimezone
    };

    if (onSave) {
      onSave(preferences);
    } else {
      await updateCurrencyPreferences.mutateAsync(preferences);
    }
  };

  // Get currency preview
  const getCurrencyPreview = (currencyCode: string) => {
    const currency = getCurrencyInfo(currencyCode);
    const sampleAmount = 1234.56;
    const validLocale = selectedLocale && selectedLocale.trim() ? selectedLocale.trim() : 'en-US';
    const formatted = formatCurrency(sampleAmount, currencyCode, validLocale);
    return { currency, formatted };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  const selectedCountryInfo = countries.find(c => c.code === selectedCountry);
  const currencyPreview = getCurrencyPreview(selectedCurrency);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Country & Currency Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <Label htmlFor="country" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Country
          </Label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{country.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {country.default_currency}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCountryInfo && (
            <div className="text-sm text-muted-foreground">
              Tax System: {selectedCountryInfo.tax_system}
            </div>
          )}
        </div>

        <Separator />

        {/* Currency Selection */}
        <div className="space-y-2">
          <Label htmlFor="currency" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Currency
          </Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select your currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{currency.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {currency.symbol}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Currency Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Preview:</div>
            <div className="text-lg font-semibold text-primary">
              {currencyPreview.formatted}
            </div>
            <div className="text-xs text-muted-foreground">
              Sample amount formatted in {currencyPreview.currency.name}
            </div>
          </div>
        </div>

        <Separator />

        {/* Locale Selection */}
        <div className="space-y-2">
          <Label htmlFor="locale" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Locale
          </Label>
          <Select value={selectedLocale} onValueChange={setSelectedLocale}>
            <SelectTrigger>
              <SelectValue placeholder="Select your locale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-PH">English (Philippines)</SelectItem>
              <SelectItem value="en-US">English (United States)</SelectItem>
              <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
              <SelectItem value="en-AU">English (Australia)</SelectItem>
              <SelectItem value="en-CA">English (Canada)</SelectItem>
              <SelectItem value="en-SG">English (Singapore)</SelectItem>
              <SelectItem value="en-HK">English (Hong Kong)</SelectItem>
              <SelectItem value="ja-JP">Japanese (Japan)</SelectItem>
              <SelectItem value="de-DE">German (Germany)</SelectItem>
              <SelectItem value="fr-FR">French (France)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-2">
          <Label htmlFor="timezone" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timezone
          </Label>
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Manila">Asia/Manila (Philippines)</SelectItem>
              <SelectItem value="America/New_York">America/New_York (US Eastern)</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los_Angeles (US Pacific)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (UK)</SelectItem>
              <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
              <SelectItem value="America/Toronto">America/Toronto (Canada)</SelectItem>
              <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
              <SelectItem value="Asia/Hong_Kong">Asia/Hong_Kong</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo (Japan)</SelectItem>
              <SelectItem value="Europe/Berlin">Europe/Berlin (Germany)</SelectItem>
              <SelectItem value="Europe/Paris">Europe/Paris (France)</SelectItem>
              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Current time: {(() => {
              try {
                const validLocale = selectedLocale && selectedLocale.trim() ? selectedLocale.trim() : 'en-US';
                const validTimezone = selectedTimezone && selectedTimezone.trim() ? selectedTimezone.trim() : 'UTC';
                return new Date().toLocaleString(validLocale, {
                  timeZone: validTimezone,
                  dateStyle: 'medium',
                  timeStyle: 'short'
                });
              } catch (error) {
                console.warn('Error formatting date with locale, using fallback:', error);
                return new Date().toLocaleString('en-US', {
                  timeZone: 'UTC',
                  dateStyle: 'medium',
                  timeStyle: 'short'
                });
              }
            })()}
          </div>
        </div>

        {/* Save Button */}
        {showSaveButton && (
          <>
            <Separator />
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </>
        )}

        {/* Philippine Tax System Notice */}
        {selectedCountry === 'PH' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 font-medium">
              <MapPin className="w-4 h-4" />
              Philippine Tax System
            </div>
            <div className="text-sm text-blue-700 mt-1">
              You'll have access to BIR tax calculators including ITR forms, withholding tax, 
              and income tax calculations based on current TRAIN Law provisions.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
