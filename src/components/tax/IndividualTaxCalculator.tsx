// Individual Income Tax Calculator Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Save,
  Download,
  Info
} from 'lucide-react';
import { useIndividualTax, useTaxCalculations } from '@/hooks/usePhilippineTax';
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

export const IndividualTaxCalculator: React.FC = () => {
  const {
    taxInput,
    taxResult,
    isCalculating,
    period,
    updatePeriod,
    calculateTax,
    updateInput,
    resetCalculation
  } = useIndividualTax();
  
  const { saveCalculation, isSaving } = useTaxCalculations();
  const { standard: formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();

  const [calculationName, setCalculationName] = useState('');

  // Auto-calculate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (taxInput.grossAnnualIncome > 0) {
        calculateTax();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [taxInput, calculateTax]);

  // Handle save calculation
  const handleSaveCalculation = async () => {
    if (!taxResult) return;

    try {
      await saveCalculation.mutateAsync({
        calculation_type: 'income_tax',
        tax_year: taxInput.taxYear,
        country_code: 'PH',
        currency: 'PHP',
        input_data: taxInput,
        gross_income: taxResult.grossIncome,
        taxable_income: taxResult.taxableIncome,
        tax_due: taxResult.taxDue,
        tax_withheld: taxResult.withholdingTax,
        tax_payable: taxResult.taxPayable,
        tax_refund: taxResult.taxRefund,
        calculation_breakdown: {
          breakdown: taxResult.breakdown,
          effectiveRate: taxResult.effectiveRate,
          marginalRate: taxResult.marginalRate
        },
        calculation_name: calculationName || `Income Tax ${new Date().getFullYear()}`,
        is_saved: true,
        is_filed: false
      });
      
      setCalculationName('');
    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <PeriodSelector
        period={period}
        onPeriodChange={updatePeriod}
        exampleAmount={50000}
      />

      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Income Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grossIncome">
                <PeriodAwareLabel period={period} baseLabel="Gross Income">
                  <PeriodBadge period={period} />
                </PeriodAwareLabel>
              </Label>
              <Input
                id="grossIncome"
                type="number"
                placeholder={getPeriodAwarePlaceholder({
                  period,
                  baseAmount: 50000,
                  formatCurrency
                })}
                value={taxInput.grossAnnualIncome || ''}
                onChange={(e) => updateInput('grossAnnualIncome', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {getPeriodAwareHelpText(
                  period,
                  'Total salary, wages, and other compensation before deductions',
                  '₱50,000/month',
                  '₱600,000/year'
                )}
              </p>
              <ConversionDisplay
                period={period}
                amount={taxInput.grossAnnualIncome}
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thirteenthMonth">
                <PeriodAwareLabel period={period} baseLabel="13th Month Pay & Bonuses" />
              </Label>
              <Input
                id="thirteenthMonth"
                type="number"
                placeholder={getPeriodAwarePlaceholder({
                  period,
                  baseAmount: 4167,
                  formatCurrency
                })}
                value={taxInput.thirteenthMonthPay || ''}
                onChange={(e) => updateInput('thirteenthMonthPay', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {getPeriodAwareHelpText(
                  period,
                  '13th month pay and other bonuses (up to ₱90,000 annual exempt)',
                  '₱4,167/month',
                  '₱50,000/year'
                )}
              </p>
              <ConversionDisplay
                period={period}
                amount={taxInput.thirteenthMonthPay}
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherBenefits">
                <PeriodAwareLabel period={period} baseLabel="Other Benefits" />
              </Label>
              <Input
                id="otherBenefits"
                type="number"
                placeholder={getPeriodAwarePlaceholder({
                  period,
                  baseAmount: 2000,
                  formatCurrency
                })}
                value={taxInput.otherBenefits || ''}
                onChange={(e) => updateInput('otherBenefits', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {getPeriodAwareHelpText(
                  period,
                  'Other taxable benefits and allowances',
                  '₱2,000/month',
                  '₱24,000/year'
                )}
              </p>
              <ConversionDisplay
                period={period}
                amount={taxInput.otherBenefits}
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxYear">Tax Year</Label>
              <Select 
                value={taxInput.taxYear.toString()} 
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

        {/* Deductions and Withholding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Deductions & Withholding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Deduction Type</Label>
              <Select 
                value={taxInput.deductionType} 
                onValueChange={(value: 'standard' | 'itemized') => updateInput('deductionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Deduction (₱90,000)</SelectItem>
                  <SelectItem value="itemized">Itemized Deductions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {taxInput.deductionType === 'itemized' && (
              <div className="space-y-2">
                <Label htmlFor="itemizedDeductions">
                  <PeriodAwareLabel period={period} baseLabel="Itemized Deductions" />
                </Label>
                <Input
                  id="itemizedDeductions"
                  type="number"
                  placeholder={getPeriodAwarePlaceholder({
                    period,
                    baseAmount: 10000,
                    formatCurrency
                  })}
                  value={taxInput.itemizedDeductions || ''}
                  onChange={(e) => updateInput('itemizedDeductions', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  {getPeriodAwareHelpText(
                    period,
                    'Total allowable itemized deductions',
                    '₱10,000/month',
                    '₱120,000/year'
                  )}
                </p>
                <ConversionDisplay
                  period={period}
                  amount={taxInput.itemizedDeductions || 0}
                  formatCurrency={formatCurrency}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="withholdingTax">
                <PeriodAwareLabel period={period} baseLabel="Withholding Tax Paid" />
              </Label>
              <Input
                id="withholdingTax"
                type="number"
                placeholder={getPeriodAwarePlaceholder({
                  period,
                  baseAmount: 3000,
                  formatCurrency
                })}
                value={taxInput.withholdingTax || ''}
                onChange={(e) => updateInput('withholdingTax', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {getPeriodAwareHelpText(
                  period,
                  'Total tax withheld by your employer',
                  '₱3,000/month',
                  '₱36,000/year'
                )}
              </p>
              <ConversionDisplay
                period={period}
                amount={taxInput.withholdingTax || 0}
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => calculateTax()} 
                disabled={isCalculating}
                className="w-full"
              >
                {isCalculating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Tax
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {taxResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tax Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">Gross Income</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(taxResult.grossIncome)}
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">Taxable Income</div>
                <div className="text-xl font-bold text-finance-green-600">
                  {formatCurrency(taxResult.taxableIncome)}
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">Tax Due</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(taxResult.taxDue)}
                </div>
              </div>
              
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 font-medium">
                  {taxResult.taxPayable > 0 ? 'Tax Payable' : 'Tax Refund'}
                </div>
                <div className={`text-xl font-bold ${
                  taxResult.taxPayable > 0 ? 'text-gray-900' : 'text-finance-green-600'
                }`}>
                  {formatCurrency(taxResult.taxPayable > 0 ? taxResult.taxPayable : taxResult.taxRefund)}
                </div>
              </div>
            </div>

            {/* Tax Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Effective Tax Rate</div>
                <div className="text-2xl font-bold">{taxResult.effectiveRate.toFixed(2)}%</div>
                <Progress value={taxResult.effectiveRate} className="mt-2" />
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Marginal Tax Rate</div>
                <div className="text-2xl font-bold">{taxResult.marginalRate.toFixed(2)}%</div>
                <Progress value={taxResult.marginalRate} className="mt-2" />
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tax Bracket Breakdown</h3>
              <div className="space-y-2">
                {taxResult.breakdown.map((bracket, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        Bracket {bracket.bracket}: {formatCurrency(bracket.minIncome)} - {
                          bracket.maxIncome ? formatCurrency(bracket.maxIncome) : 'and above'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bracket.taxRate}% on {formatCurrency(bracket.taxableAmount)}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(bracket.taxAmount)}
                    </div>
                  </div>
                ))}
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
                const grossIncome = period === 'monthly' ? 25000 : 300000;
                const thirteenthMonth = period === 'monthly' ? 2083 : 25000;
                updateInput('grossAnnualIncome', grossIncome);
                updateInput('thirteenthMonthPay', thirteenthMonth);
                updateInput('otherBenefits', 0);
                updateInput('deductionType', 'standard');
                updateInput('withholdingTax', 0);
              }}
            >
              <div className="font-medium">Minimum Wage Earner</div>
              <div className="text-sm text-muted-foreground">
                {period === 'monthly' ? '₱25,000/month' : '₱300,000/year'}
              </div>
              <PeriodBadge period={period} className="mt-1" />
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                const grossIncome = period === 'monthly' ? 50000 : 600000;
                const thirteenthMonth = period === 'monthly' ? 4167 : 50000;
                const otherBenefits = period === 'monthly' ? 1667 : 20000;
                const withholdingTax = period === 'monthly' ? 3750 : 45000;
                updateInput('grossAnnualIncome', grossIncome);
                updateInput('thirteenthMonthPay', thirteenthMonth);
                updateInput('otherBenefits', otherBenefits);
                updateInput('deductionType', 'standard');
                updateInput('withholdingTax', withholdingTax);
              }}
            >
              <div className="font-medium">Middle Class Professional</div>
              <div className="text-sm text-muted-foreground">
                {period === 'monthly' ? '₱50,000/month' : '₱600,000/year'}
              </div>
              <PeriodBadge period={period} className="mt-1" />
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                const grossIncome = period === 'monthly' ? 100000 : 1200000;
                const thirteenthMonth = period === 'monthly' ? 7500 : 90000;
                const otherBenefits = period === 'monthly' ? 4167 : 50000;
                const itemizedDeductions = period === 'monthly' ? 12500 : 150000;
                const withholdingTax = period === 'monthly' ? 15000 : 180000;
                updateInput('grossAnnualIncome', grossIncome);
                updateInput('thirteenthMonthPay', thirteenthMonth);
                updateInput('otherBenefits', otherBenefits);
                updateInput('deductionType', 'itemized');
                updateInput('itemizedDeductions', itemizedDeductions);
                updateInput('withholdingTax', withholdingTax);
              }}
            >
              <div className="font-medium">High Income Individual</div>
              <div className="text-sm text-muted-foreground">
                {period === 'monthly' ? '₱100,000/month' : '₱1,200,000/year'}
              </div>
              <PeriodBadge period={period} className="mt-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
