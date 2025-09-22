import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';

const metaConnectionSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  adAccountId: z.string().min(1, 'Ad Account ID is required'),
});

type MetaConnectionForm = z.infer<typeof metaConnectionSchema>;

const MetaConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const { toast } = useToast();
  const { syncMetaAds, loading } = useIntegrations();

  // Check for existing Meta connection on component mount
  useEffect(() => {
    const storedConnection = localStorage.getItem('meta-connection-status');
    if (storedConnection === 'connected') {
      setIsConnected(true);
      setConnectionStatus('connected');
    }
  }, []);

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
      await syncMetaAds(data.accessToken, data.adAccountId, 'last_7_days');
      
      setConnectionStatus('connected');
      setIsConnected(true);
      
      // Store connection status in localStorage for persistence
      localStorage.setItem('meta-connection-status', 'connected');
      
      toast({
        title: 'Connection successful',
        description: 'Successfully connected to Meta Marketing API and synced campaigns.',
      });
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: 'Connection failed',
        description: error?.message || 'Failed to connect to Meta Marketing API. Please check your credentials.',
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
                      <FormLabel>Ad Account ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="act_1234567890"
                          {...field} 
                        />
                      </FormControl>
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
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-green-600">Successfully Connected!</p>
              <p className="text-sm text-muted-foreground">Your Meta campaigns are now being synced.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaConnection;