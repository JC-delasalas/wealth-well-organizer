import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from '../useAuth';

// Use vi.hoisted() so mock objects are initialized before vi.mock hoisting
const { mockSupabase, mockToast } = vi.hoisted(() => {
  const mockToast = vi.fn();
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  };
  return { mockSupabase, mockToast };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    auth: vi.fn(),
    error: vi.fn(),
  },
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

describe('useAuth', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no user when no session exists', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle successful sign up', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {},
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signUp('test@example.com', 'password123', {
        fullName: 'Test User',
        country: 'US',
      });
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          country: 'US',
        },
      },
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Account created successfully',
      description: 'Please check your email to verify your account.',
    });
  });

  it('should handle sign up errors', async () => {
    const mockError = { message: 'Email already registered' };
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signUp('test@example.com', 'password123', {});
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Sign up failed',
      description: 'Email already registered',
      variant: 'destructive',
    });
  });

  it('should handle successful sign in', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      },
      access_token: 'token-123',
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: mockSession, user: mockSession.user },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Welcome back!',
      description: 'You have been signed in successfully.',
    });
  });

  it('should handle sign in errors', async () => {
    const mockError = { message: 'Invalid credentials' };
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: mockError,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrongpassword');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Sign in failed',
      description: 'Invalid credentials',
      variant: 'destructive',
    });
  });

  it('should handle successful sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Signed out successfully',
      description: 'You have been signed out of your account.',
    });
  });

  it('should handle password reset', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com'
    );

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Password reset email sent',
      description: 'Please check your email for password reset instructions.',
    });
  });

  it('should cleanup subscription on unmount', () => {
    const { unmount } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
