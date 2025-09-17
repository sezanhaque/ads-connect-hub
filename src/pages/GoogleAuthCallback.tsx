import { useEffect } from 'react';

const GoogleAuthCallback = () => {
  useEffect(() => {
    // Get the authorization code from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
    } else if (code) {
      // Send success code to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        code: code
      }, window.location.origin);
    }

    // Close this popup window
    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Processing authentication...</h2>
        <p className="text-muted-foreground">This window will close automatically.</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;