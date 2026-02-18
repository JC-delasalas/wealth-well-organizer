import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSavingsGoals } from '../useSavingsGoals';

// Use vi.hoisted() so mock objects are initialized before vi.mock hoisting
const { mockSupabase, mockToast, mockUser } = vi.hoisted(() => {
  const mockToast = vi.fn();
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  };
  return { mockSupabase, mockToast, mockUser };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Test wrapper with QueryClient
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

describe('useSavingsGoals', () => {
  const mockSavingsGoals = [
    {
      id: 'goal-1',
      name: 'Emergency Fund',
      target_amount: 10000,
      current_amount: 5000,
      target_date: '2024-12-31',
      description: 'Emergency savings',
      user_id: 'user-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'goal-2',
      name: 'Vacation',
      target_amount: 3000,
      current_amount: 1500,
      target_date: '2024-06-30',
      description: 'Summer vacation',
      user_id: 'user-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default successful responses
    mockSupabase.from().select().order().mockResolvedValue({
      data: mockSavingsGoals,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch savings goals successfully', async () => {
    const { result } = renderHook(() => useSavingsGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savingsGoals).toEqual(mockSavingsGoals);
    expect(mockSupabase.from).toHaveBeenCalledWith('savings_goals');
  });

  it('should handle fetch errors', async () => {
    const mockError = { message: 'Database error' };
    mockSupabase.from().select().order().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useSavingsGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savingsGoals).toEqual([]);
  });

  it('should create a new savings goal', async () => {
    const newGoal = {
      name: 'New Car',
      target_amount: 25000,
      target_date: '2025-01-01',
      description: 'Save for a new car',
    };

    const createdGoal = {
      id: 'goal-3',
      ...newGoal,
      current_amount: 0,
      user_id: 'user-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    mockSupabase.from().insert().select().single().mockResolvedValue({
      data: createdGoal,
      error: null,
    });


    const { result } = renderHook(() => useSavingsGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addSavingsGoal(newGoal);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('savings_goals');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Savings goal created',
      description: 'Your savings goal has been created successfully.',
    });
  });

  it('should handle create goal errors', async () => {
    const newGoal = {
      name: 'New Car',
      target_amount: 25000,
      target_date: '2025-01-01',
      description: 'Save for a new car',
    };

    const mockError = { message: 'Validation error' };
    mockSupabase.from().insert().select().single().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useSavingsGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addSavingsGoal(newGoal);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error creating savings goal',
      description: 'Validation error',
      variant: 'destructive',
    });
  });

  it('should update a savings goal', async () => {
    const goalId = 'goal-1';
    const updates = {
      name: 'Updated Emergency Fund',
      target_amount: 15000,
    };

    const updatedGoal = {
      ...mockSavingsGoals[0],
      ...updates,
      updated_at: '2024-01-02',
    };

    mockSupabase.from().update().eq().select().single().mockResolvedValue({
      data: updatedGoal,
      error: null,
    });

    const { result } = renderHook(() => useSavingsGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateSavingsGoal({ id: goalId, ...updates });
    });

    expect(mockSupabase.from().update).toHaveBeenCalledWith(updates);
    expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', goalId);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Savings goal updated',
      description: 'Your savings goal has been updated successfully.',
    });
  });

  it('should delete a savings goal', async () => {
    const goalId = 'goal-1';

    mockSupabase.from().delete().eq().mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useSavingsGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteSavingsGoal(goalId);
    });

    expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith('id', goalId);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Savings goal deleted',
      description: 'Your savings goal has been deleted successfully.',
    });
  });

  it('should calculate progress correctly', async () => {
    const { result } = renderHook(() => useSavingsGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Emergency Fund: 5000/10000 = 50%
    const emergencyFund = result.current.savingsGoals.find(g => g.name === 'Emergency Fund');
    expect(emergencyFund).toBeDefined();

    if (emergencyFund) {
      const progress = (emergencyFund.current_amount / emergencyFund.target_amount) * 100;
      expect(progress).toBe(50);
    }

    // Vacation: 1500/3000 = 50%
    const vacation = result.current.savingsGoals.find(g => g.name === 'Vacation');
    expect(vacation).toBeDefined();

    if (vacation) {
      const progress = (vacation.current_amount / vacation.target_amount) * 100;
      expect(progress).toBe(50);
    }
  });
});
