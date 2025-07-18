import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InsightsDashboard } from '../InsightsDashboard';
import { useFinancialInsights } from '@/hooks/useFinancialInsights';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';

// Mock the hooks
jest.mock('@/hooks/useFinancialInsights');
jest.mock('@/hooks/useTransactions');
jest.mock('@/hooks/useCategories');
jest.mock('@/hooks/useSavingsGoals');

const mockUseFinancialInsights = useFinancialInsights as jest.MockedFunction<typeof useFinancialInsights>;
const mockUseTransactions = useTransactions as jest.MockedFunction<typeof useTransactions>;
const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>;
const mockUseSavingsGoals = useSavingsGoals as jest.MockedFunction<typeof useSavingsGoals>;

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

describe('InsightsDashboard - Mark All as Read', () => {
  const mockMarkAllAsRead = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockCreateInsight = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseTransactions.mockReturnValue({
      transactions: [],
      isLoading: false,
      addTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      isAdding: false,
      isUpdating: false,
      isDeleting: false,
    });

    mockUseCategories.mockReturnValue({
      categories: [],
      isLoading: false,
    });

    mockUseSavingsGoals.mockReturnValue({
      savingsGoals: [],
      isLoading: false,
    });
  });

  it('shows Mark All as Read button when there are unread insights', () => {
    mockUseFinancialInsights.mockReturnValue({
      insights: [
        {
          id: '1',
          user_id: 'user1',
          insight_type: 'monthly',
          title: 'Test Insight 1',
          content: 'Test content 1',
          priority: 'high',
          is_read: false,
          created_at: '2024-01-01',
        },
        {
          id: '2',
          user_id: 'user1',
          insight_type: 'monthly',
          title: 'Test Insight 2',
          content: 'Test content 2',
          priority: 'medium',
          is_read: false,
          created_at: '2024-01-02',
        },
      ],
      isLoading: false,
      createInsight: mockCreateInsight,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      isMarkingAllAsRead: false,
      unreadCount: 2,
    });

    render(<InsightsDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Mark All as Read')).toBeInTheDocument();
    expect(screen.getByText('2 new')).toBeInTheDocument();
  });

  it('does not show Mark All as Read button when all insights are read', () => {
    mockUseFinancialInsights.mockReturnValue({
      insights: [
        {
          id: '1',
          user_id: 'user1',
          insight_type: 'monthly',
          title: 'Test Insight 1',
          content: 'Test content 1',
          priority: 'high',
          is_read: true,
          created_at: '2024-01-01',
        },
      ],
      isLoading: false,
      createInsight: mockCreateInsight,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      isMarkingAllAsRead: false,
      unreadCount: 0,
    });

    render(<InsightsDashboard />, { wrapper: createWrapper() });

    expect(screen.queryByText('Mark All as Read')).not.toBeInTheDocument();
    expect(screen.queryByText('new')).not.toBeInTheDocument();
  });

  it('shows confirmation dialog when Mark All as Read is clicked', async () => {
    mockUseFinancialInsights.mockReturnValue({
      insights: [
        {
          id: '1',
          user_id: 'user1',
          insight_type: 'monthly',
          title: 'Test Insight 1',
          content: 'Test content 1',
          priority: 'high',
          is_read: false,
          created_at: '2024-01-01',
        },
      ],
      isLoading: false,
      createInsight: mockCreateInsight,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      isMarkingAllAsRead: false,
      unreadCount: 1,
    });

    render(<InsightsDashboard />, { wrapper: createWrapper() });

    const markAllButton = screen.getByText('Mark All as Read');
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(screen.getByText('Mark All Insights as Read?')).toBeInTheDocument();
      expect(screen.getByText(/This will mark all 1 unread insight as read/)).toBeInTheDocument();
    });
  });

  it('calls markAllAsRead when confirmed', async () => {
    mockUseFinancialInsights.mockReturnValue({
      insights: [
        {
          id: '1',
          user_id: 'user1',
          insight_type: 'monthly',
          title: 'Test Insight 1',
          content: 'Test content 1',
          priority: 'high',
          is_read: false,
          created_at: '2024-01-01',
        },
      ],
      isLoading: false,
      createInsight: mockCreateInsight,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      isMarkingAllAsRead: false,
      unreadCount: 1,
    });

    render(<InsightsDashboard />, { wrapper: createWrapper() });

    const markAllButton = screen.getByText('Mark All as Read');
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(screen.getByText('Mark All Insights as Read?')).toBeInTheDocument();
    });

    const confirmButton = screen.getAllByText('Mark All as Read')[1]; // Second one is in the dialog
    fireEvent.click(confirmButton);

    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when marking all as read', () => {
    mockUseFinancialInsights.mockReturnValue({
      insights: [
        {
          id: '1',
          user_id: 'user1',
          insight_type: 'monthly',
          title: 'Test Insight 1',
          content: 'Test content 1',
          priority: 'high',
          is_read: false,
          created_at: '2024-01-01',
        },
      ],
      isLoading: false,
      createInsight: mockCreateInsight,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      isMarkingAllAsRead: true,
      unreadCount: 1,
    });

    render(<InsightsDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Marking...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /marking/i })).toBeDisabled();
  });
});
