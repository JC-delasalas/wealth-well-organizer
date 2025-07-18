import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Lock, CheckCircle } from 'lucide-react';

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
      // If no user and no access token in URL, redirect to auth
      const accessToken = searchParams.get('access_token');
      if (!accessToken) {
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

    setIsSubmitting(true);
    try {
      console.log('Attempting to update password');
      const result = await updatePassword(password);
      if (!result.error) {
        // Password updated successfully, redirect to dashboard
        navigate('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = isPasswordValid && doPasswordsMatch && password && confirmPassword;

  if (!isValidSession && !searchParams.get('access_token')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-4">
                This password reset link is invalid or has expired.
              </p>
              <Button onClick={() => navigate('/auth')} variant="outline">
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
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