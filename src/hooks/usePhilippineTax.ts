// React hooks for Philippine tax calculations
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateIndividualIncomeTax,
  calculateBusinessIncomeTax,
  calculateWithholdingTax,
  calculateQuarterlyTax,
  getPhilippineTaxBrackets,
  getPhilippineTaxDeadlines,
  validatePhilippineTIN,
  formatPhilippineTIN,
  type IndividualTaxInput,
  type IndividualTaxResult,
  type BusinessTaxInput,
  type WithholdingTaxInput,
  type TaxBracket
} from '@/utils/philippineTax';
import type { TaxCalculation } from '@/types';

/**
 * Hook for individual income tax calculations
 */
export const useIndividualTax = () => {
  const [taxInput, setTaxInput] = useState<IndividualTaxInput>({
    grossAnnualIncome: 0,
    thirteenthMonthPay: 0,
    otherBenefits: 0,
    deductionType: 'standard',
    itemizedDeductions: 0,
    withholdingTax: 0,
    taxYear: new Date().getFullYear()
  });

  const [taxResult, setTaxResult] = useState<IndividualTaxResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate tax
  const calculateTax = useCallback(async (input?: IndividualTaxInput) => {
    setIsCalculating(true);
    try {
      const inputToUse = input || taxInput;
      const result = await calculateIndividualIncomeTax(inputToUse);
      setTaxResult(result);
      return result;
    } catch (error) {
      console.error('Error calculating individual tax:', error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, [taxInput]);

  // Update input field
  const updateInput = useCallback((field: keyof IndividualTaxInput, value: any) => {
    setTaxInput(prev => ({ ...prev, [field]: value }));
  }, []);

  // Reset calculation
  const resetCalculation = useCallback(() => {
    setTaxResult(null);
    setTaxInput({
      grossAnnualIncome: 0,
      thirteenthMonthPay: 0,
      otherBenefits: 0,
      deductionType: 'standard',
      itemizedDeductions: 0,
      withholdingTax: 0,
      taxYear: new Date().getFullYear()
    });
  }, []);

  return {
    taxInput,
    taxResult,
    isCalculating,
    calculateTax,
    updateInput,
    resetCalculation,
    setTaxInput
  };
};

/**
 * Hook for business tax calculations
 */
export const useBusinessTax = () => {
  const [businessInput, setBusinessInput] = useState<BusinessTaxInput>({
    grossReceipts: 0,
    totalDeductions: 0,
    taxYear: new Date().getFullYear(),
    businessType: 'sole_proprietorship',
    optionalStandardDeduction: false,
    quarterlyPayments: [0, 0, 0, 0]
  });

  const [businessResult, setBusinessResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate business tax
  const calculateTax = useCallback(async (input?: BusinessTaxInput) => {
    setIsCalculating(true);
    try {
      const inputToUse = input || businessInput;
      const result = await calculateBusinessIncomeTax(inputToUse);
      setBusinessResult(result);
      return result;
    } catch (error) {
      console.error('Error calculating business tax:', error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, [businessInput]);

  // Update input field
  const updateInput = useCallback((field: keyof BusinessTaxInput, value: any) => {
    setBusinessInput(prev => ({ ...prev, [field]: value }));
  }, []);

  // Reset calculation
  const resetCalculation = useCallback(() => {
    setBusinessResult(null);
    setBusinessInput({
      grossReceipts: 0,
      totalDeductions: 0,
      taxYear: new Date().getFullYear(),
      businessType: 'sole_proprietorship',
      optionalStandardDeduction: false,
      quarterlyPayments: [0, 0, 0, 0]
    });
  }, []);

  return {
    businessInput,
    businessResult,
    isCalculating,
    calculateTax,
    updateInput,
    resetCalculation,
    setBusinessInput
  };
};

/**
 * Hook for withholding tax calculations
 */
export const useWithholdingTax = () => {
  const [withholdingInput, setWithholdingInput] = useState<WithholdingTaxInput>({
    amount: 0,
    taxType: 'professional_fees',
    isResident: true,
    taxYear: new Date().getFullYear()
  });

  const [withholdingResult, setWithholdingResult] = useState<number | null>(null);

  // Calculate withholding tax
  const calculateTax = useCallback((input?: WithholdingTaxInput) => {
    const inputToUse = input || withholdingInput;
    const result = calculateWithholdingTax(inputToUse);
    setWithholdingResult(result);
    return result;
  }, [withholdingInput]);

  // Update input field
  const updateInput = useCallback((field: keyof WithholdingTaxInput, value: any) => {
    setWithholdingInput(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    withholdingInput,
    withholdingResult,
    calculateTax,
    updateInput,
    setWithholdingInput
  };
};

/**
 * Hook for tax brackets and reference data
 */
export const useTaxBrackets = (taxYear: number = new Date().getFullYear()) => {
  // Get Philippine tax brackets
  const { data: taxBrackets = [], isLoading } = useQuery({
    queryKey: ['ph-tax-brackets', taxYear],
    queryFn: () => getPhilippineTaxBrackets(taxYear),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Get tax deadlines
  const taxDeadlines = getPhilippineTaxDeadlines(taxYear);

  return {
    taxBrackets,
    taxDeadlines,
    isLoading
  };
};

/**
 * Hook for saving and managing tax calculations
 */
export const useTaxCalculations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's saved tax calculations
  const { data: savedCalculations = [], isLoading } = useQuery({
    queryKey: ['tax-calculations', user?.id],
    queryFn: async (): Promise<TaxCalculation[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('tax_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Save tax calculation
  const saveCalculation = useMutation({
    mutationFn: async (calculation: Omit<TaxCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_calculations')
        .insert([{
          ...calculation,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-calculations', user?.id] });
      toast({
        title: "Calculation Saved",
        description: "Your tax calculation has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving calculation",
        description: error.message || "Failed to save tax calculation.",
        variant: "destructive",
      });
    },
  });

  // Update tax calculation
  const updateCalculation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaxCalculation> }) => {
      const { data, error } = await supabase
        .from('tax_calculations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-calculations', user?.id] });
      toast({
        title: "Calculation Updated",
        description: "Your tax calculation has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating calculation",
        description: error.message || "Failed to update tax calculation.",
        variant: "destructive",
      });
    },
  });

  // Delete tax calculation
  const deleteCalculation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tax_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-calculations', user?.id] });
      toast({
        title: "Calculation Deleted",
        description: "Tax calculation has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting calculation",
        description: error.message || "Failed to delete tax calculation.",
        variant: "destructive",
      });
    },
  });

  return {
    savedCalculations,
    isLoading,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
    isSaving: saveCalculation.isPending,
    isUpdating: updateCalculation.isPending,
    isDeleting: deleteCalculation.isPending,
  };
};

/**
 * Hook for TIN validation and formatting
 */
export const useTINValidation = () => {
  const [tin, setTin] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  // Validate and format TIN
  const validateAndFormatTIN = useCallback((inputTin: string) => {
    const formatted = formatPhilippineTIN(inputTin);
    const valid = validatePhilippineTIN(formatted);
    
    setTin(formatted);
    setIsValid(valid);
    
    return { formatted, valid };
  }, []);

  // Update TIN
  const updateTIN = useCallback((newTin: string) => {
    return validateAndFormatTIN(newTin);
  }, [validateAndFormatTIN]);

  return {
    tin,
    isValid,
    updateTIN,
    validateAndFormatTIN,
    setTin
  };
};

/**
 * Hook for quarterly tax calculations
 */
export const useQuarterlyTax = () => {
  const [annualIncome, setAnnualIncome] = useState<number>(0);
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());

  // Calculate quarterly payments
  const { data: quarterlyData, isLoading } = useQuery({
    queryKey: ['quarterly-tax', annualIncome, taxYear],
    queryFn: () => calculateQuarterlyTax(annualIncome, taxYear),
    enabled: annualIncome > 0,
  });

  return {
    annualIncome,
    taxYear,
    quarterlyData,
    isLoading,
    setAnnualIncome,
    setTaxYear
  };
};
