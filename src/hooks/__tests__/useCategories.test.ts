import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories } from '../useCategories';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          then: jest.fn()
        })),
        eq: jest.fn(() => ({
          then: jest.fn()
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          then: jest.fn()
        }))
      }))
    }))
  }
}));

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('category deletion with usage validation', () => {
    it('should prevent deletion of categories with active transactions', async () => {
      // Mock category usage check - category has transactions
      const mockSupabaseFrom = supabase.from as jest.Mock;
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'transactions') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [{ id: 'transaction-1' }, { id: 'transaction-2' }], // 2 transactions
                  error: null
                }))
              }))
            }))
          };
        }
        if (table === 'budgets') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [], // No budgets
                  error: null
                }))
              }))
            }))
          };
        }
        return {
          delete: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        };
      });

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper()
      });

      // Attempt to delete category
      try {
        await result.current.deleteCategory('test-category-id');
        fail('Expected deletion to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Cannot delete category because it\'s used by 2 transactions');
      }
    });

    it('should allow deletion of categories with no active references', async () => {
      // Mock category usage check - category has no references
      const mockSupabaseFrom = supabase.from as jest.Mock;
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'transactions') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [], // No transactions
                  error: null
                }))
              }))
            }))
          };
        }
        if (table === 'budgets') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [], // No budgets
                  error: null
                }))
              }))
            }))
          };
        }
        return {
          delete: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        };
      });

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper()
      });

      // Should not throw an error
      await expect(result.current.deleteCategory('test-category-id')).resolves.not.toThrow();
    });

    it('should provide accurate usage information', async () => {
      // Mock category usage check
      const mockSupabaseFrom = supabase.from as jest.Mock;
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'transactions') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [{ id: 'transaction-1' }], // 1 transaction
                  error: null
                }))
              }))
            }))
          };
        }
        if (table === 'budgets') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [{ id: 'budget-1' }, { id: 'budget-2' }], // 2 budgets
                  error: null
                }))
              }))
            }))
          };
        }
        return {};
      });

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper()
      });

      const usage = await result.current.getCategoryUsage('test-category-id');
      
      expect(usage.transactionCount).toBe(1);
      expect(usage.budgetCount).toBe(2);
      expect(usage.totalUsage).toBe(3);
    });
  });
});
