
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a password reset flow
        const type = searchParams.get('type');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('Auth callback params:', {
          type,
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          error,
          errorDescription
        });

        // Handle errors from URL
        if (error) {
          console.error('Auth callback error from URL:', error, errorDescription);
          
          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            toast({
              title: "Reset Link Expired",
              description: "The password reset link has expired. Please request a new one.",
              variant: "destructive",
              duration: 10000,
            });
            navigate('/auth');
            return;
          }

          toast({
            title: "Authentication Error",
            description: errorDescription || error,
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // Handle password reset flow
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('Password reset flow detected, setting session...');
          
          // Set the session using the tokens from URL
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session setup error:', sessionError);
            toast({
              title: "Session Error",
              description: "Unable to authenticate for password reset. Please try again.",
              variant: "destructive",
            });
            navigate('/auth');
            return;
          }

          if (data.session) {
            console.log('Session established for password reset');
            toast({
              title: "Reset Link Verified",
              description: "Please enter your new password below.",
            });
            navigate('/reset-password');
            return;
          }
        }

        // Handle regular auth callback (email confirmation)
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Auth callback error:', authError);
          toast({
            title: "Authentication Error",
            description: authError.message,
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.session?.user) {
          console.log('User authenticated via callback:', data.session.user.email);
          toast({
            title: "Email Confirmed!",
            description: "Your email has been successfully verified. Welcome to WealthWell Organizer!",
          });
          navigate('/');
        } else {
          console.log('No session found in callback');
          toast({
            title: "Authentication Failed",
            description: "Email verification failed. Please try again.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">
          Processing authentication...
        </p>
      </div>
    </div>
  );
};
