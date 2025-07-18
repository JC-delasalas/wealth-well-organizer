import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Receipt, 
  Search, 
  Filter,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { ReceiptViewer } from './ReceiptViewer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * ReceiptsPage component displays and manages all transaction receipts
 * Features search, filtering, and bulk operations for receipt management
 */
export const ReceiptsPage = () => {
  const navigate = useNavigate();
  const { transactions, isLoading } = useTransactions();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');

  // Filter transactions that have receipts
  const transactionsWithReceipts = useMemo(() => {
    return transactions.filter(transaction => 
      transaction.receipt_url && transaction.receipt_name
    );
  }, [transactions]);

  // Apply filters and search
  const filteredTransactions = useMemo(() => {
    let filtered = transactionsWithReceipts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.receipt_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category_id === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'name':
          return (a.receipt_name || '').localeCompare(b.receipt_name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactionsWithReceipts, searchTerm, filterType, filterCategory, sortBy]);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Image formats
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')) {
      return <ImageIcon className="w-4 h-4 text-blue-600" />;
    }

    // PDF format
    if (extension === 'pdf') {
      return <FileText className="w-4 h-4 text-red-600" />;
    }

    // Other formats
    return <File className="w-4 h-4 text-gray-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleBulkDownload = async () => {
    // This would require a more complex implementation with zip files
    // For now, we'll show a message about the feature
    alert('Bulk download feature coming soon! For now, download receipts individually by viewing each receipt.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Receipt Manager</h1>
              <p className="text-gray-600 mt-1">
                View and manage all your transaction receipts ({filteredTransactions.length} receipts)
              </p>
            </div>
          </div>
          
          {filteredTransactions.length > 0 && (
            <Button onClick={handleBulkDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Bulk Download
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="name">File Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipts Grid */}
        {filteredTransactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* File Info */}
                    <div className="flex items-center space-x-2">
                      {getFileIcon(transaction.receipt_name!)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.receipt_name}
                        </p>
                        <p className="text-xs text-gray-500">Receipt</p>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </span>
                        </div>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                        <span className="truncate ml-2">{getCategoryName(transaction.category_id)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t">
                      <ReceiptViewer
                        transaction={transaction}
                        trigger={
                          <Button variant="outline" size="sm" className="w-full">
                            <Receipt className="w-4 h-4 mr-2" />
                            View Receipt
                          </Button>
                        }
                        onReceiptDeleted={() => {
                          // Refresh the data - this will be handled by React Query
                          window.location.reload();
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {transactionsWithReceipts.length === 0 ? 'No Receipts Found' : 'No Matching Receipts'}
              </h3>
              <p className="text-gray-600 mb-6">
                {transactionsWithReceipts.length === 0 
                  ? 'Upload receipts when creating transactions to see them here.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {transactionsWithReceipts.length === 0 && (
                <Button onClick={() => navigate('/transactions')}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Add Transaction with Receipt
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
