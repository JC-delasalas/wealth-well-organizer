import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Loader2, X, Camera, FileImage } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { useMobileFileUpload } from '@/hooks/useMobileFileUpload';
import { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { sanitizeString, sanitizeNumber } from '@/lib/validation';
import { MobileButton } from '@/components/ui/mobile-button';

interface MobileTransactionFormProps {
  transaction?: Transaction;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  defaultType?: 'income' | 'expense';
}

export const MobileTransactionForm = ({ 
  transaction, 
  isEdit = false, 
  trigger, 
  defaultType = 'expense' 
}: MobileTransactionFormProps) => {
  const [open, setOpen] = useState(false);
  const { isMobile, isTouchDevice } = useDeviceInfo();
  const { savingsGoals } = useSavingsGoals();
  const { standard: formatCurrency } = useCurrencyFormatter();
  const { uploadFile, isCapturing } = useMobileFileUpload();
  
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '',
    type: transaction?.type || defaultType,
    category_id: transaction?.category_id || '',
    savings_goal_id: transaction?.savings_goal_id || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });
  
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { addTransaction, updateTransaction, isAdding, isUpdating } = useTransactions();
  const { categories } = useCategories();
  const { toast } = useToast();

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? sanitizeNumber(value) : sanitizeString(value)
    }));
  };

  const handleReceiptCapture = async (source?: 'camera' | 'gallery') => {
    try {
      const capturedFile = await uploadFile(source);
      setReceipt(capturedFile.file);
      setReceiptPreview(capturedFile.dataUrl);
      
      toast({
        title: "Receipt captured",
        description: `Receipt captured from ${capturedFile.source}`,
      });
    } catch (error) {
      console.error('Receipt capture failed:', error);
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category_id) {
      toast({
        title: "Missing required fields",
        description: "Please fill in amount, description, and category.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      const transactionData = {
        ...formData,
        amount: Number(formData.amount),
        receipt_file: receipt,
      };

      if (isEdit && transaction) {
        await updateTransaction({ id: transaction.id, ...transactionData });
      } else {
        await addTransaction(transactionData);
      }
      
      setOpen(false);
      setFormData({
        amount: '',
        type: defaultType,
        category_id: '',
        savings_goal_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setReceipt(null);
      setReceiptPreview(null);
    } catch (error) {
      console.error('Transaction submission failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // Use Sheet for mobile, Dialog for desktop
  const FormWrapper = isMobile ? Sheet : Sheet; // Always use Sheet for better mobile UX
  const FormContent = isMobile ? SheetContent : SheetContent;
  const FormHeader = isMobile ? SheetHeader : SheetHeader;
  const FormTitle = isMobile ? SheetTitle : SheetTitle;
  const FormTrigger = isMobile ? SheetTrigger : SheetTrigger;

  return (
    <FormWrapper open={open} onOpenChange={setOpen}>
      <FormTrigger asChild>
        {trigger || (
          <MobileButton 
            size={isMobile ? "mobile-fab" : "default"}
            className={isMobile ? "fixed bottom-6 right-6 z-50 shadow-lg" : ""}
          >
            <Plus className="h-5 w-5" />
            {!isMobile && <span className="ml-2">Add Transaction</span>}
          </MobileButton>
        )}
      </FormTrigger>
      
      <FormContent 
        className={isMobile ? "w-full max-w-full h-full" : "max-w-md"}
        side={isMobile ? "bottom" : "right"}
      >
        <FormHeader className="pb-6">
          <FormTitle className="text-xl font-semibold">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </FormTitle>
        </FormHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <MobileButton
              type="button"
              variant={formData.type === 'expense' ? 'default' : 'outline'}
              onClick={() => handleInputChange('type', 'expense')}
              className="h-12"
            >
              Expense
            </MobileButton>
            <MobileButton
              type="button"
              variant={formData.type === 'income' ? 'default' : 'outline'}
              onClick={() => handleInputChange('type', 'income')}
              className="h-12"
            >
              Income
            </MobileButton>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="h-12 text-lg"
              inputMode="decimal"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Category *</Label>
            <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-medium">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="h-12"
            />
          </div>

          {/* Receipt Upload */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Receipt (Optional)</Label>
            
            {!receipt && (
              <div className="grid grid-cols-2 gap-3">
                <MobileButton
                  type="button"
                  variant="outline"
                  onClick={() => handleReceiptCapture('camera')}
                  disabled={isCapturing}
                  className="h-12"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </MobileButton>
                <MobileButton
                  type="button"
                  variant="outline"
                  onClick={() => handleReceiptCapture('gallery')}
                  disabled={isCapturing}
                  className="h-12"
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Gallery
                </MobileButton>
              </div>
            )}

            {receiptPreview && (
              <div className="relative">
                <img 
                  src={receiptPreview} 
                  alt="Receipt preview" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeReceipt}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <MobileButton
            type="submit"
            disabled={isAdding || isUpdating || uploading}
            className="w-full h-12 text-base font-medium"
          >
            {(isAdding || isUpdating || uploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Update Transaction' : 'Add Transaction'}
          </MobileButton>
        </form>
      </FormContent>
    </FormWrapper>
  );
};
