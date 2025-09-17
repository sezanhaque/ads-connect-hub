import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  DollarSign, 
  MapPin, 
  Users, 
  Image,
  Play,
  AlertCircle,
  Check,
  Upload,
  X
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company_name: string;
  status: string;
}

interface CampaignData {
  jobId: string;
  name: string;
  budget: string;
  startDate: string;
  endDate: string;
  locations: string;
  targetAudience: string;
  creativeAssets: File[];
  adCopy: string;
  ctaButton: 'none' | 'learn-more';
}

const FIXED_EMAIL_RECIPIENTS = ['ortv.schyns@gmail.com', 'moalamin001@gmail.com'];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showDisabledPopup, setShowDisabledPopup] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    jobId: '',
    name: '',
    budget: '',
    startDate: '',
    endDate: '',
    locations: '',
    targetAudience: '',
    creativeAssets: [],
    adCopy: '',
    ctaButton: 'none'
  });

  const steps = [
    { number: 1, title: 'Campaign Basics', icon: Target },
    { number: 2, title: 'Audience', icon: Users },
    { number: 3, title: 'Creative & Copy', icon: Image },
    { number: 4, title: 'Summary & Publishing', icon: Check }
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!campaignData.jobId || !campaignData.name || !campaignData.budget || !campaignData.startDate || !campaignData.endDate) {
          toast({ title: "Please fill all required fields", variant: "destructive" });
          return false;
        }
        if (new Date(campaignData.startDate) < new Date()) {
          toast({ title: "Start date cannot be in the past", variant: "destructive" });
          return false;
        }
        if (new Date(campaignData.endDate) <= new Date(campaignData.startDate)) {
          toast({ title: "End date must be after start date", variant: "destructive" });
          return false;
        }
        break;
      case 2:
        if (!campaignData.locations || !campaignData.targetAudience) {
          toast({ title: "Please fill all required fields", variant: "destructive" });
          return false;
        }
        break;
      case 3:
        if (!campaignData.adCopy) {
          toast({ title: "Please provide ad copy", variant: "destructive" });
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (campaignData.creativeAssets.length + files.length > 10) {
      toast({ title: "Maximum 10 files allowed", variant: "destructive" });
      return;
    }
    updateCampaignData({ creativeAssets: [...campaignData.creativeAssets, ...files] });
  };

  const removeFile = (index: number) => {
    const newAssets = campaignData.creativeAssets.filter((_, i) => i !== index);
    updateCampaignData({ creativeAssets: newAssets });
  };

  const handleSubmit = async () => {
    if (!profile?.user_id) return;

    setIsLoading(true);
    try {
      // Get user's organization
      const { data: memberData } = await supabase
        .from('members')
        .select('org_id')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (!memberData?.org_id) {
        toast({ title: "Organization not found", variant: "destructive" });
        return;
      }

      // Create campaign
      const { data: campaignId, error } = await supabase.rpc('create_campaign', {
        p_org_id: memberData.org_id,
        p_job_id: campaignData.jobId,
        p_name: campaignData.name,
        p_objective: 'traffic',
        p_budget: parseFloat(campaignData.budget) || 0,
        p_currency: 'USD',
        p_start_date: campaignData.startDate,
        p_end_date: campaignData.endDate,
        p_targeting: { locations: campaignData.locations },
        p_creatives: { assets_count: campaignData.creativeAssets.length },
        p_ad_copy: campaignData.adCopy,
        p_cta: campaignData.ctaButton === 'learn-more' ? 'Learn More' : null,
        p_destination_url: null
      });

      if (error) throw error;

      // Update job status to "Live"
      await supabase
        .from('jobs')
        .update({ status: 'Live' })
        .eq('id', campaignData.jobId);

      // Send campaign email
      try {
        await supabase.functions.invoke('send-campaign-email', {
          body: {
            campaign_name: campaignData.name,
            job_id: campaignData.jobId,
            budget: parseFloat(campaignData.budget) || 0,
            start_date: campaignData.startDate,
            end_date: campaignData.endDate,
            location_targeting: campaignData.locations,
            target_audience: campaignData.targetAudience,
            ad_copy: campaignData.adCopy,
            cta_button: campaignData.ctaButton === 'learn-more' ? 'Learn More' : 'None',
            creative_assets_count: campaignData.creativeAssets.length,
            recipients: FIXED_EMAIL_RECIPIENTS
          }
        });
      } catch (emailErr) {
        console.error('Error sending email:', emailErr);
      }

      toast({ title: "Campaign created successfully!" });
      navigate('/campaigns');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({ title: "Error creating campaign", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Job Selection */}
            <div className="space-y-2">
              <Label htmlFor="job">Select Job *</Label>
              <Select value={campaignData.jobId} onValueChange={(value) => updateCampaignData({ jobId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.company_name} ({job.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campaign Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="Enter campaign name"
                value={campaignData.name}
                onChange={(e) => updateCampaignData({ name: e.target.value })}
              />
            </div>

            {/* Objective - Disabled */}
            <div className="space-y-2">
              <Label>Objective</Label>
              <Button 
                variant="outline" 
                className="w-full justify-between opacity-50 cursor-not-allowed"
                onClick={() => setShowDisabledPopup(true)}
              >
                Traffic or Leads
                <AlertCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Budget & Schedule */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget ($) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="1000"
                  value={campaignData.budget}
                  onChange={(e) => updateCampaignData({ budget: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={campaignData.startDate}
                    onChange={(e) => updateCampaignData({ startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={campaignData.endDate}
                    onChange={(e) => updateCampaignData({ endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Location Targeting */}
            <div className="space-y-2">
              <Label htmlFor="locations">Location Targeting *</Label>
              <Input
                id="locations"
                placeholder="Country, region, city, radius"
                value={campaignData.locations}
                onChange={(e) => updateCampaignData({ locations: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Enter location details (e.g., "New York, 25 mile radius")
              </p>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience *</Label>
              <Textarea
                id="audience"
                placeholder="Describe your target audience..."
                value={campaignData.targetAudience}
                onChange={(e) => updateCampaignData({ targetAudience: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Creative Assets */}
            <div className="space-y-4">
              <Label>Creative Assets (Max 10 files)</Label>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images or videos
                  </p>
                </label>
              </div>

              {campaignData.creativeAssets.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({campaignData.creativeAssets.length}/10)</Label>
                  <div className="space-y-2">
                    {campaignData.creativeAssets.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Generation Placeholder */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="opacity-50 cursor-not-allowed"
                  onClick={() => setShowDisabledPopup(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  AI Generate Images
                </Button>
                <Button 
                  variant="outline" 
                  className="opacity-50 cursor-not-allowed"
                  onClick={() => setShowDisabledPopup(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  AI Generate Videos
                </Button>
              </div>
            </div>

            {/* Ad Copy */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adCopy">Ad Copy *</Label>
                <Textarea
                  id="adCopy"
                  placeholder="Write your ad copy here..."
                  value={campaignData.adCopy}
                  onChange={(e) => updateCampaignData({ adCopy: e.target.value })}
                  rows={4}
                />
              </div>
              
              <Button 
                variant="outline" 
                className="opacity-50 cursor-not-allowed"
                onClick={() => setShowDisabledPopup(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                AI Generate Copy
              </Button>
            </div>

            {/* Call-to-Action */}
            <div className="space-y-2">
              <Label>Call-to-Action</Label>
              <Select 
                value={campaignData.ctaButton} 
                onValueChange={(value: 'none' | 'learn-more') => updateCampaignData({ ctaButton: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="learn-more">Learn More</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Campaign Summary</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>{campaignData.name}</CardTitle>
                <CardDescription>Campaign Preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Budget:</strong> ${campaignData.budget}
                  </div>
                  <div>
                    <strong>Duration:</strong> {campaignData.startDate} to {campaignData.endDate}
                  </div>
                  <div>
                    <strong>Location:</strong> {campaignData.locations}
                  </div>
                  <div>
                    <strong>Assets:</strong> {campaignData.creativeAssets.length} files
                  </div>
                </div>
                
                <div>
                  <strong>Target Audience:</strong>
                  <p className="mt-1 text-muted-foreground">{campaignData.targetAudience}</p>
                </div>
                
                <div>
                  <strong>Ad Copy:</strong>
                  <p className="mt-1 text-muted-foreground">{campaignData.adCopy}</p>
                </div>
                
                {campaignData.ctaButton !== 'none' && (
                  <div>
                    <strong>Call-to-Action:</strong>
                    <Badge variant="secondary" className="ml-2">Learn More</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This campaign will be emailed to: <strong>{FIXED_EMAIL_RECIPIENTS.join(', ')}</strong>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/campaigns')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground">Set up your marketing campaign</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              <step.icon className="h-5 w-5" />
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-px mx-4 ${
                currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < 4 ? (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Publishing...' : 'Publish Campaign'}
          </Button>
        )}
      </div>

      {/* Disabled Feature Popup */}
      <Dialog open={showDisabledPopup} onOpenChange={setShowDisabledPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Not Available</DialogTitle>
            <DialogDescription>
              This feature is not yet ready for the MVP.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowDisabledPopup(false)}>
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCampaign;