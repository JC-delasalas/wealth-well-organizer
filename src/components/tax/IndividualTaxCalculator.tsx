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
  const [autoWithholding, setAutoWithholding] = useState(true);

  // Auto-calculate withholding tax when enabled
  useEffect(() => {
    if (autoWithholding && taxInput.grossAnnualIncome > 0) {
      // Calculate estimated withholding tax (approximately 10-15% of gross income)
      const estimatedWithholding = Math.round(taxInput.grossAnnualIncome * 0.12);
      if (estimatedWithholding !== taxInput.withholdingTax) {
        updateInput('withholdingTax', estimatedWithholding);
      }
    }
  }, [autoWithholding, taxInput.grossAnnualIncome, updateInput]);

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
          {/* Glassmorphism background for period selector */}
          <div className="absolute -inset-3 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl shadow-black/5"></div>

          <div className="relative p-2">
            <PeriodSelector
              period={period}
              onPeriodChange={updatePeriod}
              exampleAmount={50000}
            />
          </div>
        </div>

        {/* Enhanced Input Form */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Income Inputs */}
          <div className="relative group">
            {/* Multi-layer glassmorphism background */}
            <div className="absolute -inset-2 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/40"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-finance-green-50/15 to-transparent rounded-3xl"></div>

            <Card className="relative bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="relative pb-4 pt-6 px-6">
                {/* Decorative elements */}
                <div className="absolute top-2 right-4 w-2 h-2 bg-finance-green-300/30 rounded-full"></div>
                <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-blue-300/20 rounded-full"></div>

                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-finance-green-500/20 rounded-xl blur-md"></div>
                    <div className="relative bg-gradient-to-br from-finance-green-50 to-finance-green-100/50 p-2 rounded-xl border border-finance-green-200/30">
                      <DollarSign className="w-5 h-5 text-finance-green-600" />
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Income Information
                  </span>
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
          </div>

          {/* Enhanced Deductions and Withholding */}
          <div className="relative group">
            {/* Multi-layer glassmorphism background */}
            <div className="absolute -inset-2 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/40"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-finance-green-50/15 to-transparent rounded-3xl"></div>

            <Card className="relative bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="relative pb-4 pt-6 px-6">
                {/* Decorative elements */}
                <div className="absolute top-2 left-4 w-2 h-2 bg-finance-green-300/30 rounded-full"></div>
                <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-blue-300/20 rounded-full"></div>

                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-finance-green-500/20 rounded-xl blur-md"></div>
                    <div className="relative bg-gradient-to-br from-finance-green-50 to-finance-green-100/50 p-2 rounded-xl border border-finance-green-200/30">
                      <FileText className="w-5 h-5 text-finance-green-600" />
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Deductions & Withholding
                  </span>
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

            {/* Enhanced Withholding Tax Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="withholdingTax" className="text-base font-semibold">
                  <PeriodAwareLabel period={period} baseLabel="Withholding Tax Paid" />
                </Label>

                {/* Auto-calculation toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoWithholding"
                    checked={autoWithholding}
                    onChange={(e) => setAutoWithholding(e.target.checked)}
                    className="w-4 h-4 text-finance-green-600 bg-gray-100 border-gray-300 rounded focus:ring-finance-green-500 focus:ring-2"
                  />
                  <Label htmlFor="autoWithholding" className="text-sm text-gray-600 cursor-pointer">
                    Auto-calculate
                  </Label>
                </div>
              </div>

              <div className="relative">
                {/* Enhanced input with glassmorphism when auto-enabled */}
                <div className={`${autoWithholding ? 'absolute inset-0 bg-finance-green-50/30 rounded-lg blur-sm' : ''}`}></div>
                <Input
                  id="withholdingTax"
                  type="number"
                  placeholder={getPeriodAwarePlaceholder({
                    period,
                    baseAmount: 3000,
                    formatCurrency
                  })}
                  value={taxInput.withholdingTax || ''}
                  onChange={(e) => {
                    if (!autoWithholding) {
                      updateInput('withholdingTax', parseFloat(e.target.value) || 0);
                    }
                  }}
                  disabled={autoWithholding}
                  className={`relative ${autoWithholding ? 'bg-finance-green-50/20 border-finance-green-200 text-finance-green-700' : ''}`}
                />

                {autoWithholding && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-1 text-xs text-finance-green-600 font-medium">
                      <Calculator className="w-3 h-3" />
                      Auto
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  {autoWithholding ? (
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-finance-green-600" />
                      Automatically calculated at 12% of gross income
                    </span>
                  ) : (
                    getPeriodAwareHelpText(
                      period,
                      'Total tax withheld by your employer',
                      '₱3,000/month',
                      '₱36,000/year'
                    )
                  )}
                </p>

                <ConversionDisplay
                  period={period}
                  amount={taxInput.withholdingTax || 0}
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>

              <div className="pt-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-finance-green-500/10 rounded-xl blur-sm"></div>
                  <Button
                    onClick={() => calculateTax()}
                    disabled={isCalculating}
                    className="relative w-full bg-gradient-to-r from-finance-green-600 to-finance-green-700 text-white font-semibold py-3 shadow-lg shadow-finance-green-600/25 border-0"
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
              </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Results Section */}
        {taxResult && (
          <div className="relative">
            {/* Glassmorphism background for results */}
            <div className="absolute -inset-4 bg-gradient-to-br from-white/70 via-white/50 to-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-black/10"></div>

            <Card className="relative bg-white/95 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="relative pb-4 pt-8 px-8">
                {/* Decorative elements */}
                <div className="absolute top-3 right-6 w-3 h-3 bg-finance-green-300/30 rounded-full"></div>
                <div className="absolute top-6 right-3 w-2 h-2 bg-blue-300/20 rounded-full"></div>

                <CardTitle className="text-2xl font-bold flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-finance-green-500/20 rounded-xl blur-lg"></div>
                    <div className="relative bg-gradient-to-br from-finance-green-50 to-finance-green-100/70 p-3 rounded-xl border border-finance-green-200/40 shadow-lg shadow-finance-green-500/20">
                      <TrendingUp className="w-6 h-6 text-finance-green-600" />
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Tax Calculation Results
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative px-8 pb-8 space-y-8">
                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                    <div className="relative p-6 rounded-2xl">
                      <div className="text-sm text-gray-600 font-semibold mb-2">Gross Income</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {formatCurrency(taxResult.grossIncome)}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                    <div className="relative p-6 rounded-2xl">
                      <div className="text-sm text-gray-600 font-semibold mb-2">Taxable Income</div>
                      <div className="text-2xl font-bold text-finance-green-600">
                        {formatCurrency(taxResult.taxableIncome)}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                    <div className="relative p-6 rounded-2xl">
                      <div className="text-sm text-gray-600 font-semibold mb-2">Tax Due</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {formatCurrency(taxResult.taxDue)}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                    <div className="relative p-6 rounded-2xl">
                      <div className="text-sm text-gray-600 font-semibold mb-2">
                        {taxResult.taxPayable > 0 ? 'Tax Payable' : 'Tax Refund'}
                      </div>
                      <div className={`text-2xl font-bold ${
                        taxResult.taxPayable > 0 ? 'text-gray-900' : 'text-finance-green-600'
                      }`}>
                        {formatCurrency(taxResult.taxPayable > 0 ? taxResult.taxPayable : taxResult.taxRefund)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Tax Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-finance-green-50/50 to-finance-green-100/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-finance-green-200/30"></div>
                    <div className="relative p-6 rounded-2xl">
                      <div className="text-sm text-gray-600 font-semibold mb-3">Effective Tax Rate</div>
                      <div className="text-3xl font-bold text-finance-green-600 mb-3">{taxResult.effectiveRate.toFixed(2)}%</div>
                      <Progress value={taxResult.effectiveRate} className="mt-2 h-2" />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-blue-200/30"></div>
                    <div className="relative p-6 rounded-2xl">
                      <div className="text-sm text-gray-600 font-semibold mb-3">Marginal Tax Rate</div>
                      <div className="text-3xl font-bold text-blue-600 mb-3">{taxResult.marginalRate.toFixed(2)}%</div>
                      <Progress value={taxResult.marginalRate} className="mt-2 h-2" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Detailed Breakdown */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Tax Bracket Breakdown
                    </h3>
                    <div className="h-1 w-24 bg-gradient-to-r from-finance-green-500 to-transparent mt-2 rounded-full mx-auto"></div>
                  </div>

                  <div className="space-y-4">
                    {taxResult.breakdown.map((bracket, index) => (
                      <div key={index} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                        <div className="relative flex items-center justify-between p-6 rounded-2xl">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">
                              Bracket {bracket.bracket}: {formatCurrency(bracket.minIncome)} - {
                                bracket.maxIncome ? formatCurrency(bracket.maxIncome) : 'and above'
                              }
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {bracket.taxRate}% on {formatCurrency(bracket.taxableAmount)}
                            </div>
                          </div>
                          <div className="text-xl font-bold text-finance-green-600">
                            {formatCurrency(bracket.taxAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            </div>

                {/* Enhanced Save Calculation */}
                <Separator className="my-8" />
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter calculation name (optional)"
                      value={calculationName}
                      onChange={(e) => setCalculationName(e.target.value)}
                      className="bg-white/70 backdrop-blur-sm border-white/50"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-finance-green-500/10 rounded-xl blur-sm"></div>
                    <Button
                      onClick={handleSaveCalculation}
                      disabled={isSaving}
                      className="relative bg-gradient-to-r from-finance-green-600 to-finance-green-700 text-white font-semibold shadow-lg shadow-finance-green-600/25"
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
                  </div>
                  <Button variant="outline" className="bg-white/70 backdrop-blur-sm border-white/50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Quick Examples */}
        <div className="relative">
          {/* Glassmorphism background for examples */}
          <div className="absolute -inset-3 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl shadow-black/5"></div>

          <Card className="relative bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
            <CardHeader className="relative pb-4 pt-6 px-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-finance-green-500/20 rounded-xl blur-md"></div>
                  <div className="relative bg-gradient-to-br from-finance-green-50 to-finance-green-100/50 p-2 rounded-xl border border-finance-green-200/30">
                    <Info className="w-5 h-5 text-finance-green-600" />
                  </div>
                </div>
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Quick Examples
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="relative px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                  <Button
                    variant="outline"
                    className="relative w-full p-6 h-auto flex-col items-start bg-transparent border-0 text-left"
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
                    <div className="font-bold text-gray-900 mb-1">Minimum Wage Earner</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {period === 'monthly' ? '₱25,000/month' : '₱300,000/year'}
                    </div>
                    <PeriodBadge period={period} className="mt-1" />
                  </Button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                  <Button
                    variant="outline"
                    className="relative w-full p-6 h-auto flex-col items-start bg-transparent border-0 text-left"
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
                    <div className="font-bold text-gray-900 mb-1">Middle Class Professional</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {period === 'monthly' ? '₱50,000/month' : '₱600,000/year'}
                    </div>
                    <PeriodBadge period={period} className="mt-1" />
                  </Button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/40"></div>
                  <Button
                    variant="outline"
                    className="relative w-full p-6 h-auto flex-col items-start bg-transparent border-0 text-left"
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
                    <div className="font-bold text-gray-900 mb-1">High Income Individual</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {period === 'monthly' ? '₱100,000/month' : '₱1,200,000/year'}
                    </div>
                    <PeriodBadge period={period} className="mt-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
