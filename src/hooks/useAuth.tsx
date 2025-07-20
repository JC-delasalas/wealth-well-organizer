
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom error interface for authentication operations
 */
interface AuthError {
  message: string;
  status?: number;
}

/**
 * Authentication context type definition
 * Provides all authentication-related state and methods
 */
interface AuthContextType {
  /** Current authenticated user or null */
  user: User | null;
  /** Current session or null */
  session: Session | null;
  /** Loading state for authentication operations */
  loading: boolean;
  /** Sign up a new user */
  signUp: (email: string, password: string, fullName?: string, country?: string) => Promise<{ error: AuthError | null }>;
  /** Sign in an existing user */
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Send password reset email */
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  /** Update user password */
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access authentication context
 * @returns Authentication context with user state and auth methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const seedUserData = async (session: Session) => {
    try {
      const { data, error } = await supabase.functions.invoke('seed-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error seeding user data');
      }
    } catch (error) {
      console.error('Error calling seed function');
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Auth state changed - logging removed for security
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Seed user data for new users
            setTimeout(() => {
              seedUserData(session);
            }, 1000);
            
            toast({
              title: "Welcome!",
              description: "You have successfully signed in.",
            });
          }
          
          if (event === 'SIGNED_OUT') {
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
            });
          }
        }
      }
    );

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session');
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession');
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string, fullName?: string, country?: string) => {
    setLoading(true);

    try {
      const redirectUrl = `https://wealth-well-organizer.vercel.app/auth/callback`;

      // Prepare user metadata with country information
      const userData: Record<string, any> = {};
      if (fullName) userData.full_name = fullName;
      if (country) userData.country = country;

      // Signing up with redirect URL - logging removed for security

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: Object.keys(userData).length > 0 ? userData : undefined
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email and click the link to complete your registration.",
          duration: 10000,
        });
      } else if (data.user && data.user.email_confirmed_at) {
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
      }

      setLoading(false);
      return { error };
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      setLoading(false);
      const error = { message: 'An unexpected error occurred during sign up' };
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error');
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }

      setLoading(false);
      return { error };
    } catch (err) {
      console.error('Unexpected sign in error');
      setLoading(false);
      const error = { message: 'An unexpected error occurred during sign in' };
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      setLoading(false);
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    
    try {
      // Always use production URL for password reset redirect
      // This ensures the email link works regardless of development environment
      const redirectUrl = 'https://wealth-well-organizer.vercel.app/reset-password';
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Reset password error:', error);
        toast({
          title: "Reset password failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset link sent",
          description: "Check your email for a password reset link.",
          duration: 10000,
        });
      }

      setLoading(false);
      return { error };
    } catch (err) {
      console.error('Unexpected reset password error:', err);
      setLoading(false);
      const error = { message: 'An unexpected error occurred during password reset' };
      toast({
        title: "Reset password failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    
    try {
      // Verify we have a valid session before updating password
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const error = { message: 'No valid session found. Please try the password reset process again.' };
        toast({
          title: "Session expired",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return { error };
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Update password error:', error);
        toast({
          title: "Update password failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated successfully",
          description: "Your password has been updated. You can now sign in with your new password.",
          duration: 5000,
        });
      }

      setLoading(false);
      return { error };
    } catch (err) {
      console.error('Unexpected update password error:', err);
      setLoading(false);
      const error = { message: 'An unexpected error occurred during password update' };
      toast({
        title: "Update password failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
