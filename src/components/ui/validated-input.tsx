/**
 * Validated Input Component with Poka-Yoke Error Prevention
 * Provides real-time validation, auto-correction, and user guidance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Wand2,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  validateTaxInput, 
  formatInputValue, 
  ValidationResult, 
  ValidationRules,
  getSmartSuggestions 
} from '@/utils/taxValidation';

interface ValidatedInputProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: number) => void;
  placeholder?: string;
  helpText?: string;
  validationRules?: ValidationRules;
  className?: string;
  disabled?: boolean;
  autoCorrect?: boolean;
  showSuggestions?: boolean;
  formatCurrency?: (amount: number) => string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  validationRules = {},
  className,
  disabled = false,
  autoCorrect = true,
  showSuggestions = true,
  formatCurrency
}) => {
  const [inputValue, setInputValue] = useState(String(value || ''));
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isFocused, setIsFocused] = useState(false);
  const [showAutoCorrect, setShowAutoCorrect] = useState(false);

  // Update input value when prop changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(value || ''));
    }
  }, [value, isFocused]);

  // Validate input in real-time
  const validateInput = useCallback((inputVal: string) => {
    const result = validateTaxInput(inputVal, label, validationRules);
    setValidation(result);
    
    // Show auto-correct option if there's a corrected value
    setShowAutoCorrect(result.correctedValue !== undefined && result.correctedValue !== parseFloat(inputVal));
    
    return result;
  }, [label, validationRules]);

  // Handle input change with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatInputValue(rawValue);
    
    setInputValue(formattedValue);
    
    // Validate and update parent if valid
    const validationResult = validateInput(formattedValue);
    
    if (validationResult.isValid && formattedValue) {
      const numericValue = parseFloat(formattedValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      }
    } else if (!formattedValue) {
      onChange(0);
    }
  };

  // Handle blur event
  const handleBlur = () => {
    setIsFocused(false);
    
    // Auto-format currency if valid
    if (validation.isValid && inputValue && formatCurrency) {
      const numericValue = parseFloat(inputValue);
      if (!isNaN(numericValue) && numericValue > 0) {
        // Show formatted version briefly, then revert to input format
        setTimeout(() => {
          setInputValue(String(numericValue));
        }, 2000);
      }
    }
  };

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Apply auto-correction
  const applyAutoCorrection = () => {
    if (validation.correctedValue !== undefined) {
      const correctedValue = validation.correctedValue;
      setInputValue(String(correctedValue));
      onChange(correctedValue);
      setShowAutoCorrect(false);
      
      // Re-validate with corrected value
      validateInput(String(correctedValue));
    }
  };

  // Get smart suggestions
  const suggestions = showSuggestions && validation.isValid && inputValue 
    ? getSmartSuggestions(label, parseFloat(inputValue) || 0)
    : [];

  // Determine input styling based on validation state
  const getInputStyling = () => {
    if (disabled) return 'bg-gray-50 text-gray-500';
    if (!validation.isValid) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (validation.warning) return 'border-amber-300 focus:border-amber-500 focus:ring-amber-500';
    if (validation.isValid && inputValue) return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    return '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label with help tooltip */}
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label}
          {validationRules.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Input field with validation styling */}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'transition-all duration-200',
            getInputStyling()
          )}
        />
        
        {/* Validation status icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {!validation.isValid && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          {validation.isValid && validation.warning && (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
          {validation.isValid && !validation.warning && inputValue && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
      </div>

      {/* Auto-correction suggestion */}
      {showAutoCorrect && autoCorrect && validation.correctedValue !== undefined && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Wand2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 flex-1">
            Did you mean {formatCurrency ? formatCurrency(validation.correctedValue) : validation.correctedValue}?
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={applyAutoCorrection}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Apply
          </Button>
        </div>
      )}

      {/* Error message */}
      {!validation.isValid && validation.error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {validation.error}
            {validation.suggestion && (
              <div className="mt-1 text-xs opacity-80">
                💡 {validation.suggestion}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Warning message */}
      {validation.isValid && validation.warning && (
        <Alert className="py-2 border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-700">
            {validation.warning}
          </AlertDescription>
        </Alert>
      )}

      {/* Smart suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-700">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
