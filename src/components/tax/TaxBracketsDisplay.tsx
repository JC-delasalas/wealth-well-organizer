// Tax Brackets Display Component
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  TrendingUp, 
  Calculator, 
  Info,
  Download,
  Eye
} from 'lucide-react';
import { useTaxBrackets } from '@/hooks/usePhilippineTax';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const TaxBracketsDisplay: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'table' | 'visual'>('table');
  
  const { taxBrackets, isLoading } = useTaxBrackets(selectedYear);
  const { standard: formatCurrency } = useCurrencyFormatter();

  // Calculate cumulative tax for visualization
  const calculateCumulativeTax = (income: number) => {
    let totalTax = 0;
    let remainingIncome = income;

    for (const bracket of taxBrackets) {
      if (remainingIncome <= 0) break;

      const bracketMin = bracket.minIncome;
      const bracketMax = bracket.maxIncome || Infinity;
      const taxableInBracket = Math.min(remainingIncome, bracketMax - bracketMin);

      if (taxableInBracket > 0) {
        totalTax += bracket.baseTax + (taxableInBracket * bracket.taxRate);
        remainingIncome -= taxableInBracket;
      }
    }

    return totalTax;
  };

  // Sample income levels for visualization
  const sampleIncomes = [250000, 400000, 800000, 2000000, 8000000];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tax Year:</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
            <Button
              variant={viewMode === 'visual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('visual')}
            >
              <Eye className="w-4 h-4 mr-1" />
              Visual
            </Button>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {viewMode === 'table' ? (
        /* Table View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Philippine Income Tax Brackets ({selectedYear})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on TRAIN Law provisions and current BIR regulations
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Bracket</th>
                    <th className="text-left p-3 font-medium">Taxable Income Range</th>
                    <th className="text-left p-3 font-medium">Base Tax</th>
                    <th className="text-left p-3 font-medium">Tax Rate</th>
                    <th className="text-left p-3 font-medium">Excess Over</th>
                  </tr>
                </thead>
                <tbody>
                  {taxBrackets.map((bracket, index) => (
                    <tr key={bracket.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Badge variant="outline">
                          Bracket {bracket.bracketOrder}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">
                          {formatCurrency(bracket.minIncome)} - {
                            bracket.maxIncome 
                              ? formatCurrency(bracket.maxIncome)
                              : 'and above'
                          }
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">
                          {formatCurrency(bracket.baseTax)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {(bracket.taxRate * 100).toFixed(1)}%
                          </span>
                          <Progress 
                            value={bracket.taxRate * 100} 
                            className="w-16 h-2"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-muted-foreground">
                          {formatCurrency(bracket.excessOver)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Visual View */
        <div className="space-y-6">
          {/* Tax Rate Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tax Rate Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxBrackets.map((bracket, index) => (
                  <div key={bracket.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {(bracket.taxRate * 100).toFixed(1)}%
                        </Badge>
                        <span className="text-sm">
                          {formatCurrency(bracket.minIncome)} - {
                            bracket.maxIncome 
                              ? formatCurrency(bracket.maxIncome)
                              : 'and above'
                          }
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Base: {formatCurrency(bracket.baseTax)}
                      </span>
                    </div>
                    <Progress 
                      value={bracket.taxRate * 100} 
                      className="h-3"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sample Tax Calculations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Sample Tax Calculations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tax liability for different income levels
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleIncomes.map((income) => {
                  const tax = calculateCumulativeTax(income);
                  const effectiveRate = (tax / income) * 100;
                  
                  return (
                    <div key={income} className="p-4 border rounded-lg">
                      <div className="text-lg font-semibold mb-2">
                        {formatCurrency(income)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Tax Due:</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(tax)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effective Rate:</span>
                          <span className="font-medium">
                            {effectiveRate.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Income:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(income - tax)}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={effectiveRate} 
                        className="mt-2 h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Key Information:</p>
              <ul className="text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>TRAIN Law:</strong> Tax Reform for Acceleration and Inclusion Act</li>
                <li><strong>Standard Deduction:</strong> ₱90,000 for individual taxpayers</li>
                <li><strong>13th Month Exemption:</strong> Up to ₱90,000 is tax-exempt</li>
                <li><strong>Progressive System:</strong> Higher income brackets pay higher rates</li>
                <li><strong>Marginal vs Effective:</strong> Only income above each bracket threshold is taxed at the higher rate</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison with Previous Years */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Bracket History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Changes in Philippine income tax brackets over the years
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">2024 (Current)</div>
                <div className="text-sm text-muted-foreground">
                  TRAIN Law provisions in full effect with updated brackets
                </div>
                <Badge className="mt-2">Current</Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">2018-2023</div>
                <div className="text-sm text-muted-foreground">
                  TRAIN Law implementation period with gradual changes
                </div>
                <Badge variant="outline" className="mt-2">Historical</Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">Pre-2018</div>
                <div className="text-sm text-muted-foreground">
                  Old tax system before TRAIN Law reforms
                </div>
                <Badge variant="secondary" className="mt-2">Legacy</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
