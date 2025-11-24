import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LocalhostRedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const isLocalhost = window.location.hostname === 'localhost';
  const productionUrl = 'https://wealth-well-organizer.vercel.app';

  useEffect(() => {
    // If we're on localhost and have auth tokens, redirect to production
    if (isLocalhost) {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');

      if ((accessToken && refreshToken && type === 'recovery') || error) {
        // Construct the production URL with all parameters
        const currentParams = new URLSearchParams(window.location.hash.substring(1));
        const productionUrlWithParams = `${productionUrl}/auth/callback#${currentParams.toString()}`;
        
        console.log('Redirecting to production URL:', productionUrlWithParams);
        
        // Redirect to production
        window.location.href = productionUrlWithParams;
        return;
      }
    }
  }, [isLocalhost, searchParams, productionUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const handleRequestNewReset = () => {
    // Redirect to production auth page
    window.location.href = `${productionUrl}/auth`;
  };

  // Only show this component on localhost
  if (!isLocalhost) {
    return null;
  }

  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Localhost Redirect Issue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Issue:</strong> The password reset email is redirecting to localhost instead of the production site.
              {error && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                  <strong>Error:</strong> {error}<br />
                  <strong>Description:</strong> {errorDescription}
                </div>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Fix Options:</h3>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRequestNewReset}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Request New Reset Link (Recommended)
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                This will take you to the production site where you can request a new password reset link.
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">For Developers: Fix Supabase Configuration</h3>
            <div className="space-y-3 text-sm">
              <p>To permanently fix this issue, update your Supabase project configuration:</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">1. Site URL:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded flex-1">
                    {productionUrl}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(productionUrl)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">2. Add Redirect URLs:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded flex-1">
                    {productionUrl}/auth/callback
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`${productionUrl}/auth/callback`)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium"></span>
                  <code className="bg-gray-100 px-2 py-1 rounded flex-1">
                    {productionUrl}/reset-password
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`${productionUrl}/reset-password`)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> Remove any localhost URLs from your Supabase configuration to prevent this issue.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalhostRedirectHandler;