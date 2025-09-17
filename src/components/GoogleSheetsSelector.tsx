import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Sheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Calendar
} from 'lucide-react';

interface GoogleSheet {
  id: string;
  name: string;
  modifiedTime: string;
}

interface GoogleSheetsSelectorProps {
  organizationId: string;
  onSyncComplete?: () => void;
}

const GoogleSheetsSelector = ({ organizationId, onSyncComplete }: GoogleSheetsSelectorProps) => {
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');

  const extractSheetId = (input: string) => {
    if (!input) return '';
    const urlMatch = input.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch?.[1]) return urlMatch[1];
    const idMatch = input.match(/^[a-zA-Z0-9-_]{20,}$/);
    return idMatch ? input : '';
  };

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      // Get auth URL from our edge function
      const { data: authData, error: authError } = await supabase.functions
        .invoke('google-auth', {
          body: {
            action: 'getAuthUrl',
            redirectUri
          }
        });

      if (authError) throw authError;

      // Open popup for Google OAuth
      const popup = window.open(
        authData.authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsAuthenticating(false);
        }
      }, 1000);

      // Listen for the auth code from the popup (guard against duplicate events)
      let handled = false;
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (handled) return; // ignore duplicates
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          handled = true;
          clearInterval(checkClosed);
          popup?.close();
          
          try {
            // Exchange code for access token
            const { data: tokenData, error: tokenError } = await supabase.functions
              .invoke('google-auth', {
                body: {
                  action: 'exchangeCode',
                  code: event.data.code,
                  redirectUri
                }
              });

            if (tokenError) throw tokenError;

            setAccessToken(tokenData.access_token);
            
            toast({
              title: "Authentication successful",
              description: "Connected to Google Sheets successfully",
            });
            
          } catch (error: any) {
            console.error('Token exchange error:', error);
            toast({
              title: "Authentication failed",
              description: error.message,
              variant: "destructive",
            });
          } finally {
            setIsAuthenticating(false);
            window.removeEventListener('message', handleMessage);
          }
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          handled = true;
          clearInterval(checkClosed);
          popup?.close();
          setIsAuthenticating(false);
          
          toast({
            title: "Authentication failed",
            description: event.data.error,
            variant: "destructive",
          });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Cleanup
      return () => {
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
      };
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
      setIsAuthenticating(false);
    }
  };

  const loadGoogleSheets = async (_token: string) => {
    // Listing is disabled to avoid Drive permissions
    setSheets([]);
  };

  const handleSyncSheet = async () => {
    if (!accessToken) return;

    const idToUse = selectedSheetId || extractSheetId(manualInput);
    if (!idToUse) {
      toast({
        title: "Missing sheet",
        description: "Paste a valid Google Sheet URL or ID first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions
        .invoke('google-sheets-private-sync', {
          body: {
            organizationId,
            sheetId: idToUse,
            accessToken
          }
        });

      if (error) throw error;

      toast({
        title: "Sync completed successfully!",
        description: `Synced ${data.synced_count} jobs from your Google Sheet.`,
      });

      onSyncComplete?.();
      
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const computedId = selectedSheetId || extractSheetId(manualInput);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sheet className="h-5 w-5" />
          Private Google Sheets Integration
        </CardTitle>
        <CardDescription>
          Connect to your private Google Sheets to sync job data securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!accessToken ? (
          <div className="text-center space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to authenticate with Google to access your private sheets.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="w-fit"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect to Google Sheets
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                Connected to Google Sheets
              </span>
            </div>

            <Separator />

            {isLoadingSheets ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading your sheets...</span>
              </div>
            ) : sheets.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select a Google Sheet to sync
                  </label>
                  <Select value={selectedSheetId} onValueChange={setSelectedSheetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a Google Sheet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sheets.map((sheet) => (
                        <SelectItem key={sheet.id} value={sheet.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{sheet.name}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                              <Calendar className="h-3 w-3" />
                              {formatDate(sheet.modifiedTime)}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing your {sheets.length} most recent spreadsheets
                  </p>
                </div>

                {selectedSheetId && (
                  <>
                    <Separator />
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">Required columns in your sheet:</h4>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {['company_name', 'job_id', 'job_title', 'job_description', 'job_status', 'location_city', 'vacancy_url'].map(col => (
                            <Badge key={col} variant="outline" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          At minimum, your sheet must have <strong>job_id</strong> and <strong>job_title</strong> columns.
                        </p>
                      </div>

                      <Button 
                        onClick={handleSyncSheet}
                        disabled={isSyncing}
                        className="w-fit"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Syncing Jobs...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Jobs from Selected Sheet
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No Google Sheets found in your account.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadGoogleSheets(accessToken)}
                disabled={isLoadingSheets}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Sheets
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setAccessToken(null);
                  setSheets([]);
                  setSelectedSheetId('');
                }}
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsSelector;