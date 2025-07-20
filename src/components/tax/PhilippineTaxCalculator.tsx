// Philippine Tax Calculator Main Component
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  FileText,
  Building,
  Receipt,
  BookOpen,
  Calendar
} from 'lucide-react';
import { IndividualTaxCalculator } from './IndividualTaxCalculator';
import { BusinessTaxCalculator } from './BusinessTaxCalculator';
import { WithholdingTaxCalculator } from './WithholdingTaxCalculator';
import { TaxBracketsDisplay } from './TaxBracketsDisplay';
import { TaxDeadlinesDisplay } from './TaxDeadlinesDisplay';
import { useCurrency } from '@/hooks/useCurrency';

// Tax calculator tabs configuration
const taxCalculatorTabs = [
  {
    id: 'individual',
    label: 'Individual Tax',
    icon: FileText,
    description: 'Personal income tax calculator'
  },
  {
    id: 'business',
    label: 'Business Tax',
    icon: Building,
    description: 'Business tax comparison tool'
  },
  {
    id: 'withholding',
    label: 'Withholding Tax',
    icon: Receipt,
    description: 'Withholding tax calculator'
  },
  {
    id: 'brackets',
    label: 'Tax Brackets',
    icon: BookOpen,
    description: 'Current tax brackets'
  },
  {
    id: 'deadlines',
    label: 'Deadlines',
    icon: Calendar,
    description: 'Filing deadlines'
  }
];

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
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Calculator className="w-8 h-8" />
          Philippine Tax Calculator
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">BIR Compliant</Badge>
          <Badge variant="outline" className="text-xs">TRAIN Law 2024</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Comprehensive tax calculation tools for Philippine taxpayers
        </p>
      </div>

      {/* Tax Calculator Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          {taxCalculatorTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 text-xs md:text-sm"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="individual" className="mt-6">
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

        <TabsContent value="business" className="mt-6">
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

        <TabsContent value="withholding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Withholding Tax Calculator
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate withholding tax for various income types including professional fees,
                rental income, and other compensation.
              </p>
            </CardHeader>
            <CardContent>
              <WithholdingTaxCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brackets" className="mt-6">
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

        <TabsContent value="deadlines" className="mt-6">
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
    </div>
  );
};
