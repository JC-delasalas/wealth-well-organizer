/**
 * Poka-Yoke Error Prevention Utilities for Philippine Tax Calculators
 * Implements robust input validation, auto-correction, and user guidance
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestion?: string;
  correctedValue?: number;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  required?: boolean;
  allowDecimals?: boolean;
  maxDecimals?: number;
}

/**
 * Comprehensive input validation with auto-correction
 */
export const validateTaxInput = (
  value: string | number,
  fieldName: string,
  rules: ValidationRules = {}
): ValidationResult => {
  const {
    min = 0,
    max = 999999999,
    required = false,
    allowDecimals = true,
    maxDecimals = 2
  } = rules;

  // Convert to string for processing
  const stringValue = String(value).trim();
  
  // Check if empty
  if (!stringValue) {
    if (required) {
      return {
        isValid: false,
        error: `${fieldName} is required`,
        suggestion: 'Please enter a valid amount'
      };
    }
    return { isValid: true };
  }

  // Remove common formatting characters
  const cleanValue = stringValue
    .replace(/[₱,\s]/g, '') // Remove peso sign, commas, spaces
    .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and minus

  // Check for valid number format
  if (!/^-?\d*\.?\d*$/.test(cleanValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
      suggestion: 'Enter numbers only (e.g., 50000 or 50,000)'
    };
  }

  const numericValue = parseFloat(cleanValue);

  // Check if it's a valid number
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
      suggestion: 'Enter a numeric value'
    };
  }

  // Check for negative values (most tax inputs shouldn't be negative)
  if (numericValue < 0 && min >= 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be negative`,
      suggestion: 'Enter a positive amount',
      correctedValue: 0
    };
  }

  // Check minimum value
  if (numericValue < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${formatCurrency(min)}`,
      suggestion: `Minimum value is ${formatCurrency(min)}`,
      correctedValue: min
    };
  }

  // Check maximum value
  if (numericValue > max) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed ${formatCurrency(max)}`,
      suggestion: `Maximum value is ${formatCurrency(max)}`,
      correctedValue: max
    };
  }

  // Check decimal places
  if (!allowDecimals && numericValue % 1 !== 0) {
    return {
      isValid: false,
      error: `${fieldName} must be a whole number`,
      suggestion: 'Remove decimal places',
      correctedValue: Math.round(numericValue)
    };
  }

  // Check maximum decimal places
  if (allowDecimals && maxDecimals > 0) {
    const decimalPlaces = (cleanValue.split('.')[1] || '').length;
    if (decimalPlaces > maxDecimals) {
      const corrected = Math.round(numericValue * Math.pow(10, maxDecimals)) / Math.pow(10, maxDecimals);
      return {
        isValid: false,
        error: `${fieldName} can have at most ${maxDecimals} decimal places`,
        suggestion: `Rounded to ${maxDecimals} decimal places`,
        correctedValue: corrected
      };
    }
  }

  // Provide warnings for unusual values
  let warning: string | undefined;
  
  // Warning for very large amounts
  if (numericValue > 10000000) { // 10 million
    warning = 'This is a very large amount. Please verify it is correct.';
  }
  
  // Warning for very small non-zero amounts
  if (numericValue > 0 && numericValue < 1) {
    warning = 'This is a very small amount. Please verify it is correct.';
  }

  return {
    isValid: true,
    warning,
    correctedValue: numericValue
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Auto-format input as user types
 */
export const formatInputValue = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Prevent multiple decimal points
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 2
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleaned;
};

/**
 * Validate specific tax calculator fields
 */
export const validateIndividualTaxFields = {
  grossIncome: (value: string | number) => validateTaxInput(value, 'Gross Income', {
    min: 0,
    max: 100000000, // 100 million
    required: true
  }),
  
  thirteenthMonthPay: (value: string | number) => validateTaxInput(value, '13th Month Pay', {
    min: 0,
    max: 1000000 // 1 million
  }),
  
  otherBenefits: (value: string | number) => validateTaxInput(value, 'Other Benefits', {
    min: 0,
    max: 1000000
  }),
  
  itemizedDeductions: (value: string | number) => validateTaxInput(value, 'Itemized Deductions', {
    min: 0,
    max: 10000000 // 10 million
  }),
  
  withholdingTax: (value: string | number) => validateTaxInput(value, 'Withholding Tax', {
    min: 0,
    max: 50000000 // 50 million
  })
};

export const validateBusinessTaxFields = {
  grossReceipts: (value: string | number) => validateTaxInput(value, 'Gross Receipts', {
    min: 0,
    max: 1000000000, // 1 billion
    required: true
  }),
  
  totalDeductions: (value: string | number) => validateTaxInput(value, 'Total Deductions', {
    min: 0,
    max: 1000000000
  })
};

export const validateWithholdingTaxFields = {
  amount: (value: string | number) => validateTaxInput(value, 'Income Amount', {
    min: 0,
    max: 100000000,
    required: true
  })
};

/**
 * Smart suggestions based on input patterns
 */
export const getSmartSuggestions = (fieldName: string, value: number): string[] => {
  const suggestions: string[] = [];
  
  if (fieldName.toLowerCase().includes('gross') && value > 0) {
    // Suggest common salary ranges
    if (value < 20000) {
      suggestions.push('Consider if this is monthly or annual income');
    } else if (value > 50000 && value < 600000) {
      suggestions.push('This looks like monthly income - remember to use annual amounts');
    }
  }
  
  if (fieldName.toLowerCase().includes('withholding') && value > 0) {
    // Suggest reasonable withholding tax ranges
    const grossIncome = value * 10; // Rough estimate
    if (value > grossIncome * 0.3) {
      suggestions.push('Withholding tax seems high - please verify the amount');
    }
  }
  
  return suggestions;
};
