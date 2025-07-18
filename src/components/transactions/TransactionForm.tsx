
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Loader2, X, Eye } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Transaction } from '@/types';
import { ReceiptViewer } from '../receipts/ReceiptViewer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeString, sanitizeNumber } from '@/lib/validation';

interface TransactionFormProps {
  transaction?: Transaction;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  defaultType?: 'income' | 'expense';
}

export const TransactionForm = ({ transaction, isEdit = false, trigger, defaultType = 'expense' }: TransactionFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '',
    type: transaction?.type || defaultType,
    category_id: transaction?.category_id || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { addTransaction, updateTransaction, isAdding, isUpdating } = useTransactions();
  const { categories } = useCategories();
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Allow any file type but warn for very large files
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setReceipt(file);
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
    // Reset the file input
    const fileInput = document.getElementById('receipt') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize and validate form data
    const sanitizedAmount = sanitizeNumber(parseFloat(formData.amount), 0.01, 1000000);
    const sanitizedDescription = sanitizeString(formData.description);

    if (!sanitizedAmount || sanitizedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    if (!sanitizedDescription.trim()) {
      toast({
        title: "Invalid description",
        description: "Please enter a description.",
        variant: "destructive",
      });
      return;
    }

    let receiptUrl = transaction?.receipt_url;
    let receiptName = transaction?.receipt_name;

    // Upload receipt if one is selected
    if (receipt) {
      setUploading(true);
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        const fileExt = receipt.name.split('.').pop() || 'unknown';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Uploading file to path - logging removed for security

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receipt, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error');
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);

        receiptUrl = publicUrl;
        receiptName = receipt.name;
        
        // Receipt uploaded successfully - logging removed for security
      } catch (error: unknown) {
        console.error('Receipt upload failed');
        const errorMessage = error instanceof Error ? error.message : "Failed to upload receipt. Please try again.";
        toast({
          title: "Receipt upload failed",
          description: errorMessage,
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const transactionData = {
      ...formData,
      amount: sanitizedAmount,
      description: sanitizedDescription,
      receipt_url: receiptUrl,
      receipt_name: receiptName,
    };

    try {
      if (isEdit && transaction) {
        updateTransaction({ id: transaction.id, ...transactionData });
      } else {
        addTransaction(transactionData);
      }

      setOpen(false);
      setFormData({
        amount: '',
        type: 'expense',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setReceipt(null);
    } catch (error) {
      console.error('Transaction save failed:', error);
    }
  };

  const isLoading = isAdding || isUpdating || uploading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(cat => cat.type === formData.type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            <div className="space-y-2">
              {/* Show existing receipt if editing and has receipt */}
              {isEdit && transaction?.receipt_url && !receipt && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{transaction.receipt_name}</p>
                      <p className="text-blue-600">Current receipt</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReceiptViewer
                      transaction={transaction}
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}

              {!receipt ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="receipt"
                    type="file"
                    accept="*/*"
                    onChange={handleFileChange}
                    className="file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:text-sm file:bg-gray-100 hover:file:bg-gray-200"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{receipt.name}</p>
                      <p className="text-gray-500">{formatFileSize(receipt.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeReceipt}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                {isEdit && transaction?.receipt_url && !receipt
                  ? "Upload a new file to replace the current receipt, or leave empty to keep existing receipt."
                  : "Upload any file type (images, PDFs, documents, etc.). Max size: 10MB"
                }
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
