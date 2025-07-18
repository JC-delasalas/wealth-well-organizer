import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Tag, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { CategoryForm } from './CategoryForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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

/**
 * CategoriesPage component displays and manages user's transaction categories
 * Features category creation, editing, and deletion with full CRUD operations
 */
export const CategoriesPage = () => {
  const navigate = useNavigate();
  const { categories, isLoading, deleteCategory, getCategoryUsage, isDeleting } = useCategories();
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [categoryUsage, setCategoryUsage] = useState<Record<string, { transactionCount: number; budgetCount: number; totalUsage: number }>>({});

  // Load category usage information
  useEffect(() => {
    const loadCategoryUsage = async () => {
      if (!categories.length) return;

      const usageData: Record<string, { transactionCount: number; budgetCount: number; totalUsage: number }> = {};

      for (const category of categories) {
        try {
          const usage = await getCategoryUsage(category.id);
          usageData[category.id] = usage;
        } catch (error) {
          console.error(`Error loading usage for category ${category.id}:`, error);
          usageData[category.id] = { transactionCount: 0, budgetCount: 0, totalUsage: 0 };
        }
      }

      setCategoryUsage(usageData);
    };

    loadCategoryUsage();
  }, [categories, getCategoryUsage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleDeleteCategory = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    deleteCategory(categoryId);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

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
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">Organize your transactions with custom categories</p>
            </div>
          </div>
          
          <CategoryForm
            trigger={
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </Button>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-600" />
                Expense Categories
                <Badge variant="secondary">{expenseCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategories.length > 0 ? (
                <div className="space-y-3">
                  {expenseCategories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                          {categoryUsage[category.id] && (
                            <div className="flex items-center gap-2 mt-1">
                              {categoryUsage[category.id].transactionCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {categoryUsage[category.id].transactionCount} transaction{categoryUsage[category.id].transactionCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                              {categoryUsage[category.id].budgetCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {categoryUsage[category.id].budgetCount} budget{categoryUsage[category.id].budgetCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CategoryForm
                          category={category}
                          isEdit={true}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isDeleting && deletingCategoryId === category.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                {categoryUsage[category.id]?.totalUsage > 0 && (
                                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                                Delete Category?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>Are you sure you want to delete "{category.name}"? This action cannot be undone.</p>

                                {categoryUsage[category.id]?.totalUsage > 0 ? (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-sm">
                                        <p className="font-medium text-amber-800 mb-1">Category is currently in use:</p>
                                        <ul className="text-amber-700 space-y-1">
                                          {categoryUsage[category.id].transactionCount > 0 && (
                                            <li>• {categoryUsage[category.id].transactionCount} transaction{categoryUsage[category.id].transactionCount > 1 ? 's' : ''}</li>
                                          )}
                                          {categoryUsage[category.id].budgetCount > 0 && (
                                            <li>• {categoryUsage[category.id].budgetCount} budget{categoryUsage[category.id].budgetCount > 1 ? 's' : ''}</li>
                                          )}
                                        </ul>
                                        <p className="mt-2 text-amber-800">
                                          Deletion will fail. Please reassign or delete these items first.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                                      <p className="text-sm text-green-800">
                                        This category is not being used and can be safely deleted.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.id)}
                                className={
                                  categoryUsage[category.id]?.totalUsage > 0
                                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                }
                                disabled={isDeleting || (categoryUsage[category.id]?.totalUsage > 0)}
                              >
                                {isDeleting && deletingCategoryId === category.id
                                  ? 'Deleting...'
                                  : categoryUsage[category.id]?.totalUsage > 0
                                    ? 'Cannot Delete'
                                    : 'Delete Category'
                                }
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expense Categories</h3>
                  <p className="text-gray-600 mb-4">Create categories to organize your expenses</p>
                  <CategoryForm
                    trigger={
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Expense Category
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                Income Categories
                <Badge variant="secondary">{incomeCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomeCategories.length > 0 ? (
                <div className="space-y-3">
                  {incomeCategories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                          {categoryUsage[category.id] && (
                            <div className="flex items-center gap-2 mt-1">
                              {categoryUsage[category.id].transactionCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {categoryUsage[category.id].transactionCount} transaction{categoryUsage[category.id].transactionCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                              {categoryUsage[category.id].budgetCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {categoryUsage[category.id].budgetCount} budget{categoryUsage[category.id].budgetCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CategoryForm
                          category={category}
                          isEdit={true}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isDeleting && deletingCategoryId === category.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                {categoryUsage[category.id]?.totalUsage > 0 && (
                                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                                Delete Category?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>Are you sure you want to delete "{category.name}"? This action cannot be undone.</p>

                                {categoryUsage[category.id]?.totalUsage > 0 ? (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-sm">
                                        <p className="font-medium text-amber-800 mb-1">Category is currently in use:</p>
                                        <ul className="text-amber-700 space-y-1">
                                          {categoryUsage[category.id].transactionCount > 0 && (
                                            <li>• {categoryUsage[category.id].transactionCount} transaction{categoryUsage[category.id].transactionCount > 1 ? 's' : ''}</li>
                                          )}
                                          {categoryUsage[category.id].budgetCount > 0 && (
                                            <li>• {categoryUsage[category.id].budgetCount} budget{categoryUsage[category.id].budgetCount > 1 ? 's' : ''}</li>
                                          )}
                                        </ul>
                                        <p className="mt-2 text-amber-800">
                                          Deletion will fail. Please reassign or delete these items first.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                                      <p className="text-sm text-green-800">
                                        This category is not being used and can be safely deleted.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.id)}
                                className={
                                  categoryUsage[category.id]?.totalUsage > 0
                                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                }
                                disabled={isDeleting || (categoryUsage[category.id]?.totalUsage > 0)}
                              >
                                {isDeleting && deletingCategoryId === category.id
                                  ? 'Deleting...'
                                  : categoryUsage[category.id]?.totalUsage > 0
                                    ? 'Cannot Delete'
                                    : 'Delete Category'
                                }
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Income Categories</h3>
                  <p className="text-gray-600 mb-4">Create categories to organize your income sources</p>
                  <CategoryForm
                    trigger={
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Income Category
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
