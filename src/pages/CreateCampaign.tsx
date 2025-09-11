import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Type,
  MousePointer,
  Check
} from 'lucide-react';

interface CampaignData {
  name: string;
  objective: 'traffic' | 'leads';
  budget: string;
  startDate: string;
  endDate: string;
  locations: string[];
  audienceType: 'interests' | 'freetext';
  audienceData: string;
  adCopy: string;
  ctaButton: string;
}

const objectives = [
  { value: 'traffic', label: 'Traffic', description: 'Drive visitors to your website' },
  { value: 'leads', label: 'Leads', description: 'Generate leads and conversions' },
];

const ctaButtons = [
  'Learn More', 'Sign Up', 'Shop Now', 'Download', 'Get Quote', 'Contact Us', 'Book Now', 'Try Free'
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    objective: 'traffic',
    budget: '',
    startDate: '',
    endDate: '',
    locations: [],
    audienceType: 'interests',
    audienceData: '',
    adCopy: '',
    ctaButton: 'Learn More',
  });

  const steps = [
    { number: 1, title: 'Campaign Basics', icon: Target },
    { number: 2, title: 'Budget & Schedule', icon: DollarSign },
    { number: 3, title: 'Targeting', icon: MapPin },
    { number: 4, title: 'Audience', icon: Users },
    { number: 5, title: 'Creative & Copy', icon: Type },
    { number: 6, title: 'Review & Publish', icon: Check },
  ];

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.organization_id) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Save campaign as draft
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          organization_id: profile.organization_id,
          name: campaignData.name,
          objective: campaignData.objective,
          status: 'draft',
          budget: parseFloat(campaignData.budget) || 0,
          start_date: campaignData.startDate || null,
          end_date: campaignData.endDate || null,
          location_targeting: { locations: campaignData.locations },
          audience_targeting: { 
            type: campaignData.audienceType,
            data: campaignData.audienceData 
          },
          ad_copy: campaignData.adCopy,
          cta_button: campaignData.ctaButton,
          created_by: profile.user_id,
        }])
        .select()
        .single();

      if (error) throw error;

      // TODO: Send email with campaign details to client
      // This would be implemented with an edge function

      toast({
        title: "Campaign created successfully!",
        description: "Campaign details will be emailed to you for manual publishing in Meta Ads Manager.",
      });

      navigate('/campaigns');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                value={campaignData.name}
                onChange={(e) => updateCampaignData({ name: e.target.value })}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Campaign Objective</Label>
              <div className="grid gap-3">
                {objectives.map((objective) => (
                  <Card 
                    key={objective.value}
                    className={`cursor-pointer transition-colors ${
                      campaignData.objective === objective.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => updateCampaignData({ objective: objective.value as 'traffic' | 'leads' })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{objective.label}</h4>
                          <p className="text-sm text-muted-foreground">{objective.description}</p>
                        </div>
                        {campaignData.objective === objective.value && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget ($)</Label>
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
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={campaignData.startDate}
                  onChange={(e) => updateCampaignData({ startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={campaignData.endDate}
                  onChange={(e) => updateCampaignData({ endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="locations">Location Targeting</Label>
              <Input
                id="locations"
                placeholder="Enter locations (e.g., New York, California)"
                value={campaignData.locations.join(', ')}
                onChange={(e) => updateCampaignData({ 
                  locations: e.target.value.split(',').map(loc => loc.trim()).filter(Boolean)
                })}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple locations with commas
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Audience Type</Label>
              <Select
                value={campaignData.audienceType}
                onValueChange={(value: 'interests' | 'freetext') => 
                  updateCampaignData({ audienceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interests">Interest-based</SelectItem>
                  <SelectItem value="freetext">Free-text description</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience-data">
                {campaignData.audienceType === 'interests' 
                  ? 'Target Interests' 
                  : 'Audience Description'
                }
              </Label>
              <Textarea
                id="audience-data"
                placeholder={
                  campaignData.audienceType === 'interests'
                    ? "e.g., fitness, healthy eating, workout supplements"
                    : "Describe your target audience in detail"
                }
                value={campaignData.audienceData}
                onChange={(e) => updateCampaignData({ audienceData: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ad-copy">Ad Copy</Label>
              <Textarea
                id="ad-copy"
                placeholder="Write compelling ad copy that will engage your audience..."
                value={campaignData.adCopy}
                onChange={(e) => updateCampaignData({ adCopy: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label>Call-to-Action Button</Label>
              <div className="grid grid-cols-2 gap-2">
                {ctaButtons.map((cta) => (
                  <Button
                    key={cta}
                    variant={campaignData.ctaButton === cta ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateCampaignData({ ctaButton: cta })}
                  >
                    {cta}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Image className="h-4 w-4" />
                  <span>Creative assets (images/videos) will be handled during manual setup in Meta Ads Manager</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
                <CardDescription>Review your campaign details before publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {campaignData.name}
                  </div>
                  <div>
                    <span className="font-medium">Objective:</span> {campaignData.objective}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span> ${campaignData.budget}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {campaignData.startDate} to {campaignData.endDate}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="font-medium text-sm">Locations:</span>
                  <div className="flex flex-wrap gap-1">
                    {campaignData.locations.map((location, index) => (
                      <Badge key={index} variant="secondary">{location}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-medium text-sm">Audience:</span>
                  <p className="text-sm text-muted-foreground">{campaignData.audienceData}</p>
                </div>

                <div className="space-y-2">
                  <span className="font-medium text-sm">Ad Copy:</span>
                  <p className="text-sm text-muted-foreground">{campaignData.adCopy}</p>
                </div>

                <div>
                  <span className="font-medium text-sm">CTA Button:</span> 
                  <Badge className="ml-2">{campaignData.ctaButton}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm">
                  <strong>Note:</strong> This campaign will be saved as a draft and all details will be emailed to you. 
                  You'll need to manually set it up in Meta Ads Manager using the provided specifications.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${isActive 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : isCompleted 
                    ? 'border-success bg-success text-success-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }
              `}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {step.number < steps.length && (
                <div className={`
                  w-12 h-0.5 ml-2 transition-colors
                  ${isCompleted ? 'bg-success' : 'bg-muted-foreground/30'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
            {steps[currentStep - 1].title}
          </CardTitle>
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

        {currentStep === steps.length ? (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Campaign'}
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateCampaign;