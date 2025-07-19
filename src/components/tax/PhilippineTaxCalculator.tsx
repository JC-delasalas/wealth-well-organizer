// Philippine Tax Calculator Main Component
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  FileText, 
  Building, 
  Receipt, 
  Home, 
  Info,
  BookOpen,
  Calendar
} from 'lucide-react';
import { IndividualTaxCalculator } from './IndividualTaxCalculator';
import { BusinessTaxCalculator } from './BusinessTaxCalculator';
import { WithholdingTaxCalculator } from './WithholdingTaxCalculator';
import { TaxBracketsDisplay } from './TaxBracketsDisplay';
import { TaxDeadlinesDisplay } from './TaxDeadlinesDisplay';
import { useCurrency } from '@/hooks/useCurrency';

export const PhilippineTaxCalculator: React.FC = () => {
  const { userProfile } = useCurrency();
  const [activeTab, setActiveTab] = useState('individual');

  // Check if user is in Philippines
  const isPhilippineUser = userProfile?.country === 'PH';

  if (!isPhilippineUser) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Calculator className="w-16 h-16 mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Philippine Tax Calculator</h2>
            <p className="text-muted-foreground mb-4">
              This tax calculator is specifically designed for Philippine taxpayers using BIR regulations.
            </p>
            <p className="text-sm text-muted-foreground">
              To access this feature, please update your country to Philippines in your profile settings.
            </p>
            <Button className="mt-4" variant="outline">
              Update Profile Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="w-8 h-8" />
          Philippine Tax Calculator
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive BIR tax calculations based on current TRAIN Law provisions. 
          Calculate individual income tax, business tax, withholding tax, and more.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">BIR Compliant</Badge>
          <Badge variant="outline">TRAIN Law 2024</Badge>
          <Badge variant="outline">Updated Tax Brackets</Badge>
        </div>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Important Notice</p>
              <p className="text-amber-700">
                These calculations are for estimation purposes only. Always consult with a qualified 
                tax professional or the Bureau of Internal Revenue (BIR) for official tax advice. 
                Tax laws may change, and individual circumstances may affect your actual tax liability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculator Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Individual</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="withholding" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Withholding</span>
          </TabsTrigger>
          <TabsTrigger value="brackets" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Brackets</span>
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Deadlines</span>
          </TabsTrigger>
        </TabsList>

        {/* Individual Income Tax Calculator */}
        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Individual Income Tax Calculator
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate your annual income tax based on BIR tax brackets and TRAIN Law provisions.
                Includes 13th month pay exemptions and standard/itemized deductions.
              </p>
            </CardHeader>
            <CardContent>
              <IndividualTaxCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tax Calculator */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Business Tax Calculator
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare 8% tax on gross receipts vs. graduated income tax rates. 
                Includes Optional Standard Deduction (OSD) for professionals.
              </p>
            </CardHeader>
            <CardContent>
              <BusinessTaxCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withholding Tax Calculator */}
        <TabsContent value="withholding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Withholding Tax Calculator
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate withholding tax for various income types including professional fees, 
                rental income, interest, and dividends.
              </p>
            </CardHeader>
            <CardContent>
              <WithholdingTaxCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Brackets Reference */}
        <TabsContent value="brackets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Philippine Tax Brackets (2024)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Current income tax brackets based on TRAIN Law provisions.
              </p>
            </CardHeader>
            <CardContent>
              <TaxBracketsDisplay />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Deadlines */}
        <TabsContent value="deadlines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Tax Filing Deadlines
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Important dates for tax filing and payment deadlines in the Philippines.
              </p>
            </CardHeader>
            <CardContent>
              <TaxDeadlinesDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links & Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">BIR Official Website</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Access official BIR forms, regulations, and announcements.
              </p>
              <Button variant="outline" size="sm">
                Visit BIR.gov.ph
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Tax Forms (ITR)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download and access various ITR forms for different taxpayer types.
              </p>
              <Button variant="outline" size="sm">
                Download Forms
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Tax Calendar</h3>
              <p className="text-sm text-muted-foreground mb-3">
                View complete tax calendar with all important deadlines.
              </p>
              <Button variant="outline" size="sm">
                View Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="text-xs text-gray-600 space-y-2">
            <p className="font-medium">Disclaimer:</p>
            <p>
              This tax calculator is provided for informational and educational purposes only. 
              The calculations are based on publicly available tax rates and regulations as of 2024. 
              Tax laws are subject to change, and individual circumstances may affect your actual tax liability.
            </p>
            <p>
              Always consult with a qualified tax professional, certified public accountant (CPA), 
              or the Bureau of Internal Revenue (BIR) for official tax advice and to ensure compliance 
              with current tax laws and regulations.
            </p>
            <p>
              The developers of this application are not responsible for any errors in calculations 
              or any consequences arising from the use of this tool.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
