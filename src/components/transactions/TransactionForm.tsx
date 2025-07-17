
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Transaction } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  transaction?: Transaction;
  isEdit?: boolean;
  trigger?: React.ReactNode;
}

export const TransactionForm = ({ transaction, isEdit = false, trigger }: TransactionFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '',
    type: transaction?.type || 'expense',
    category_id: transaction?.category_id || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { addTransaction, updateTransaction, isAdding, isUpdating } = useTransactions();
  const { categories } = useCategories();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let receiptUrl = transaction?.receipt_url;
    let receiptName = transaction?.receipt_name;

    // Upload receipt if one is selected
    if (receipt) {
      setUploading(true);
      try {
        const fileExt = receipt.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${supabase.auth.getUser()}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receipt);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);

        receiptUrl = publicUrl;
        receiptName = receipt.name;
      } catch (error: any) {
        toast({
          title: "Receipt upload failed",
          description: error.message,
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount as string),
      receipt_url: receiptUrl,
      receipt_name: receiptName,
    };

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
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              />
              {receipt && (
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
              )}
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
