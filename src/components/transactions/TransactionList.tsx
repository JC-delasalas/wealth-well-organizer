
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Receipt, ArrowUpRight, ArrowDownRight, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils';

export const TransactionList = () => {
  const navigate = useNavigate();
  const { transactions, deleteTransaction, isDeleting } = useTransactions();
  const { categories } = useCategories();

  const getCategoryInfo = (categoryId: string | null) => {
    return categories.find(cat => cat.id === categoryId) || {
      name: 'Unknown',
      icon: 'HelpCircle',
      color: '#6b7280'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-1">Manage your income and expenses</p>
            </div>
          </div>

          <TransactionForm
            trigger={
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </Button>
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No transactions yet. Add your first transaction to get started!
            </p>
          ) : (
            transactions.map((transaction) => {
              const category = getCategoryInfo(transaction.category_id);
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-6 h-6" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {category.name}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </span>
                        {transaction.receipt_url && (
                          <Receipt className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold text-lg",
                        isIncome ? "text-green-600" : "text-red-600"
                      )}>
                        {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TransactionForm
                        transaction={transaction}
                        isEdit={true}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
