// Enhanced Transaction Form with Savings Goal Selection
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  PiggyBank, 
  Target, 
  Calculator, 
  Info,
  Plus
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types';

interface SavingsTransactionFormProps {
  trigger?: React.ReactNode;
  transaction?: Transaction;
  isEdit?: boolean;
  defaultSavingsGoalId?: string;
}

export const SavingsTransactionForm: React.FC<SavingsTransactionFormProps> = ({
  trigger,
  transaction,
  isEdit = false,
  defaultSavingsGoalId
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createTransaction, updateTransaction } = useTransactions();
  const { categories } = useCategories();
  const { savingsGoals } = useSavingsGoals();
  const { standard: formatCurrency } = useCurrencyFormatter();

  // Find savings category
  const savingsCategory = categories.find(cat => 
    cat.name === 'Savings' && cat.type === 'expense'
  );

  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    savings_goal_id: transaction?.savings_goal_id || defaultSavingsGoalId || '',
    category_id: transaction?.category_id || savingsCategory?.id || '',
    type: 'expense' as const, // Savings are always expenses (money going out)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.savings_goal_id) {
      toast({
        title: "Savings Goal Required",
        description: "Please select a savings goal for this transaction.",
        variant: "destructive",
      });
      return;
    }

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        type: formData.type,
        category_id: formData.category_id || savingsCategory?.id || null,
        savings_goal_id: formData.savings_goal_id,
      };

      if (isEdit && transaction) {
        await updateTransaction({ id: transaction.id, ...transactionData });
        toast({
          title: "Savings Transaction Updated",
          description: "Your savings transaction has been updated successfully.",
        });
      } else {
        await createTransaction(transactionData);
        toast({
          title: "Savings Transaction Added",
          description: "Your savings transaction has been recorded and will update your goal progress.",
        });
      }

      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save savings transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      savings_goal_id: defaultSavingsGoalId || '',
      category_id: savingsCategory?.id || '',
      type: 'expense',
    });
  };

  const selectedGoal = savingsGoals.find(goal => goal.id === formData.savings_goal_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            Add Savings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            {isEdit ? 'Edit Savings Transaction' : 'Add Savings Transaction'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your savings transaction details and track your progress.'
              : 'Record a new savings transaction to track your financial goals.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Savings Goal Selection */}
          <div className="space-y-2">
            <Label htmlFor="savings_goal_id" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Savings Goal
            </Label>
            <Select 
              value={formData.savings_goal_id} 
              onValueChange={(value) => setFormData({ ...formData, savings_goal_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a savings goal" />
              </SelectTrigger>
              <SelectContent>
                {savingsGoals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{goal.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Selected Goal Info */}
            {selectedGoal && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-800">{selectedGoal.name}</span>
                  <Badge variant="secondary">
                    {selectedGoal.target_amount > 0 
                      ? `${((selectedGoal.current_amount / selectedGoal.target_amount) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </Badge>
                </div>
                <div className="text-sm text-blue-700">
                  Current: {formatCurrency(selectedGoal.current_amount)} | 
                  Target: {formatCurrency(selectedGoal.target_amount)}
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Monthly savings transfer, Emergency fund contribution"
              required
            />
          </div>

          {/* Date */}
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

          {/* Information Box */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Calculator className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Automatic Progress Update</p>
                <p>
                  This transaction will automatically update your savings goal progress. 
                  The current amount will be recalculated in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update Savings' : 'Add Savings'}
            </Button>
          </div>
        </form>

        {/* No Goals Warning */}
        {savingsGoals.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">No Savings Goals Found</p>
                <p>
                  You need to create a savings goal first before adding savings transactions.
                </p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setOpen(false);
                    // Navigate to savings goals page
                    window.location.href = '/savings';
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Create Savings Goal
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
