// Philippine tax calculation utilities based on BIR regulations and TRAIN Law
import { supabase } from '@/integrations/supabase/client';

// Tax bracket interface
export interface TaxBracket {
  id: string;
  taxYear: number;
  bracketOrder: number;
  minIncome: number;
  maxIncome: number | null;
  baseTax: number;
  taxRate: number;
  excessOver: number;
  isActive: boolean;
}

// Individual income tax calculation input
export interface IndividualTaxInput {
  grossAnnualIncome: number;
  thirteenthMonthPay: number;
  otherBenefits: number;
  deductionType: 'standard' | 'itemized';
  itemizedDeductions?: number;
  withholdingTax?: number;
  taxYear: number;
}

// Individual income tax calculation result
export interface IndividualTaxResult {
  grossIncome: number;
  exemptIncome: number;
  taxableIncome: number;
  taxDue: number;
  withholdingTax: number;
  taxPayable: number;
  taxRefund: number;
  effectiveRate: number;
  marginalRate: number;
  breakdown: TaxCalculationBreakdown[];
}

// Tax calculation breakdown for each bracket
export interface TaxCalculationBreakdown {
  bracket: number;
  minIncome: number;
  maxIncome: number | null;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
}

// ITR Form types
export type ITRFormType = '1700' | '1701' | '1702' | '1701Q' | '1702Q';

// Business tax calculation input
export interface BusinessTaxInput {
  grossReceipts: number;
  totalDeductions: number;
  taxYear: number;
  businessType: 'sole_proprietorship' | 'partnership' | 'corporation';
  optionalStandardDeduction?: boolean; // 40% OSD for professionals
  quarterlyPayments?: number[];
}

// Withholding tax types
export type WithholdingTaxType = 
  | 'compensation' 
  | 'professional_fees' 
  | 'rental_income' 
  | 'interest_income' 
  | 'dividend_income';

// Withholding tax calculation input
export interface WithholdingTaxInput {
  amount: number;
  taxType: WithholdingTaxType;
  isResident: boolean;
  taxYear: number;
}

// Cache for tax brackets
let taxBracketsCache: TaxBracket[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get Philippine tax brackets for a specific year
 */
export const getPhilippineTaxBrackets = async (taxYear: number = 2024): Promise<TaxBracket[]> => {
  // Check cache first
  if (taxBracketsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return taxBracketsCache.filter(b => b.taxYear === taxYear);
  }

  try {
    const { data, error } = await supabase
      .from('ph_tax_brackets')
      .select('*')
      .eq('tax_year', taxYear)
      .eq('is_active', true)
      .order('bracket_order');

    if (error) throw error;

    const brackets = data.map(bracket => ({
      id: bracket.id,
      taxYear: bracket.tax_year,
      bracketOrder: bracket.bracket_order,
      minIncome: Number(bracket.min_income),
      maxIncome: bracket.max_income ? Number(bracket.max_income) : null,
      baseTax: Number(bracket.base_tax),
      taxRate: Number(bracket.tax_rate),
      excessOver: Number(bracket.excess_over),
      isActive: bracket.is_active ?? true
    }));

    // Update cache
    taxBracketsCache = brackets;
    cacheTimestamp = Date.now();

    return brackets;
  } catch (error) {
    console.error('Error fetching tax brackets:', error);
    // Return default 2024 brackets if database fails
    return getDefault2024TaxBrackets();
  }
};

/**
 * Calculate individual income tax
 */
export const calculateIndividualIncomeTax = async (
  input: IndividualTaxInput
): Promise<IndividualTaxResult> => {
  const taxBrackets = await getPhilippineTaxBrackets(input.taxYear);
  
  // Calculate exempt income (13th month pay and other benefits up to ₱90,000)
  const exemptThirteenthMonth = Math.min(input.thirteenthMonthPay, 90000);
  const exemptOtherBenefits = Math.min(input.otherBenefits, 90000 - exemptThirteenthMonth);
  const totalExemptIncome = exemptThirteenthMonth + exemptOtherBenefits;

  // Calculate taxable income
  const grossIncome = input.grossAnnualIncome + input.thirteenthMonthPay + input.otherBenefits;
  let taxableIncome = grossIncome - totalExemptIncome;

  // Apply deductions
  if (input.deductionType === 'standard') {
    taxableIncome = Math.max(0, taxableIncome - 90000); // Standard deduction ₱90,000
  } else if (input.deductionType === 'itemized' && input.itemizedDeductions) {
    taxableIncome = Math.max(0, taxableIncome - input.itemizedDeductions);
  }

  // Calculate tax due using brackets
  const { taxDue, breakdown, marginalRate } = calculateTaxFromBrackets(taxableIncome, taxBrackets);

  // Calculate final amounts
  const withholdingTax = input.withholdingTax || 0;
  const taxPayable = Math.max(0, taxDue - withholdingTax);
  const taxRefund = Math.max(0, withholdingTax - taxDue);
  const effectiveRate = grossIncome > 0 ? (taxDue / grossIncome) * 100 : 0;

  return {
    grossIncome,
    exemptIncome: totalExemptIncome,
    taxableIncome,
    taxDue,
    withholdingTax,
    taxPayable,
    taxRefund,
    effectiveRate,
    marginalRate,
    breakdown
  };
};

/**
 * Calculate tax from brackets
 */
const calculateTaxFromBrackets = (
  taxableIncome: number,
  brackets: TaxBracket[]
): { taxDue: number; breakdown: TaxCalculationBreakdown[]; marginalRate: number } => {
  let totalTax = 0;
  let marginalRate = 0;
  const breakdown: TaxCalculationBreakdown[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.minIncome) {
      break;
    }

    const maxIncome = bracket.maxIncome || Infinity;
    const taxableInThisBracket = Math.min(taxableIncome, maxIncome) - bracket.minIncome;
    
    if (taxableInThisBracket > 0) {
      const taxInThisBracket = taxableInThisBracket * bracket.taxRate;
      totalTax += taxInThisBracket;
      marginalRate = bracket.taxRate * 100;

      breakdown.push({
        bracket: bracket.bracketOrder,
        minIncome: bracket.minIncome,
        maxIncome: bracket.maxIncome,
        taxableAmount: taxableInThisBracket,
        taxRate: bracket.taxRate * 100,
        taxAmount: taxInThisBracket
      });
    }
  }

  // Add base tax from the highest applicable bracket
  const applicableBracket = brackets.find(b => 
    taxableIncome > b.minIncome && (b.maxIncome === null || taxableIncome <= b.maxIncome)
  );
  
  if (applicableBracket) {
    totalTax += applicableBracket.baseTax;
  }

  return { taxDue: totalTax, breakdown, marginalRate };
};

/**
 * Calculate business income tax (8% vs graduated rates)
 */
export const calculateBusinessIncomeTax = async (
  input: BusinessTaxInput
): Promise<{
  eightPercentTax: number;
  graduatedTax: number;
  recommendedOption: '8%' | 'graduated';
  netIncome: number;
  taxableIncome: number;
}> => {
  const netIncome = input.grossReceipts - input.totalDeductions;
  
  // 8% tax on gross receipts
  const eightPercentTax = input.grossReceipts * 0.08;
  
  // Graduated tax calculation
  let taxableIncome = netIncome;
  
  // Apply Optional Standard Deduction for professionals (40% of gross receipts)
  if (input.optionalStandardDeduction) {
    const osd = input.grossReceipts * 0.40;
    taxableIncome = Math.max(0, input.grossReceipts - osd);
  }

  const taxBrackets = await getPhilippineTaxBrackets(input.taxYear);
  const { taxDue: graduatedTax } = calculateTaxFromBrackets(taxableIncome, taxBrackets);

  // Recommend the option with lower tax
  const recommendedOption = eightPercentTax <= graduatedTax ? '8%' : 'graduated';

  return {
    eightPercentTax,
    graduatedTax,
    recommendedOption,
    netIncome,
    taxableIncome
  };
};

/**
 * Calculate withholding tax
 */
export const calculateWithholdingTax = (input: WithholdingTaxInput): number => {
  const { amount, taxType, isResident } = input;

  // Withholding tax rates (2024)
  const rates: Record<WithholdingTaxType, { resident: number; nonResident: number }> = {
    compensation: { resident: 0, nonResident: 0.25 }, // Compensation subject to graduated rates
    professional_fees: { resident: 0.10, nonResident: 0.25 },
    rental_income: { resident: 0.05, nonResident: 0.25 },
    interest_income: { resident: 0.20, nonResident: 0.25 },
    dividend_income: { resident: 0.10, nonResident: 0.25 }
  };

  const rate = isResident ? rates[taxType].resident : rates[taxType].nonResident;
  return amount * rate;
};

/**
 * Calculate quarterly tax payments
 */
export const calculateQuarterlyTax = async (
  annualTaxableIncome: number,
  taxYear: number = 2024
): Promise<{
  quarterlyTax: number;
  annualTax: number;
  quarters: { quarter: number; dueDate: string; amount: number }[];
}> => {
  const taxBrackets = await getPhilippineTaxBrackets(taxYear);
  const { taxDue: annualTax } = calculateTaxFromBrackets(annualTaxableIncome, taxBrackets);
  
  const quarterlyTax = annualTax / 4;

  // Due dates for quarterly payments
  const quarters = [
    { quarter: 1, dueDate: `${taxYear}-05-15`, amount: quarterlyTax },
    { quarter: 2, dueDate: `${taxYear}-08-15`, amount: quarterlyTax },
    { quarter: 3, dueDate: `${taxYear}-11-15`, amount: quarterlyTax },
    { quarter: 4, dueDate: `${taxYear + 1}-01-15`, amount: quarterlyTax }
  ];

  return {
    quarterlyTax,
    annualTax,
    quarters
  };
};

/**
 * Validate Philippine TIN format
 */
export const validatePhilippineTIN = (tin: string): boolean => {
  // Philippine TIN format: XXX-XXX-XXX-XXX
  const tinRegex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
  return tinRegex.test(tin);
};

/**
 * Format Philippine TIN
 */
export const formatPhilippineTIN = (tin: string): string => {
  // Remove all non-digits
  const digits = tin.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXX-XXX
  if (digits.length === 12) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 12)}`;
  }
  
  return tin; // Return original if not 12 digits
};

/**
 * Get default 2024 tax brackets (fallback)
 */
const getDefault2024TaxBrackets = (): TaxBracket[] => [
  {
    id: '1',
    taxYear: 2024,
    bracketOrder: 1,
    minIncome: 0,
    maxIncome: 250000,
    baseTax: 0,
    taxRate: 0.0000,
    excessOver: 0,
    isActive: true
  },
  {
    id: '2',
    taxYear: 2024,
    bracketOrder: 2,
    minIncome: 250000,
    maxIncome: 400000,
    baseTax: 0,
    taxRate: 0.2000,
    excessOver: 250000,
    isActive: true
  },
  {
    id: '3',
    taxYear: 2024,
    bracketOrder: 3,
    minIncome: 400000,
    maxIncome: 800000,
    baseTax: 30000,
    taxRate: 0.2500,
    excessOver: 400000,
    isActive: true
  },
  {
    id: '4',
    taxYear: 2024,
    bracketOrder: 4,
    minIncome: 800000,
    maxIncome: 2000000,
    baseTax: 130000,
    taxRate: 0.3000,
    excessOver: 800000,
    isActive: true
  },
  {
    id: '5',
    taxYear: 2024,
    bracketOrder: 5,
    minIncome: 2000000,
    maxIncome: 8000000,
    baseTax: 490000,
    taxRate: 0.3200,
    excessOver: 2000000,
    isActive: true
  },
  {
    id: '6',
    taxYear: 2024,
    bracketOrder: 6,
    minIncome: 8000000,
    maxIncome: null,
    baseTax: 2410000,
    taxRate: 0.3500,
    excessOver: 8000000,
    isActive: true
  }
];

/**
 * Clear tax calculation cache
 */
export const clearTaxCache = (): void => {
  taxBracketsCache = null;
  cacheTimestamp = 0;
};

/**
 * Get tax filing deadlines for the Philippines
 */
export const getPhilippineTaxDeadlines = (taxYear: number) => {
  return {
    individual: {
      annual: `${taxYear + 1}-04-15`, // April 15 of following year
      quarterly: [
        `${taxYear}-05-15`, // Q1
        `${taxYear}-08-15`, // Q2
        `${taxYear}-11-15`, // Q3
        `${taxYear + 1}-01-15`  // Q4
      ]
    },
    business: {
      annual: `${taxYear + 1}-04-15`, // April 15 of following year
      quarterly: [
        `${taxYear}-05-15`, // Q1
        `${taxYear}-08-15`, // Q2
        `${taxYear}-11-15`, // Q3
        `${taxYear + 1}-01-15`  // Q4
      ]
    },
    corporate: {
      annual: `${taxYear + 1}-04-15`, // April 15 of following year (or 15th day of 4th month after fiscal year end)
      quarterly: [
        `${taxYear}-05-15`, // Q1
        `${taxYear}-08-15`, // Q2
        `${taxYear}-11-15`, // Q3
        `${taxYear + 1}-01-15`  // Q4
      ]
    }
  };
};
