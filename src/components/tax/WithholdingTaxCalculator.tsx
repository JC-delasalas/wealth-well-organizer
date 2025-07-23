// Withholding Tax Calculator Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Receipt, 
  Calculator, 
  DollarSign, 
  Save,
  Download,
  Info,
  User,
  Building
} from 'lucide-react';
import { useWithholdingTax, useTaxCalculations } from '@/hooks/usePhilippineTax';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import {
  PeriodSelector,
  PeriodAwareLabel,
  getPeriodAwarePlaceholder,
  getPeriodAwareHelpText,
  ConversionDisplay,
  PeriodBadge
} from './PeriodSelector';

export const WithholdingTaxCalculator: React.FC = () => {
  const {
    withholdingInput,
    withholdingResult,
    period,
    updatePeriod,
    calculateTax,
    updateInput
  } = useWithholdingTax();
  
  const { saveCalculation, isSaving } = useTaxCalculations();
  const { standard: formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();

  const [calculationName, setCalculationName] = useState('');

  // Auto-calculate when inputs change
  useEffect(() => {
    if (withholdingInput.amount > 0) {
      calculateTax();
    }
  }, [withholdingInput, calculateTax]);

  // Handle save calculation
  const handleSaveCalculation = async () => {
    if (withholdingResult === null) return;

    try {
      await saveCalculation.mutateAsync({
        calculation_type: 'withholding_tax',
        tax_year: withholdingInput.taxYear,
        country_code: 'PH',
        currency: 'PHP',
        input_data: withholdingInput,
        gross_income: withholdingInput.amount,
        tax_due: withholdingResult,
        calculation_breakdown: {
          taxType: withholdingInput.taxType,
          isResident: withholdingInput.isResident,
          rate: getWithholdingRate()
        },
        calculation_name: calculationName || `Withholding Tax ${new Date().getFullYear()}`,
        is_saved: true,
        is_filed: false
      });
      
      setCalculationName('');
    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  };

  // Get withholding tax rate for display
  const getWithholdingRate = (): number => {
    const rates: Record<string, { resident: number; nonResident: number }> = {
      compensation: { resident: 0, nonResident: 0.25 },
      professional_fees: { resident: 0.10, nonResident: 0.25 },
      rental_income: { resident: 0.05, nonResident: 0.25 },
      interest_income: { resident: 0.20, nonResident: 0.25 },
      dividend_income: { resident: 0.10, nonResident: 0.25 }
    };

    return withholdingInput.isResident 
      ? rates[withholdingInput.taxType].resident 
      : rates[withholdingInput.taxType].nonResident;
  };

  // Get tax type description
  const getTaxTypeDescription = (taxType: string): string => {
    const descriptions: Record<string, string> = {
      compensation: 'Salaries, wages, and other compensation',
      professional_fees: 'Professional and technical services',
      rental_income: 'Rental payments for real property',
      interest_income: 'Interest from bank deposits and investments',
      dividend_income: 'Dividends from domestic corporations'
    };
    return descriptions[taxType] || '';
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sophisticated Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-finance-green-50/15">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-finance-green-100/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-blue-100/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-purple-100/6 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.01]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}></div>
      </div>

      <div className="relative space-y-8 p-6 lg:p-8">
        {/* Enhanced Period Selection */}
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl shadow-black/5"></div>
          <div className="relative p-2">
            <PeriodSelector
              period={period}
              onPeriodChange={updatePeriod}
              exampleAmount={50000}
            />
          </div>
        </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Income Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                <PeriodAwareLabel period={period} baseLabel="Income Amount">
                  <PeriodBadge period={period} />
                </PeriodAwareLabel>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder={getPeriodAwarePlaceholder({
                  period,
                  baseAmount: 50000,
                  formatCurrency
                })}
                value={withholdingInput.amount || ''}
                onChange={(e) => updateInput('amount', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {getPeriodAwareHelpText(
                  period,
                  'Gross amount before withholding tax',
                  '₱50,000/month',
                  '₱600,000/year'
                )}
              </p>
              <ConversionDisplay
                period={period}
                amount={withholdingInput.amount}
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxType">Income Type</Label>
              <Select 
                value={withholdingInput.taxType} 
                onValueChange={(value: any) => updateInput('taxType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compensation">
                    <div className="flex flex-col items-start">
                      <span>Compensation</span>
                      <span className="text-xs text-muted-foreground">Salaries, wages, bonuses</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="professional_fees">
                    <div className="flex flex-col items-start">
                      <span>Professional Fees</span>
                      <span className="text-xs text-muted-foreground">Professional and technical services</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rental_income">
                    <div className="flex flex-col items-start">
                      <span>Rental Income</span>
                      <span className="text-xs text-muted-foreground">Real property rental payments</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="interest_income">
                    <div className="flex flex-col items-start">
                      <span>Interest Income</span>
                      <span className="text-xs text-muted-foreground">Bank deposits, investments</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dividend_income">
                    <div className="flex flex-col items-start">
                      <span>Dividend Income</span>
                      <span className="text-xs text-muted-foreground">Corporate dividends</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getTaxTypeDescription(withholdingInput.taxType)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxYear">Tax Year</Label>
              <Select 
                value={withholdingInput.taxYear.toString()} 
                onValueChange={(value) => updateInput('taxYear', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Taxpayer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Taxpayer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isResident">Resident Taxpayer</Label>
                  <p className="text-xs text-muted-foreground">
                    Philippine resident vs. non-resident alien
                  </p>
                </div>
                <Switch
                  id="isResident"
                  checked={withholdingInput.isResident}
                  onCheckedChange={(checked) => updateInput('isResident', checked)}
                />
              </div>
              
              <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  {withholdingInput.isResident ? (
                    <User className="w-4 h-4 text-green-600" />
                  ) : (
                    <Building className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="font-medium">
                    {withholdingInput.isResident ? 'Resident Taxpayer' : 'Non-Resident Alien'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {withholdingInput.isResident 
                    ? 'Philippine citizen or resident alien subject to regular tax rates'
                    : 'Non-resident alien subject to flat 25% withholding tax (except compensation)'
                  }
                </div>
              </div>
            </div>

            {/* Current Rate Display */}
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Current Withholding Rate</div>
              <div className="text-2xl font-bold text-primary">
                {(getWithholdingRate() * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                For {withholdingInput.isResident ? 'resident' : 'non-resident'} taxpayers
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => calculateTax()} 
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Withholding Tax
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {withholdingResult !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Withholding Tax Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">Gross Amount</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(withholdingInput.amount)}
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">Tax Rate</div>
                <div className="text-xl font-bold text-finance-green-600">
                  {(getWithholdingRate() * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">Withholding Tax</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(withholdingResult)}
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">Net Amount</div>
                <div className="text-xl font-bold text-finance-green-600">
                  {formatCurrency(withholdingInput.amount - withholdingResult)}
                </div>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-3">Calculation Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Income Type:</span>
                  <span className="font-medium capitalize">
                    {withholdingInput.taxType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxpayer Status:</span>
                  <span className="font-medium">
                    {withholdingInput.isResident ? 'Resident' : 'Non-Resident Alien'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Amount:</span>
                  <span className="font-medium">{formatCurrency(withholdingInput.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Withholding Rate:</span>
                  <span className="font-medium">{(getWithholdingRate() * 100).toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Withholding Tax:</span>
                  <span>{formatCurrency(withholdingResult)}</span>
                </div>
                <div className="flex justify-between font-semibold text-green-700">
                  <span>Net Amount Received:</span>
                  <span>{formatCurrency(withholdingInput.amount - withholdingResult)}</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-2">Important Notes:</p>
                  <ul className="text-amber-700 space-y-1 list-disc list-inside">
                    {withholdingInput.taxType === 'compensation' && (
                      <li>Compensation income is subject to graduated withholding tax rates, not flat rates</li>
                    )}
                    {withholdingInput.taxType === 'professional_fees' && (
                      <li>Professional fees are subject to creditable withholding tax</li>
                    )}
                    {withholdingInput.taxType === 'rental_income' && (
                      <li>Rental income withholding tax is creditable against annual income tax</li>
                    )}
                    <li>Withholding tax is generally creditable against your annual income tax liability</li>
                    <li>Always consult with a tax professional for complex situations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Save Calculation */}
            <Separator />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter calculation name (optional)"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSaveCalculation}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Quick Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                updateInput('amount', 50000);
                updateInput('taxType', 'professional_fees');
                updateInput('isResident', true);
              }}
            >
              <div className="font-medium">Professional Services</div>
              <div className="text-sm text-muted-foreground">₱50,000 professional fee</div>
              <Badge variant="secondary" className="mt-1">10% WHT</Badge>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                updateInput('amount', 25000);
                updateInput('taxType', 'rental_income');
                updateInput('isResident', true);
              }}
            >
              <div className="font-medium">Rental Income</div>
              <div className="text-sm text-muted-foreground">₱25,000 monthly rent</div>
              <Badge variant="secondary" className="mt-1">5% WHT</Badge>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                updateInput('amount', 100000);
                updateInput('taxType', 'interest_income');
                updateInput('isResident', true);
              }}
            >
              <div className="font-medium">Interest Income</div>
              <div className="text-sm text-muted-foreground">₱100,000 bank interest</div>
              <Badge variant="secondary" className="mt-1">20% WHT</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
