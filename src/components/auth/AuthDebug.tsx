import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const AuthDebug = () => {
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const urlParams = {
    access_token: searchParams.get('access_token'),
    refresh_token: searchParams.get('refresh_token'),
    type: searchParams.get('type'),
    error: searchParams.get('error'),
    error_description: searchParams.get('error_description'),
  };

  return (
    <Card className="m-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Debug Info (Development Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-yellow-800">Current URL: </h4>
          <p className="text-xs text-yellow-700 break-all">{window.location.href}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-yellow-800">URL Parameters:</h4>
          <pre className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-auto">
            {JSON.stringify(urlParams, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium text-yellow-800">Auth State:</h4>
          <pre className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              hasUser: !!user,
              userEmail: user?.email || 'No user',
              hasSession: !!session,
            }, null, 2)}
          </pre>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Auth debug logging disabled for security
          }}
        >
          Log to Console
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthDebug;