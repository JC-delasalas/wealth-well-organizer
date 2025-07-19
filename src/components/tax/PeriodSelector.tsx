// Period Selector Component for Tax Calculators
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CalendarDays, 
  Info,
  TrendingUp
} from 'lucide-react';
import { PeriodType } from '@/hooks/usePhilippineTax';
import { useCurrencyFormatter } from '@/hooks/useCurrency';

interface PeriodSelectorProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  className?: string;
  showConversionExample?: boolean;
  exampleAmount?: number;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onPeriodChange,
  className = '',
  showConversionExample = true,
  exampleAmount = 50000
}) => {
  const { standard: formatCurrency } = useCurrencyFormatter();

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Period Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Income Period</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={period === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('monthly')}
                className={period === 'monthly' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300 text-blue-700 hover:bg-blue-100'}
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                Monthly
              </Button>
              <Button
                variant={period === 'annual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('annual')}
                className={period === 'annual' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300 text-blue-700 hover:bg-blue-100'}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Annual
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-blue-700">
            {period === 'monthly' ? (
              <>
                <strong>Monthly Mode:</strong> Enter your monthly income amounts. 
                The calculator will automatically multiply by 12 for annual tax calculations.
              </>
            ) : (
              <>
                <strong>Annual Mode:</strong> Enter your total annual income amounts 
                for the entire tax year.
              </>
            )}
          </div>

          {/* Conversion Example */}
          {showConversionExample && (
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Example Conversion</span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                {period === 'monthly' ? (
                  <>
                    <div className="flex justify-between">
                      <span>Monthly Input:</span>
                      <span className="font-medium">{formatCurrency(exampleAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Equivalent:</span>
                      <span className="font-medium">{formatCurrency(exampleAmount * 12)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Annual Input:</span>
                      <span className="font-medium">{formatCurrency(exampleAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Equivalent:</span>
                      <span className="font-medium">{formatCurrency(exampleAmount / 12)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* BIR Compliance Note */}
          <div className="flex items-start gap-2 text-xs text-blue-600">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              All tax calculations are computed on an annual basis for BIR compliance, 
              regardless of your input period preference.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for input labels
interface PeriodAwareLabelProps {
  period: PeriodType;
  baseLabel: string;
  children?: React.ReactNode;
}

export const PeriodAwareLabel: React.FC<PeriodAwareLabelProps> = ({
  period,
  baseLabel,
  children
}) => {
  const periodPrefix = period === 'monthly' ? 'Monthly' : 'Annual';
  
  return (
    <div className="flex items-center justify-between">
      <span>{periodPrefix} {baseLabel}</span>
      {children}
    </div>
  );
};

// Helper component for input placeholders and help text
interface PeriodAwareInputProps {
  period: PeriodType;
  baseAmount?: number;
  formatCurrency: (amount: number) => string;
}

export const getPeriodAwarePlaceholder = ({ 
  period, 
  baseAmount = 50000, 
  formatCurrency 
}: PeriodAwareInputProps): string => {
  const amount = period === 'monthly' ? baseAmount : baseAmount * 12;
  return formatCurrency(amount);
};

export const getPeriodAwareHelpText = (
  period: PeriodType,
  baseText: string,
  monthlyExample?: string,
  annualExample?: string
): string => {
  const periodText = period === 'monthly' ? 'monthly' : 'annual';
  const example = period === 'monthly' ? monthlyExample : annualExample;
  
  return `${baseText} (${periodText}${example ? `, e.g., ${example}` : ''})`;
};

// Conversion display component
interface ConversionDisplayProps {
  period: PeriodType;
  amount: number;
  formatCurrency: (amount: number) => string;
  label?: string;
}

export const ConversionDisplay: React.FC<ConversionDisplayProps> = ({
  period,
  amount,
  formatCurrency,
  label = 'Equivalent'
}) => {
  if (!amount || amount === 0) return null;

  const convertedAmount = period === 'monthly' ? amount * 12 : amount / 12;
  const convertedPeriod = period === 'monthly' ? 'Annual' : 'Monthly';

  return (
    <div className="text-xs text-muted-foreground">
      {convertedPeriod} {label}: {formatCurrency(convertedAmount)}
    </div>
  );
};

// Period indicator badge
interface PeriodBadgeProps {
  period: PeriodType;
  className?: string;
}

export const PeriodBadge: React.FC<PeriodBadgeProps> = ({
  period,
  className = ''
}) => {
  return (
    <Badge 
      variant={period === 'monthly' ? 'default' : 'secondary'}
      className={`${period === 'monthly' ? 'bg-blue-600' : 'bg-green-600'} ${className}`}
    >
      {period === 'monthly' ? (
        <>
          <CalendarDays className="w-3 h-3 mr-1" />
          Monthly
        </>
      ) : (
        <>
          <TrendingUp className="w-3 h-3 mr-1" />
          Annual
        </>
      )}
    </Badge>
  );
};
