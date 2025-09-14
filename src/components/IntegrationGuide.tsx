import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  FileText, 
  Key, 
  Database, 
  Share2, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface IntegrationGuideProps {
  type: 'google_sheets' | 'meta_ads';
}

const IntegrationGuide = ({ type }: IntegrationGuideProps) => {
  const isGoogleSheets = type === 'google_sheets';

  const googleSheetsSteps = [
    {
      step: 1,
      title: "Prepare Your Google Sheet",
      description: "Create a Google Sheet with job data in the following format:",
      details: [
        "Column A: Job Title (required)",
        "Column B: Job Description",
        "Column C: Budget (number)",
        "Column D: Status (active/paused/draft)",
        "Column E: External ID (optional)"
      ],
      icon: FileText
    },
    {
      step: 2,
      title: "Share Your Sheet",
      description: "Make your Google Sheet accessible:",
      details: [
        "Click 'Share' button in Google Sheets",
        "Set 'General access' to 'Anyone with the link'",
        "Choose 'Viewer' permissions",
        "Copy the sharing link"
      ],
      icon: Share2
    },
    {
      step: 3,
      title: "Get the Sheet URL",
      description: "Copy the complete Google Sheets URL:",
      details: [
        "URL format: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit",
        "Make sure it's the full URL, not shortened",
        "The sheet must be publicly accessible"
      ],
      icon: ExternalLink
    },
    {
      step: 4,
      title: "Connect to Your App",
      description: "Use the integration dialog to connect:",
      details: [
        "Paste your Google Sheets URL",
        "Click 'Connect Google Sheets'",
        "Data will be synced automatically",
        "Check the Jobs page for imported data"
      ],
      icon: Database
    }
  ];

  const metaAdsSteps = [
    {
      step: 1,
      title: "Access Meta for Developers",
      description: "Go to the Meta for Developers platform:",
      details: [
        "Visit developers.facebook.com",
        "Log in with your Facebook/Meta account",
        "Create a new app or use existing one",
        "Select 'Business' as app type"
      ],
      icon: ExternalLink
    },
    {
      step: 2,
      title: "Set Up Marketing API",
      description: "Enable the Marketing API for your app:",
      details: [
        "Add 'Marketing API' product to your app",
        "Complete app review process if required",
        "Ensure your app has proper permissions",
        "Get your App ID and App Secret"
      ],
      icon: Settings
    },
    {
      step: 3,
      title: "Generate Access Token",
      description: "Create a long-lived access token:",
      details: [
        "Use Meta's Access Token Tool",
        "Select your app and required permissions",
        "Generate a User Access Token",
        "Exchange for long-lived token (60+ days)",
        "Required permissions: ads_read, ads_management"
      ],
      icon: Key
    },
    {
      step: 4,
      title: "Connect to Your App",
      description: "Add the token to your integration:",
      details: [
        "Copy your long-lived access token",
        "Paste it in the Meta Ads integration dialog",
        "Click 'Connect Meta Ads'",
        "Campaign data will be synced"
      ],
      icon: Database
    }
  ];

  const steps = isGoogleSheets ? googleSheetsSteps : metaAdsSteps;
  const title = isGoogleSheets ? "Google Sheets Integration Guide" : "Meta Ads Integration Guide";
  const description = isGoogleSheets 
    ? "Follow these steps to sync job data from Google Sheets"
    : "Set up Meta Ads API to pull campaign performance data";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Setup Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {steps.map((stepData, index) => {
            const Icon = stepData.icon;
            return (
              <div key={index}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {stepData.step}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {stepData.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {stepData.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {stepData.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && <Separator />}
              </div>
            );
          })}

          {/* Important Notes */}
          <Card className="border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {isGoogleSheets ? (
                  <>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>Your Google Sheet must be publicly accessible (shared with "Anyone with the link")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>Column headers should be in the first row exactly as specified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>Empty rows will be skipped during sync</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>Access tokens expire - you'll need to refresh them periodically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>Ensure your Meta app has been approved for Marketing API access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>Rate limits apply - large account syncs may take time</span>
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Helpful Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Helpful Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isGoogleSheets ? (
                  <>
                    <a
                      href="https://support.google.com/docs/answer/183965"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Google Sheets Sharing Guide
                    </a>
                    <a
                      href="https://support.google.com/docs/answer/37579"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Google Sheets Help Center
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="https://developers.facebook.com/docs/marketing-api/get-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Meta Marketing API Documentation
                    </a>
                    <a
                      href="https://developers.facebook.com/tools/explorer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Meta Graph API Explorer
                    </a>
                    <a
                      href="https://developers.facebook.com/tools/accesstoken"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Access Token Tool
                    </a>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationGuide;