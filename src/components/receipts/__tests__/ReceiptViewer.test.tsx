import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReceiptViewer } from '../ReceiptViewer';
import { Transaction } from '@/types';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        remove: jest.fn().mockResolvedValue({ error: null }),
      })),
    },
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
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
    receipt_url: 'https://example.com/receipt.jpg',
    receipt_name: 'coffee_receipt.jpg',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user_id: 'user1',
  };

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

  it('displays image preview for image files', () => {
    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    const image = screen.getByAltText('coffee_receipt.jpg');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/receipt.jpg');
  });

  it('displays PDF preview for PDF files', () => {
    const pdfTransaction = {
      ...mockTransaction,
      receipt_name: 'receipt.pdf',
      receipt_url: 'https://example.com/receipt.pdf',
    };

    render(
      <ReceiptViewer transaction={pdfTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    const iframe = screen.getByTitle('receipt.pdf');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/receipt.pdf');
  });

  it('shows file preview for unsupported file types', () => {
    const docTransaction = {
      ...mockTransaction,
      receipt_name: 'receipt.doc',
      receipt_url: 'https://example.com/receipt.doc',
    };

    render(
      <ReceiptViewer transaction={docTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));

    expect(screen.getByText('Preview not available for this file type')).toBeInTheDocument();
    expect(screen.getByText('receipt.doc')).toBeInTheDocument();
  });

  it('provides download functionality', () => {
    // Mock fetch and URL.createObjectURL
    global.fetch = jest.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
    });
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock document methods
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));
    fireEvent.click(screen.getByText('Download'));

    expect(fetch).toHaveBeenCalledWith('https://example.com/receipt.jpg');
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('provides open in new tab functionality', () => {
    const mockOpen = jest.fn();
    global.window.open = mockOpen;

    render(
      <ReceiptViewer transaction={mockTransaction} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('View Receipt'));
    fireEvent.click(screen.getByText('Open in New Tab'));

    expect(mockOpen).toHaveBeenCalledWith('https://example.com/receipt.jpg', '_blank');
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
    expect(screen.getByText('Delete Receipt')).toBeInTheDocument();
  });

  it('handles receipt deletion', async () => {
    const mockOnReceiptDeleted = jest.fn();

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
