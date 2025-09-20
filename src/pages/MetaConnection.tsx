import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const MetaConnection = () => {
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
          <CardTitle>Connect to Meta Marketing API</CardTitle>
          <CardDescription>
            Link your Meta Business Manager account to automatically sync your campaigns, 
            audience data, and performance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <Button className="w-full" disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect Meta Account (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaConnection;