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

export const IndividualTaxCalculator: React.FC = () => {
  const { 
    taxInput, 
    taxResult, 
    isCalculating, 
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
              <Label htmlFor="grossIncome">Gross Annual Income</Label>
              <Input
                id="grossIncome"
                type="number"
                placeholder="0.00"
                value={taxInput.grossAnnualIncome || ''}
                onChange={(e) => updateInput('grossAnnualIncome', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Total salary, wages, and other compensation before deductions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thirteenthMonth">13th Month Pay & Bonuses</Label>
              <Input
                id="thirteenthMonth"
                type="number"
                placeholder="0.00"
                value={taxInput.thirteenthMonthPay || ''}
                onChange={(e) => updateInput('thirteenthMonthPay', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                13th month pay and other bonuses (up to ₱90,000 exempt)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherBenefits">Other Benefits</Label>
              <Input
                id="otherBenefits"
                type="number"
                placeholder="0.00"
                value={taxInput.otherBenefits || ''}
                onChange={(e) => updateInput('otherBenefits', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Other taxable benefits and allowances
              </p>
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
                <Label htmlFor="itemizedDeductions">Itemized Deductions</Label>
                <Input
                  id="itemizedDeductions"
                  type="number"
                  placeholder="0.00"
                  value={taxInput.itemizedDeductions || ''}
                  onChange={(e) => updateInput('itemizedDeductions', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Total allowable itemized deductions
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="withholdingTax">Withholding Tax Paid</Label>
              <Input
                id="withholdingTax"
                type="number"
                placeholder="0.00"
                value={taxInput.withholdingTax || ''}
                onChange={(e) => updateInput('withholdingTax', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Total tax withheld by your employer during the year
              </p>
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Gross Income</div>
                <div className="text-xl font-bold text-blue-800">
                  {formatCurrency(taxResult.grossIncome)}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Taxable Income</div>
                <div className="text-xl font-bold text-green-800">
                  {formatCurrency(taxResult.taxableIncome)}
                </div>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Tax Due</div>
                <div className="text-xl font-bold text-red-800">
                  {formatCurrency(taxResult.taxDue)}
                </div>
              </div>
              
              <div className={`p-4 border rounded-lg ${
                taxResult.taxPayable > 0 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`text-sm font-medium ${
                  taxResult.taxPayable > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {taxResult.taxPayable > 0 ? 'Tax Payable' : 'Tax Refund'}
                </div>
                <div className={`text-xl font-bold ${
                  taxResult.taxPayable > 0 ? 'text-orange-800' : 'text-green-800'
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
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                updateInput('grossAnnualIncome', 300000);
                updateInput('thirteenthMonthPay', 25000);
                updateInput('otherBenefits', 0);
                updateInput('deductionType', 'standard');
                updateInput('withholdingTax', 0);
              }}
            >
              <div className="font-medium">Minimum Wage Earner</div>
              <div className="text-sm text-muted-foreground">₱300,000 annual income</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                updateInput('grossAnnualIncome', 600000);
                updateInput('thirteenthMonthPay', 50000);
                updateInput('otherBenefits', 20000);
                updateInput('deductionType', 'standard');
                updateInput('withholdingTax', 45000);
              }}
            >
              <div className="font-medium">Middle Class Professional</div>
              <div className="text-sm text-muted-foreground">₱600,000 annual income</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start"
              onClick={() => {
                updateInput('grossAnnualIncome', 1200000);
                updateInput('thirteenthMonthPay', 90000);
                updateInput('otherBenefits', 50000);
                updateInput('deductionType', 'itemized');
                updateInput('itemizedDeductions', 150000);
                updateInput('withholdingTax', 180000);
              }}
            >
              <div className="font-medium">High Income Individual</div>
              <div className="text-sm text-muted-foreground">₱1,200,000 annual income</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
