import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReceiptViewer } from '../ReceiptViewer';
import { Transaction } from '@/types';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null }),
        download: vi.fn().mockResolvedValue({
          data: new Blob(['test'], { type: 'image/jpeg' }),
          error: null
        }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed-url.com/test.jpg' },
          error: null
        }),
      })),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ReceiptViewer', () => {
  const mockTransaction: Transaction = {
    id: '1',
    amount: 25.99,
    type: 'expense',
    category_id: 'cat1',
    description: 'Coffee Shop',
    date: '2024-01-15',
    receipt_url: 'https://example.com/storage/v1/object/public/receipts/user1/receipt.jpg',
    receipt_name: 'coffee_receipt.jpg',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user_id: 'user1',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when no receipt exists', () => {
    const transactionWithoutReceipt = { ...mockTransaction, receipt_url: undefined, receipt_name: undefined };
    
    const { container } = render(
      <ReceiptViewer transaction={transactionWithoutReceipt} />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders receipt viewer trigger button', () => {
    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('View Receipt')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('text-blue-600');
  });

  it('opens dialog when trigger is clicked', () => {
    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    expect(screen.getByText('Receipt: coffee_receipt.jpg')).toBeInTheDocument();
    expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
    expect(screen.getByText('$25.99 • 1/15/2024')).toBeInTheDocument();
  });

  it('displays image preview for image files with signed URL', async () => {
    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    // Should show loading state first
    expect(screen.getByText('Loading image...')).toBeInTheDocument();

    // Wait for signed URL to load
    await waitFor(() => {
      const image = screen.getByAltText('coffee_receipt.jpg');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://signed-url.com/test.jpg');
    });
  });

  it('displays PDF download options instead of preview', () => {
    const pdfTransaction = {
      ...mockTransaction,
      receipt_name: 'receipt.pdf',
      receipt_url: 'https://example.com/storage/v1/object/public/receipts/user1/receipt.pdf',
    };

    render(
      <ReceiptViewer transaction={pdfTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    expect(screen.getByText('PDF Document')).toBeInTheDocument();
    expect(screen.getByText(/PDF files cannot be previewed directly/)).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByText('Open in PDF Reader')).toBeInTheDocument();

    // Should not have iframe
    expect(screen.queryByTitle('receipt.pdf')).not.toBeInTheDocument();
  });

  it('shows download option for unsupported file types', () => {
    const docTransaction = {
      ...mockTransaction,
      receipt_name: 'receipt.doc',
      receipt_url: 'https://example.com/storage/v1/object/public/receipts/user1/receipt.doc',
    };

    render(
      <ReceiptViewer transaction={docTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    expect(screen.getByText('Preview not available')).toBeInTheDocument();
    expect(screen.getByText('receipt.doc')).toBeInTheDocument();
    // There are two "Download File" buttons (preview area + actions area)
    const downloadButtons = screen.getAllByText('Download File');
    expect(downloadButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('supports additional image formats', async () => {
    const webpTransaction = {
      ...mockTransaction,
      receipt_name: 'receipt.webp',
      receipt_url: 'https://example.com/storage/v1/object/public/receipts/user1/receipt.webp',
    };

    render(
      <ReceiptViewer transaction={webpTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    // Wait for signed URL to load (async operation)
    await waitFor(() => {
      const image = screen.getByAltText('receipt.webp');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://signed-url.com/test.jpg');
    });
  });

  it('provides download functionality using Supabase storage', async () => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    global.URL.revokeObjectURL = vi.fn();

    // Render first so React can use the real createElement
    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    // Wait for the component to fully load (signed URL)
    await waitFor(() => {
      expect(screen.getByText('Download Image')).toBeInTheDocument();
    });

    // Now mock document methods for the download action only
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      style: { display: '' },
    };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLElement;
      return originalCreateElement(tag);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as unknown as Node);

    fireEvent.click(screen.getByText('Download Image'));

    await waitFor(() => {
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  it('provides open in new tab functionality', async () => {
    const mockOpen = vi.fn();
    global.window.open = mockOpen;

    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    // Wait for signed URL to load so action buttons appear
    await waitFor(() => {
      expect(screen.getByText('Open in New Tab')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Open in New Tab'));

    // Should open with signed URL since it's available
    expect(mockOpen).toHaveBeenCalledWith(expect.any(String), '_blank');
  });

  it('shows delete confirmation dialog', () => {
    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));
    fireEvent.click(screen.getByText('Delete Receipt'));

    expect(screen.getByText('Delete Receipt?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this receipt/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    // Multiple "Delete Receipt" texts exist (trigger button + dialog action button)
    const deleteTexts = screen.getAllByText('Delete Receipt');
    expect(deleteTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('handles receipt deletion', async () => {
    const mockOnReceiptDeleted = vi.fn();

    render(
      <ReceiptViewer 
        transaction={mockTransaction} 
        onReceiptDeleted={mockOnReceiptDeleted}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));
    fireEvent.click(screen.getByText('Delete Receipt'));
    
    // Click the delete button in the confirmation dialog
    const deleteButtons = screen.getAllByText('Delete Receipt');
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(mockOnReceiptDeleted).toHaveBeenCalled();
    });
  });

  it('uses custom trigger when provided', () => {
    const customTrigger = <button>Custom Trigger</button>;

    render(
      <ReceiptViewer 
        transaction={mockTransaction} 
        trigger={customTrigger}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
    expect(screen.queryByText('View Receipt')).not.toBeInTheDocument();
  });

  it('displays transaction type badge correctly', () => {
    const incomeTransaction = { ...mockTransaction, type: 'income' as const };

    render(
      <ReceiptViewer transaction={incomeTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    const badge = screen.getByText('income');
    expect(badge).toBeInTheDocument();
  });
});
