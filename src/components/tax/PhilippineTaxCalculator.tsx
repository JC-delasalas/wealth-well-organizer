// Philippine Tax Calculator Main Component with Sidebar Navigation
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Calculator,
  FileText,
  Building,
  Receipt,
  Info,
  BookOpen,
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { IndividualTaxCalculator } from './IndividualTaxCalculator';
import { BusinessTaxCalculator } from './BusinessTaxCalculator';
import { WithholdingTaxCalculator } from './WithholdingTaxCalculator';
import { TaxBracketsDisplay } from './TaxBracketsDisplay';
import { TaxDeadlinesDisplay } from './TaxDeadlinesDisplay';
import { useCurrency } from '@/hooks/useCurrency';

// Navigation items for the sidebar
const navigationItems = [
  {
    id: 'individual',
    label: 'Individual Tax Calculator',
    icon: FileText,
    description: 'Calculate your annual income tax based on BIR tax brackets'
  },
  {
    id: 'business',
    label: 'Business Tax Calculator',
    icon: Building,
    description: 'Compare 8% tax on gross receipts vs. graduated income tax rates'
  },
  {
    id: 'withholding',
    label: 'Withholding Tax Calculator',
    icon: Receipt,
    description: 'Calculate withholding tax for various income types'
  },
  {
    id: 'brackets',
    label: 'Tax Brackets Reference',
    icon: BookOpen,
    description: 'Current income tax brackets based on TRAIN Law'
  },
  {
    id: 'deadlines',
    label: 'Tax Filing Deadlines',
    icon: Calendar,
    description: 'Important dates for tax filing and payment deadlines'
  }
];

export const PhilippineTaxCalculator: React.FC = () => {
  const { userProfile } = useCurrency();
  const [activeSection, setActiveSection] = useState('individual');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when switching sections on mobile
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Sidebar component for desktop
  const DesktopSidebar = () => (
    <div className={`hidden md:flex flex-col w-80 bg-white border-r border-gray-200 transition-all duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Tax Calculators
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          BIR-compliant tax calculations
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-primary-foreground' : 'text-gray-500'}`} />
                <div>
                  <div className={`font-medium text-sm ${isActive ? 'text-primary-foreground' : 'text-gray-900'}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs mt-1 ${isActive ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );

  // Mobile sidebar using Sheet component
  const MobileSidebar = () => (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Tax Calculators
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            BIR-compliant tax calculations
          </p>
        </div>
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-primary-foreground' : 'text-gray-500'}`} />
                  <div>
                    <div className={`font-medium text-sm ${isActive ? 'text-primary-foreground' : 'text-gray-900'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs mt-1 ${isActive ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );

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
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Hamburger Menu */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Header Content */}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Philippine Tax Calculator
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">BIR Compliant</Badge>
                <Badge variant="outline" className="text-xs">TRAIN Law 2024</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">Important Notice</p>
                  <p className="text-amber-700">
                    These calculations are for estimation purposes only. Always consult with a qualified
                    tax professional or the Bureau of Internal Revenue (BIR) for official tax advice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Content Based on Active Section */}
          {activeSection === 'individual' && (
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
          )}

          {activeSection === 'business' && (
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
          )}

          {activeSection === 'withholding' && (
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
          )}

          {activeSection === 'brackets' && (
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
          )}

          {activeSection === 'deadlines' && (
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
          )}
        </div>
      </div>
    </div>
  );
};
