// Business Tax Calculator Component
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
  Building, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Save,
  Download,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useBusinessTax, useTaxCalculations } from '@/hooks/usePhilippineTax';
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

export const BusinessTaxCalculator: React.FC = () => {
  const {
    businessInput,
    businessResult,
    isCalculating,
    period,
    updatePeriod,
    calculateTax,
    updateInput,
    resetCalculation
  } = useBusinessTax();
  
  const { saveCalculation, isSaving } = useTaxCalculations();
  const { standard: formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();

  const [calculationName, setCalculationName] = useState('');

  // Auto-calculate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (businessInput.grossReceipts > 0) {
        calculateTax();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [businessInput, calculateTax]);

  // Handle save calculation
  const handleSaveCalculation = async () => {
    if (!businessResult) return;

    try {
      await saveCalculation.mutateAsync({
        calculation_type: businessInput.businessType === 'corporation' ? 'itr_1702' : 'itr_1701',
        tax_year: businessInput.taxYear,
        country_code: 'PH',
        currency: 'PHP',
        input_data: businessInput,
        gross_income: businessInput.grossReceipts,
        taxable_income: businessResult.taxableIncome,
        tax_due: businessResult.recommendedOption === '8%' ? businessResult.eightPercentTax : businessResult.graduatedTax,
        calculation_breakdown: {
          eightPercentTax: businessResult.eightPercentTax,
          graduatedTax: businessResult.graduatedTax,
          recommendedOption: businessResult.recommendedOption,
          netIncome: businessResult.netIncome
        },
        calculation_name: calculationName || `Business Tax ${new Date().getFullYear()}`,
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
        exampleAmount={100000}
      />

      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select 
                value={businessInput.businessType} 
                onValueChange={(value: 'sole_proprietorship' | 'partnership' | 'corporation') => 
                  updateInput('businessType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossReceipts">
                <PeriodAwareLabel period={period} baseLabel="Gross Receipts/Sales">
                  <PeriodBadge period={period} />
                </PeriodAwareLabel>
              </Label>
              <Input
                id="grossReceipts"
                type="number"
                placeholder={getPeriodAwarePlaceholder({
                  period,
                  baseAmount: 100000,
                  formatCurrency
                })}
                value={businessInput.grossReceipts || ''}
                onChange={(e) => updateInput('grossReceipts', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {getPeriodAwareHelpText(
                  period,
                  'Total gross receipts or sales',
                  '₱100,000/month',
                  '₱1,200,000/year'
                )}
              </p>
              <ConversionDisplay
                period={period}
                amount={businessInput.grossReceipts}
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalDeductions">
                <PeriodAwareLabel period={period} baseLabel="Total Deductions" />
              </Label>
              <Input
                id="totalDeductions"
                type="number"
                placeholder={getPeriodAwarePlaceholder({
                  period,
                  baseAmount: 60000,
                  formatCurrency
                })}
                value={businessInput.totalDeductions || ''}
                onChange={(e) => updateInput('totalDeductions', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {getPeriodAwareHelpText(
                  period,
                  'Total allowable business deductions and expenses',
                  '₱60,000/month',
                  '₱720,000/year'
                )}
              </p>
              <ConversionDisplay
                period={period}
                amount={businessInput.totalDeductions}
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxYear">Tax Year</Label>
              <Select 
                value={businessInput.taxYear.toString()} 
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

        {/* Tax Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Tax Calculation Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Optional Standard Deduction for Professionals */}
            {businessInput.businessType === 'sole_proprietorship' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="osd">Optional Standard Deduction (OSD)</Label>
                    <p className="text-xs text-muted-foreground">
                      40% of gross receipts for professionals
                    </p>
                  </div>
                  <Switch
                    id="osd"
                    checked={businessInput.optionalStandardDeduction}
                    onCheckedChange={(checked) => updateInput('optionalStandardDeduction', checked)}
                  />
                </div>
                
                {businessInput.optionalStandardDeduction && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>OSD Amount:</strong> {formatCurrency(businessInput.grossReceipts * 0.40)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      This will be used instead of actual deductions for graduated tax calculation
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tax Comparison Info */}
            <div className="space-y-3">
              <h3 className="font-medium">Tax Calculation Methods</h3>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Option 1</Badge>
                  <span className="font-medium">8% Tax on Gross Receipts</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Simplified tax calculation: 8% of total gross receipts/sales
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Option 2</Badge>
                  <span className="font-medium">Graduated Income Tax</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Regular income tax rates applied to net taxable income
                </p>
              </div>
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
                    Compare Tax Options
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {businessResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tax Comparison Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Gross Receipts</div>
                <div className="text-xl font-bold text-blue-800">
                  {formatCurrency(businessInput.grossReceipts)}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Net Income</div>
                <div className="text-xl font-bold text-green-800">
                  {formatCurrency(businessResult.netIncome)}
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Taxable Income</div>
                <div className="text-xl font-bold text-purple-800">
                  {formatCurrency(businessResult.taxableIncome)}
                </div>
              </div>
              
              <div className={`p-4 border rounded-lg ${
                businessResult.recommendedOption === '8%' 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`text-sm font-medium ${
                  businessResult.recommendedOption === '8%' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  Recommended Option
                </div>
                <div className={`text-lg font-bold ${
                  businessResult.recommendedOption === '8%' ? 'text-orange-800' : 'text-green-800'
                }`}>
                  {businessResult.recommendedOption === '8%' ? '8% Tax' : 'Graduated Tax'}
                </div>
              </div>
            </div>

            {/* Tax Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 8% Tax Option */}
              <div className={`p-6 border-2 rounded-lg ${
                businessResult.recommendedOption === '8%' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    8% Tax on Gross Receipts
                    {businessResult.recommendedOption === '8%' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </h3>
                  {businessResult.recommendedOption === '8%' && (
                    <Badge className="bg-green-600">Recommended</Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Gross Receipts:</span>
                    <span className="font-medium">{formatCurrency(businessInput.grossReceipts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Rate:</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Tax:</span>
                    <span>{formatCurrency(businessResult.eightPercentTax)}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="text-sm text-muted-foreground">
                    <strong>Pros:</strong> Simple calculation, no need to track detailed expenses
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <strong>Cons:</strong> May result in higher tax if profit margin is low
                  </div>
                </div>
              </div>

              {/* Graduated Tax Option */}
              <div className={`p-6 border-2 rounded-lg ${
                businessResult.recommendedOption === 'graduated' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Graduated Income Tax
                    {businessResult.recommendedOption === 'graduated' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </h3>
                  {businessResult.recommendedOption === 'graduated' && (
                    <Badge className="bg-green-600">Recommended</Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Taxable Income:</span>
                    <span className="font-medium">{formatCurrency(businessResult.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Brackets:</span>
                    <span className="font-medium">Progressive Rates</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Tax:</span>
                    <span>{formatCurrency(businessResult.graduatedTax)}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="text-sm text-muted-foreground">
                    <strong>Pros:</strong> Lower tax if profit margin is high, more deductions allowed
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <strong>Cons:</strong> Requires detailed record-keeping of expenses
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Comparison */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Tax Savings Analysis</span>
              </div>
              <div className="text-sm">
                {businessResult.eightPercentTax < businessResult.graduatedTax ? (
                  <span className="text-green-700">
                    You save <strong>{formatCurrency(businessResult.graduatedTax - businessResult.eightPercentTax)}</strong> by choosing the 8% tax option.
                  </span>
                ) : (
                  <span className="text-green-700">
                    You save <strong>{formatCurrency(businessResult.eightPercentTax - businessResult.graduatedTax)}</strong> by choosing the graduated tax option.
                  </span>
                )}
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
                updateInput('grossReceipts', 500000);
                updateInput('totalDeductions', 200000);
                updateInput('businessType', 'sole_proprietorship');
                updateInput('optionalStandardDeduction', false);
              }}
            >
              <div className="font-medium">Small Business</div>
              <div className="text-sm text-muted-foreground">₱500,000 gross receipts</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                updateInput('grossReceipts', 1500000);
                updateInput('totalDeductions', 800000);
                updateInput('businessType', 'sole_proprietorship');
                updateInput('optionalStandardDeduction', true);
              }}
            >
              <div className="font-medium">Professional Practice</div>
              <div className="text-sm text-muted-foreground">₱1,500,000 with OSD</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                updateInput('grossReceipts', 5000000);
                updateInput('totalDeductions', 3000000);
                updateInput('businessType', 'corporation');
                updateInput('optionalStandardDeduction', false);
              }}
            >
              <div className="font-medium">Corporation</div>
              <div className="text-sm text-muted-foreground">₱5,000,000 gross receipts</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
