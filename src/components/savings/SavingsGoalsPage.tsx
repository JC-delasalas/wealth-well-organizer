import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Target, Plus, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { SavingsGoalForm } from './SavingsGoalForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * SavingsGoalsPage component displays and manages user's savings goals
 * Features goal creation, progress tracking, and goal management
 */
export const SavingsGoalsPage = () => {
  const navigate = useNavigate();
  const { savingsGoals: goals, isLoading, deleteSavingsGoal, isDeleting } = useSavingsGoals();
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDeleteGoal = (goalId: string) => {
    setDeletingGoalId(goalId);
    deleteSavingsGoal(goalId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
              <p className="text-gray-600 mt-1">Track and manage your financial objectives</p>
            </div>
          </div>
          
          <SavingsGoalForm
            trigger={
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Goal</span>
              </Button>
            }
          />
        </div>

        {/* Goals Grid */}
        {goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = calculateProgress(goal.current_amount, goal.target_amount);
              const daysRemaining = getDaysRemaining(goal.target_date);
              const isOverdue = daysRemaining < 0;
              const isCompleted = progress >= 100;

              return (
                <Card key={goal.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg font-semibold truncate">
                          {goal.name}
                        </CardTitle>
                      </div>
                      {isCompleted && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Completed
                        </div>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Amount</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(goal.current_amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          of {formatCurrency(goal.target_amount)}
                        </div>
                      </div>
                    </div>

                    {/* Target Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Target Date</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatDate(goal.target_date)}
                        </div>
                        <div className={`text-xs ${
                          isOverdue ? 'text-red-600' : 
                          daysRemaining <= 30 ? 'text-orange-600' : 
                          'text-gray-500'
                        }`}>
                          {isOverdue 
                            ? `${Math.abs(daysRemaining)} days overdue`
                            : `${daysRemaining} days remaining`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t">
                      <div className="flex gap-2">
                        <SavingsGoalForm
                          goal={goal}
                          isEdit={true}
                          trigger={
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          }
                        />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isDeleting && deletingGoalId === goal.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {isDeleting && deletingGoalId === goal.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Savings Goal?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{goal.name}"? This action cannot be undone and will permanently remove this goal and all its progress data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isDeleting}
                              >
                                {isDeleting && deletingGoalId === goal.id ? 'Deleting...' : 'Delete Goal'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Savings Goals Yet</h3>
              <p className="text-gray-600 mb-6">
                Start building your financial future by setting your first savings goal.
              </p>
              <SavingsGoalForm
                trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Goal
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
