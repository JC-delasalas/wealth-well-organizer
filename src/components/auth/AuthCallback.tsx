
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from email confirmation
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.session?.user) {
          console.log('User authenticated via callback:', data.session.user.email);
          // Show success popup
          alert('🎉 Email verified successfully! Welcome to WealthWell Organizer!');
          toast({
            title: "Email Confirmed!",
            description: "Your email has been successfully verified. Welcome to WealthWell Organizer!",
          });
          navigate('/');
        } else {
          console.log('No session found in callback');
          alert('❌ Email verification failed. Please try again.');
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
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Confirming your email...</p>
      </div>
    </div>
  );
};
