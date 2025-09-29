import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ExternalLink, CheckCircle, AlertCircle, Unplug, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMetaIntegration } from '@/hooks/useMetaIntegration';
import { useMetaIntegrationStatus } from '@/hooks/useMetaIntegrationStatus';
import { Badge } from '@/components/ui/badge';

const metaConnectionSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required').refine(
    (token) => token.startsWith('EAA') || token.startsWith('EAAG'),
    'Access token must be a valid Meta token starting with EAA or EAAG'
  ),
  adAccountId: z.string().optional(),
});

type MetaConnectionForm = z.infer<typeof metaConnectionSchema>;

const MetaConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const { toast } = useToast();
  const { connectMetaAccount, loading } = useMetaIntegration();
  const { integration, loading: statusLoading, isConnected, refetch, disconnect } = useMetaIntegrationStatus();

  if (isConnected || loading) {
    return <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading users...</p>
              </div>
  }
  
  // Remove localStorage check since we're using database storage
  useEffect(() => {
    // Trigger refetch when component mounts to ensure we have the latest status
    if (!statusLoading) {
      refetch();
    }
  }, [refetch, statusLoading]);

  const form = useForm<MetaConnectionForm>({
    resolver: zodResolver(metaConnectionSchema),
    defaultValues: {
      accessToken: '',
      adAccountId: '',
    },
  });

  const onSubmit = async (data: MetaConnectionForm) => {
    try {
      setConnectionStatus('connecting');
      console.log('Starting Meta connection...');
      
      const result = await connectMetaAccount(data.accessToken, data.adAccountId);
      
      if (result.success) {
        setConnectionStatus('connected');
        
        // Remove localStorage storage since we're using database now
        
        toast({
          title: 'Connection successful!',
          description: `Successfully synced ${result.syncedCount} campaigns from your Meta account.`,
        });

        // Refetch integration status to show connected state
        await refetch();
      } else {
        setConnectionStatus('error');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      toast({
        title: 'Connection failed',
        description: error?.message || 'Failed to connect to Meta Marketing API. Please check your credentials.',
        variant: 'destructive',
      });
    }
  };

  const handleTryAgain = () => {
    setConnectionStatus('idle');
    // Remove localStorage since we're using database storage now
    form.reset();
  };

  const handleDisconnect = async () => {
    const result = await disconnect();
    if (result?.success) {
      toast({
        title: 'Disconnected successfully',
        description: 'Your Meta account has been disconnected.',
      });
    } else {
      toast({
        title: 'Disconnect failed',
        description: result?.error || 'Failed to disconnect Meta account.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meta Connection</h1>
        <p className="text-muted-foreground">
          Connect your Meta Marketing Account to sync campaigns and metrics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Connect to Meta Marketing API
            {isConnected && <CheckCircle className="h-5 w-5 text-green-600" />}
          </CardTitle>
          <CardDescription>
            Link your Meta Business Manager account to automatically sync your campaigns, 
            audience data, and performance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connected Status */}
          {isConnected && integration && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">Connected to Meta</h3>
                    <p className="text-sm text-green-600">
                      Account: {integration.account_name || integration.ad_account_id}
                    </p>
                    {integration.last_sync_at && (
                      <p className="text-xs text-green-600">
                        Last sync: {new Date(integration.last_sync_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    {integration.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Unplug className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>What you'll get:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Automatic campaign synchronization</li>
              <li>Real-time performance metrics</li>
              <li>Audience insights and targeting data</li>
              <li>Streamlined campaign management</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">How to get your real Meta access token:</p>
                <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                  <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline">Facebook for Developers</a></li>
                  <li>Create an app and add the Marketing API product</li>
                  <li>Generate a <strong>long-lived access token</strong> with ads_read permissions</li>
                  <li>Token must start with "EAA" or "EAAG" to be valid</li>
                  <li>Find your Ad Account ID in Business Manager (format: act_1234567890)</li>
                </ol>
                <p className="font-medium text-yellow-800 mt-2">⚠️ Note: Only real Meta tokens will sync actual campaign data. Demo tokens show no data.</p>
              </div>
            </div>
          </div>
          
          {!isConnected && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your Meta Marketing API access token"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="adAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Account ID (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="act_1234567890 (leave empty to use first account)"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        If left empty, we'll use your first available ad account
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || connectionStatus === 'connecting'}
                >
                  {connectionStatus === 'connecting' ? (
                    <>Connecting...</>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Connect Meta Account
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {isConnected && (
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-green-600">Successfully Connected!</p>
              <p className="text-sm text-muted-foreground">Your Meta campaigns are now being synced.</p>
              
              {/* <Button 
                variant="outline" 
                onClick={handleTryAgain}
                className="mt-4"
              >
                Connect Different Account
              </Button> */}
            </div>
          )}

          {connectionStatus === 'error' && !isConnected && (
            <div className="text-center py-4 space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-red-600">Connection Failed</p>
              <p className="text-sm text-muted-foreground">Please check your credentials and try again.</p>
              
              <Button 
                variant="outline" 
                onClick={handleTryAgain}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaConnection;