import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  Download, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon,
  File,
  Trash2,
  Eye
} from 'lucide-react';
import { Transaction } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface ReceiptViewerProps {
  transaction: Transaction;
  trigger?: React.ReactNode;
  onReceiptDeleted?: () => void;
}

/**
 * ReceiptViewer component for viewing, downloading, and managing transaction receipts
 * Supports images, PDFs, and other file types with appropriate viewers
 */
export const ReceiptViewer = ({ transaction, trigger, onReceiptDeleted }: ReceiptViewerProps) => {
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  if (!transaction.receipt_url || !transaction.receipt_name) {
    return null;
  }

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const getFileIcon = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (url: string) => {
    // This is a placeholder - in a real app you might want to store file size
    return 'Unknown size';
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(transaction.receipt_url!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = transaction.receipt_name || 'receipt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${transaction.receipt_name}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenInNewTab = () => {
    window.open(transaction.receipt_url, '_blank');
  };

  const handleDeleteReceipt = async () => {
    setDeleting(true);
    try {
      // Extract file path from URL
      const url = new URL(transaction.receipt_url!);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // user_id/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

      if (storageError) {
        throw storageError;
      }

      // Update transaction to remove receipt references
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          receipt_url: null, 
          receipt_name: null 
        })
        .eq('id', transaction.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Receipt deleted",
        description: "Receipt has been successfully deleted.",
      });

      setOpen(false);
      onReceiptDeleted?.();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const fileType = getFileType(transaction.receipt_name);

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
      <Receipt className="w-4 h-4 mr-2" />
      View Receipt
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon(transaction.receipt_name)}
            Receipt: {transaction.receipt_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Transaction Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-gray-600">
                ${transaction.amount.toLocaleString()} • {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
              {transaction.type}
            </Badge>
          </div>

          {/* Receipt Preview */}
          <div className="border rounded-lg overflow-hidden bg-white">
            {fileType === 'image' && !imageError ? (
              <div className="max-h-96 overflow-auto">
                <img
                  src={transaction.receipt_url}
                  alt={transaction.receipt_name}
                  className="w-full h-auto"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : fileType === 'pdf' ? (
              <div className="h-96">
                <iframe
                  src={transaction.receipt_url}
                  className="w-full h-full"
                  title={transaction.receipt_name}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                {getFileIcon(transaction.receipt_name)}
                <p className="mt-2 text-sm">Preview not available for this file type</p>
                <p className="text-xs text-gray-400">{transaction.receipt_name}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete Receipt'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this receipt "{transaction.receipt_name}"? 
                    This action cannot be undone and will permanently remove the file from storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteReceipt}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Receipt'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
