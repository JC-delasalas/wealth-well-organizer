
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Settings } from 'lucide-react';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';

interface SavingsGoalFormProps {
  trigger?: React.ReactNode;
}

export const SavingsGoalForm = ({ trigger }: SavingsGoalFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    target_amount: '',
    current_amount: '',
    savings_percentage_threshold: '20',
    salary_date_1: '15',
    salary_date_2: '30',
  });

  const { createSavingsGoal, isCreating } = useSavingsGoals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createSavingsGoal({
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount || '0'),
      savings_percentage_threshold: parseFloat(formData.savings_percentage_threshold),
      salary_date_1: parseInt(formData.salary_date_1),
      salary_date_2: parseInt(formData.salary_date_2),
    });

    setOpen(false);
    setFormData({
      target_amount: '',
      current_amount: '',
      savings_percentage_threshold: '20',
      salary_date_1: '15',
      salary_date_2: '30',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-primary text-white">
            <Target className="w-4 h-4 mr-2" />
            Set Savings Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure Savings Goal & Thresholds
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Savings Amount ($)</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              placeholder="10000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_amount">Current Savings ($)</Label>
            <Input
              id="current_amount"
              type="number"
              step="0.01"
              value={formData.current_amount}
              onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings_threshold">Savings Threshold (%)</Label>
            <Input
              id="savings_threshold"
              type="number"
              min="1"
              max="100"
              value={formData.savings_percentage_threshold}
              onChange={(e) => setFormData({ ...formData, savings_percentage_threshold: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              You'll get alerts if your savings rate falls below this percentage
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_date_1">First Salary Date</Label>
              <Input
                id="salary_date_1"
                type="number"
                min="1"
                max="31"
                value={formData.salary_date_1}
                onChange={(e) => setFormData({ ...formData, salary_date_1: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_date_2">Second Salary Date</Label>
              <Input
                id="salary_date_2"
                type="number"
                min="1"
                max="31"
                value={formData.salary_date_2}
                onChange={(e) => setFormData({ ...formData, salary_date_2: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
