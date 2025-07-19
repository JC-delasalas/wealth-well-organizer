
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Target, Settings } from 'lucide-react';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useToast } from '@/hooks/use-toast';
import { SavingsGoal } from '@/types';

interface SavingsGoalFormProps {
  trigger?: React.ReactNode;
  goal?: SavingsGoal;
  isEdit?: boolean;
}

export const SavingsGoalForm = ({ trigger, goal, isEdit = false }: SavingsGoalFormProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    description: goal?.description || '',
    target_amount: goal?.target_amount?.toString() || '',
    current_amount: goal?.current_amount?.toString() || '',
    target_date: goal?.target_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 year from now
    savings_percentage_threshold: goal?.savings_percentage_threshold?.toString() || '20',
    salary_date_1: goal?.salary_date_1?.toString() || '15',
    salary_date_2: goal?.salary_date_2?.toString() || '30',
  });

  const { createSavingsGoal, updateSavingsGoal, isCreating, isUpdating } = useSavingsGoals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data before submission
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Goal name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Target amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.target_date) {
      toast({
        title: "Validation Error",
        description: "Target date is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate target date is in the future
    const targetDate = new Date(formData.target_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate <= today) {
      toast({
        title: "Validation Error",
        description: "Target date must be in the future.",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount || '0'),
      target_date: formData.target_date,
      savings_percentage_threshold: parseFloat(formData.savings_percentage_threshold),
      salary_date_1: parseInt(formData.salary_date_1),
      salary_date_2: parseInt(formData.salary_date_2),
    };

    if (isEdit && goal) {
      updateSavingsGoal({ id: goal.id, ...goalData });
    } else {
      createSavingsGoal(goalData);
    }

    setOpen(false);
    setFormData({
      name: '',
      description: '',
      target_amount: '',
      current_amount: '',
      target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
            {isEdit ? 'Update Savings Goal' : 'Create Savings Goal'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your savings goal details and track your progress.'
              : 'Set up a new savings goal to track your financial progress.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Emergency Fund"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Save for unexpected expenses"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Amount ($)</Label>
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
            <Label htmlFor="current_amount">Current Amount ($)</Label>
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
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              required
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
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isEdit
                ? (isUpdating ? 'Updating...' : 'Update Goal')
                : (isCreating ? 'Creating...' : 'Create Goal')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
