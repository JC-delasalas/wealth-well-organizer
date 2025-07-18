import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import AuthDebug from '@/components/auth/AuthDebug';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const { updatePassword, loading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have a valid session (user logged in via reset link)
    if (user) {
      setIsValidSession(true);
    } else {
      // Check for auth tokens in URL (from email link)
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        // Valid reset link, user should be able to proceed
        setIsValidSession(true);
      } else {
        // Invalid or expired reset link, redirect to auth
        navigate('/auth');
      }
    }
  }, [user, searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      return; // This will be handled by the form validation
    }

    if (password.length < 6) {
      return; // This will be handled by the form validation
    }

    // Ensure we have a valid session before attempting password update
    if (!isValidSession) {
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting to update password');
      const result = await updatePassword(password);
      if (!result.error) {
        // Password updated successfully, redirect to dashboard
        // Add a small delay to ensure the password change is processed
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Password update failed:', error);
      // The error will be handled by the updatePassword function
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = isPasswordValid && doPasswordsMatch && password && confirmPassword;

  if (!isValidSession && !searchParams.get('access_token') && !searchParams.get('type')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-4">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/auth')} className="w-full">
                  Request New Reset Link
                </Button>
                <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <AuthDebug />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Enter your new password below
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
                disabled={isLoading}
              />
              {password && !isPasswordValid && (
                <p className="text-sm text-red-600">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
              {confirmPassword && !doPasswordsMatch && (
                <p className="text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
              {confirmPassword && doPasswordsMatch && isPasswordValid && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !isFormValid}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              disabled={isLoading}
              className="text-sm text-gray-600 hover:text-primary"
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;