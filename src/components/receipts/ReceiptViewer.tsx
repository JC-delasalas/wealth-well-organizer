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
  const [downloading, setDownloading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);
  const { toast } = useToast();

  if (!transaction.receipt_url || !transaction.receipt_name) {
    return null;
  }

  // Get signed URL for private storage access
  const getSignedUrl = async () => {
    if (loadingSignedUrl || signedUrl) return;

    setLoadingSignedUrl(true);
    try {
      // Extract file path from the public URL
      const url = new URL(transaction.receipt_url!);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // user_id/filename

      console.log('Getting signed URL for:', filePath);

      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
      }

      if (data?.signedUrl) {
        console.log('Signed URL created successfully');
        setSignedUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      setImageError(true);
    } finally {
      setLoadingSignedUrl(false);
    }
  };

  // Reset states and get signed URL when modal opens
  React.useEffect(() => {
    if (open) {
      setImageError(false);
      setSignedUrl(null);
      getSignedUrl();
    }
  }, [open]);

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    console.log('File type detection:', fileName, 'extension:', extension);

    // Image formats that browsers can display
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')) {
      console.log('Detected as image');
      return 'image';
    }

    // PDF format
    if (extension === 'pdf') {
      console.log('Detected as PDF');
      return 'pdf';
    }

    // Other formats (documents, spreadsheets, etc.)
    console.log('Detected as other file type');
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
    if (downloading) return; // Prevent multiple simultaneous downloads

    setDownloading(true);
    try {
      console.log('Starting download for:', transaction.receipt_url);

      // Extract file path from the public URL to use with authenticated download
      const url = new URL(transaction.receipt_url!);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // user_id/filename

      console.log('Extracted file path:', filePath);

      // Use Supabase client to download with authentication
      const { data, error } = await supabase.storage
        .from('receipts')
        .download(filePath);

      if (error) {
        console.error('Supabase download error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from download');
      }

      console.log('Downloaded blob:', data.type, data.size);

      // Create download URL
      const downloadUrl = window.URL.createObjectURL(data);

      // Create and trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = transaction.receipt_name || 'receipt';
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: "Download started",
        description: `Downloading ${transaction.receipt_name}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    // Use signed URL if available, otherwise fall back to original URL
    const urlToOpen = signedUrl || transaction.receipt_url;
    window.open(urlToOpen, '_blank');
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

  console.log('ReceiptViewer render:', {
    receiptName: transaction.receipt_name,
    receiptUrl: transaction.receipt_url,
    fileType,
    imageError
  });

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
                {loadingSignedUrl ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading image...</p>
                    </div>
                  </div>
                ) : signedUrl ? (
                  <img
                    src={signedUrl}
                    alt={transaction.receipt_name}
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      console.log('Failed to load image with signed URL:', signedUrl);
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully with signed URL');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Getting image...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : fileType === 'pdf' ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-600 bg-red-50">
                <FileText className="w-12 h-12 text-red-600 mb-3" />
                <p className="text-lg font-medium mb-2">PDF Document</p>
                <p className="text-sm text-gray-600 mb-4 text-center max-w-sm">
                  PDF files cannot be previewed directly. Use the buttons below to download or open in a PDF reader.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} size="sm" disabled={downloading}>
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Download PDF'}
                  </Button>
                  <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in PDF Reader
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                {getFileIcon(transaction.receipt_name)}
                <p className="mt-2 text-sm font-medium">Preview not available</p>
                <p className="text-xs text-gray-400 mb-4">{transaction.receipt_name}</p>
                <Button onClick={handleDownload} size="sm" variant="outline" disabled={downloading}>
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download File'}
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {/* Only show these buttons for images, as PDFs have their own buttons above */}
              {fileType === 'image' && (
                <>
                  <Button onClick={handleDownload} variant="outline" size="sm" disabled={downloading}>
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Download Image'}
                  </Button>
                  <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </>
              )}

              {/* For non-images (except PDF which has buttons above), show download */}
              {fileType !== 'image' && fileType !== 'pdf' && (
                <Button onClick={handleDownload} variant="outline" size="sm" disabled={downloading}>
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download File'}
                </Button>
              )}

              {/* PDF gets its own set of actions */}
              {fileType === 'pdf' && (
                <div className="text-sm text-gray-600">
                  Use the buttons above to download or open the PDF
                </div>
              )}
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
