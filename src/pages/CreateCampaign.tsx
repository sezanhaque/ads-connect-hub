import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { posthog } from "@/lib/posthog";
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
  X,
  Layers,
} from "lucide-react";
import metaLogo from "@/assets/meta-logo.png";
import tiktokLogo from "@/assets/tiktok-logo.png";

interface Job {
  id: string;
  title: string;
  company_name: string;
  status: string;
}

interface CampaignData {
  // Platform selection
  platform: 'meta' | 'tiktok' | '';
  
  // Shared fields
  jobId: string;
  name: string;
  objective: "traffic" | "leads" | "";
  budget: string;
  startDate: string;
  endDate: string;
  locations: string;
  
  // Meta-specific
  targetAudience: string;
  
  // TikTok-specific
  ageRanges: string[];
  interests: string;
  keywords: string;
  freeTextProfiling: string;
  
  // Creative fields
  creativeAssets: Array<{
    name: string;
    path: string;
    url: string;
    type: string;
    size: number;
  }>;
  adCopy: string;
  headline: string;
  description: string;
  ctaButton: "none" | "learn-more" | "sign-up" | "shop-now" | "download";
}

const FIXED_EMAIL_RECIPIENTS = ["thealaminislam@gmail.com", "moalamin001@gmail.com"];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showDisabledPopup, setShowDisabledPopup] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    platform: "",
    jobId: "",
    name: "",
    objective: "",
    budget: "",
    startDate: "",
    endDate: "",
    locations: "",
    targetAudience: "",
    ageRanges: [],
    interests: "",
    keywords: "",
    freeTextProfiling: "",
    creativeAssets: [],
    adCopy: "",
    headline: "",
    description: "",
    ctaButton: "none",
  });

  const steps = [
    { number: 0, title: "Select Platform", icon: Layers },
    { number: 1, title: "Campaign Basics", icon: Target },
    { number: 2, title: campaignData.platform === 'tiktok' ? "Location & Targeting" : "Audience", icon: Users },
    { number: 3, title: "Creative & Copy", icon: Image },
    { number: 4, title: campaignData.platform === 'tiktok' ? "Review & Publish" : "Summary & Publishing", icon: Check },
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company_name, status")
        .eq("created_by", profile?.user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData((prev) => ({ ...prev, ...updates }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!campaignData.platform) {
          toast({ title: "Please select a platform", variant: "destructive" });
          return false;
        }
        break;
      case 1:
        if (
          !campaignData.jobId ||
          !campaignData.name ||
          !campaignData.objective ||
          !campaignData.budget ||
          !campaignData.startDate ||
          !campaignData.endDate
        ) {
          toast({ title: "Please fill all required fields", variant: "destructive" });
          return false;
        }
        if (parseFloat(campaignData.budget) <= 0) {
          toast({ title: "Budget must be greater than 0", variant: "destructive" });
          return false;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(campaignData.startDate);
        if (startDate < today) {
          toast({ title: "Start date cannot be in the past", variant: "destructive" });
          return false;
        }
        if (new Date(campaignData.endDate) <= new Date(campaignData.startDate)) {
          toast({ title: "End date must be after start date", variant: "destructive" });
          return false;
        }
        break;
      case 2:
        if (!campaignData.locations) {
          toast({ title: "Please fill location targeting", variant: "destructive" });
          return false;
        }
        // Meta-specific validation
        if (campaignData.platform === 'meta' && !campaignData.targetAudience) {
          toast({ title: "Please describe target audience", variant: "destructive" });
          return false;
        }
        // TikTok-specific validation (optional fields, so no strict validation)
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
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file count
    if (campaignData.creativeAssets.length + files.length > 10) {
      toast({ title: "Maximum 10 files allowed", variant: "destructive" });
      return;
    }

    // Validate file types and sizes
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/mov",
      "video/avi",
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB per file

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image or video format`,
          variant: "destructive",
        });
        return;
      }
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        return;
      }
    }

    // Upload files to Supabase Storage
    const uploadedFiles = [];
    setIsLoading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage.from("campaign-assets").upload(fileName, file);

        if (error) {
          throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from("campaign-assets").getPublicUrl(fileName);

        uploadedFiles.push({
          name: file.name,
          path: fileName,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size,
        });
      }

      updateCampaignData({ creativeAssets: [...campaignData.creativeAssets, ...uploadedFiles] });
      toast({ title: `Successfully uploaded ${files.length} file(s)` });
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = async (index: number) => {
    const assetToRemove = campaignData.creativeAssets[index];

    // Delete from storage if it has a path (uploaded file)
    if (assetToRemove?.path) {
      try {
        await supabase.storage.from("campaign-assets").remove([assetToRemove.path]);
      } catch (error) {
        console.error("Error deleting file from storage:", error);
      }
    }

    const newAssets = campaignData.creativeAssets.filter((_, i) => i !== index);
    updateCampaignData({ creativeAssets: newAssets });
  };

  const handleSubmit = async () => {
    if (!profile?.user_id) return;

    setIsLoading(true);
    try {
      // Get all user memberships and select preferred org (owner > admin > member)
      const { data: memberships, error: membershipsError } = await supabase
        .from("members")
        .select("org_id, role")
        .eq("user_id", profile.user_id);

      if (membershipsError) {
        throw membershipsError;
      }

      const preferred = (() => {
        if (!memberships || memberships.length === 0) return null;
        return (
          memberships.find((m: any) => m.role === "owner") ||
          memberships.find((m: any) => m.role === "admin") ||
          memberships.find((m: any) => m.role === "member") ||
          memberships[0]
        );
      })();

      if (!preferred?.org_id) {
        toast({
          title: "Organization not found",
          description: "Organization not found for this account. Please accept your invite or contact support.",
          variant: "destructive",
        });
        return;
      }

      // Prepare targeting data based on platform
      const targeting = campaignData.platform === 'tiktok' 
        ? {
            locations: campaignData.locations,
            age_ranges: campaignData.ageRanges,
            interests: campaignData.interests,
            keywords: campaignData.keywords,
            profiling: campaignData.freeTextProfiling,
          }
        : { 
            locations: campaignData.locations,
            target_audience: campaignData.targetAudience,
          };

      // Create campaign
      const { data: campaignId, error } = await supabase.rpc("create_campaign", {
        p_org_id: preferred.org_id,
        p_job_id: campaignData.jobId,
        p_name: campaignData.name,
        p_objective: campaignData.objective || "traffic",
        p_budget: parseFloat(campaignData.budget) || 0,
        p_currency: "USD",
        p_start_date: campaignData.startDate,
        p_end_date: campaignData.endDate,
        p_targeting: targeting,
        p_creatives: {
          assets_count: campaignData.creativeAssets.length,
          assets: campaignData.creativeAssets.map((asset) => ({
            name: asset.name,
            path: asset.path,
            type: asset.type,
            size: asset.size,
          })),
          headline: campaignData.headline || null,
          description: campaignData.description || null,
        },
        p_ad_copy: campaignData.adCopy,
        p_cta: campaignData.ctaButton !== 'none' ? campaignData.ctaButton.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null,
        p_destination_url: null,
      });

      // Update campaign platform
      await supabase.from("campaigns").update({ platform: campaignData.platform }).eq("id", campaignId);

      if (error) throw error;

      // Track campaign creation
      posthog.capture('campaign_created', {
        campaign_name: campaignData.name,
        objective: campaignData.objective,
        budget: parseFloat(campaignData.budget),
        creative_assets_count: campaignData.creativeAssets.length,
      });

      // Update job status to "Live"
      await supabase.from("jobs").update({ status: "live" }).eq("id", campaignData.jobId);

      // Update campaign status to "active"
      await supabase.from("campaigns").update({ status: "active" }).eq("id", campaignId);

      // Send campaign email
      try {
        const emailBody = {
          platform: campaignData.platform,
          campaign_name: campaignData.name,
          job_id: campaignData.jobId,
          budget: parseFloat(campaignData.budget) || 0,
          start_date: campaignData.startDate,
          end_date: campaignData.endDate,
          location_targeting: campaignData.locations,
          ad_copy: campaignData.adCopy,
          cta_button: campaignData.ctaButton !== 'none' ? campaignData.ctaButton.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "None",
          creative_assets_count: campaignData.creativeAssets.length,
          creative_assets: campaignData.creativeAssets,
          recipients: FIXED_EMAIL_RECIPIENTS,
          // Meta-specific
          ...(campaignData.platform === 'meta' && {
            target_audience: campaignData.targetAudience,
          }),
          // TikTok-specific
          ...(campaignData.platform === 'tiktok' && {
            age_ranges: campaignData.ageRanges,
            interests: campaignData.interests,
            keywords: campaignData.keywords,
            profiling: campaignData.freeTextProfiling,
            headline: campaignData.headline,
            description: campaignData.description,
          }),
        };

        const { data: emailResult, error: emailError } = await supabase.functions.invoke("send-campaign-email", {
          body: emailBody,
        });

        if (emailError) {
          console.error("Email function error:", emailError);
          toast({
            title: "Campaign created but email failed",
            description: `Campaign is active but notification email could not be sent: ${emailError.message}`,
            variant: "destructive",
          });
        } else {
          console.log("Email sent successfully:", emailResult);
          toast({ title: "Campaign created and email sent successfully!" });
        }
      } catch (emailErr) {
        console.error("Error sending email:", emailErr);
        toast({
          title: "Campaign created but email failed",
          description: "Campaign is active but notification email could not be sent",
          variant: "destructive",
        });
      }

      navigate("/campaigns");
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({ title: "Error creating campaign", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Choose Your Campaign Platform</h3>
              <p className="text-muted-foreground">Select the platform where you want to run your campaign</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => updateCampaignData({ platform: 'meta' })}
                className={`p-8 border-2 rounded-lg transition-all hover:shadow-md ${
                  campaignData.platform === 'meta'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <img src={metaLogo} alt="Meta" className="h-16 w-16 object-contain" />
                  <div className="text-center">
                    <h4 className="font-semibold text-lg">Meta</h4>
                    <p className="text-sm text-muted-foreground mt-1">Facebook & Instagram</p>
                  </div>
                  {campaignData.platform === 'meta' && (
                    <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateCampaignData({ platform: 'tiktok' })}
                className={`p-8 border-2 rounded-lg transition-all hover:shadow-md ${
                  campaignData.platform === 'tiktok'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <img src={tiktokLogo} alt="TikTok" className="h-16 w-16 object-contain" />
                  <div className="text-center">
                    <h4 className="font-semibold text-lg">TikTok</h4>
                    <p className="text-sm text-muted-foreground mt-1">TikTok Ads</p>
                  </div>
                  {campaignData.platform === 'tiktok' && (
                    <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                  )}
                </div>
              </button>
            </div>
          </div>
        );

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

            {/* Objective */}
            <div className="space-y-2">
              <Label>Objective *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={campaignData.objective === "traffic" ? "default" : "outline"}
                  className="w-full justify-center"
                  onClick={() => updateCampaignData({ objective: "traffic" })}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Traffic
                </Button>
                <Button
                  type="button"
                  variant={campaignData.objective === "leads" ? "default" : "outline"}
                  className={`w-full justify-center ${campaignData.platform === 'meta' ? 'opacity-60' : ''}`}
                  onClick={() => {
                    if (campaignData.platform === 'meta') {
                      setShowDisabledPopup(true);
                    } else {
                      updateCampaignData({ objective: "leads" });
                    }
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Leads {campaignData.platform === 'tiktok' && <Badge variant="secondary" className="ml-2">TikTok</Badge>}
                </Button>
              </div>
            </div>

            {/* Budget & Schedule */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget ($) *</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
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
                    min={new Date().toISOString().split("T")[0]}
                    value={campaignData.startDate}
                    onChange={(e) => updateCampaignData({ startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={campaignData.startDate || new Date().toISOString().split("T")[0]}
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
                placeholder="Country, region, city, or custom radius"
                value={campaignData.locations}
                onChange={(e) => updateCampaignData({ locations: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Enter location details (e.g., "New York, 25 mile radius")</p>
            </div>

            {/* Meta-specific: Target Audience */}
            {campaignData.platform === 'meta' && (
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
            )}

            {/* TikTok-specific: Enhanced Targeting */}
            {campaignData.platform === 'tiktok' && (
              <>
                <div className="space-y-2">
                  <Label>Age Brackets (Select multiple)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['18-24', '25-34', '35-44', '45-54', '55+'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => {
                          const newRanges = campaignData.ageRanges.includes(range)
                            ? campaignData.ageRanges.filter(r => r !== range)
                            : [...campaignData.ageRanges, range];
                          updateCampaignData({ ageRanges: newRanges });
                        }}
                        className={`p-3 border rounded-lg text-sm transition-all ${
                          campaignData.ageRanges.includes(range)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Optional - Select one or more age groups</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (Optional)</Label>
                  <Input
                    id="interests"
                    placeholder="e.g., Sports, Technology, Fashion"
                    value={campaignData.interests}
                    onChange={(e) => updateCampaignData({ interests: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">Enter interests separated by commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (Optional)</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., running shoes, fitness, workout"
                    value={campaignData.keywords}
                    onChange={(e) => updateCampaignData({ keywords: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">Enter keywords related to your campaign</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profiling">Target Audience Description (Optional)</Label>
                  <Textarea
                    id="profiling"
                    placeholder="Describe your ideal audience in detail..."
                    value={campaignData.freeTextProfiling}
                    onChange={(e) => updateCampaignData({ freeTextProfiling: e.target.value })}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">Free-form description of your target audience</p>
                </div>
              </>
            )}
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
                  <p className="text-sm text-muted-foreground">Click to upload images or videos</p>
                </label>
              </div>

              {campaignData.creativeAssets.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({campaignData.creativeAssets.length}/10)</Label>
                  <div className="space-y-2">
                    {campaignData.creativeAssets.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          {file.type?.startsWith("image/") ? (
                            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-semibold">IMG</span>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">
                              <span className="text-purple-600 text-xs font-semibold">VID</span>
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium">{file.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "Unknown size"}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={isLoading}>
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
              {/* TikTok-specific: Headline and Description */}
              {campaignData.platform === 'tiktok' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      placeholder="Enter your headline (optional)"
                      value={campaignData.headline}
                      onChange={(e) => updateCampaignData({ headline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter your description (optional)"
                      value={campaignData.description}
                      onChange={(e) => updateCampaignData({ description: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="adCopy">{campaignData.platform === 'tiktok' ? 'Main Ad Text *' : 'Ad Copy *'}</Label>
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
                onValueChange={(value: any) => updateCampaignData({ ctaButton: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="learn-more">Learn More</SelectItem>
                  {campaignData.platform === 'tiktok' && (
                    <>
                      <SelectItem value="sign-up">Sign Up</SelectItem>
                      <SelectItem value="shop-now">Shop Now</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{campaignData.platform === 'tiktok' ? 'Review & Publish' : 'Campaign Summary'}</h3>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{campaignData.name}</CardTitle>
                    <CardDescription>Campaign Preview</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <img 
                      src={campaignData.platform === 'meta' ? metaLogo : tiktokLogo} 
                      alt={campaignData.platform} 
                      className="h-8 w-8 object-contain"
                    />
                    <Badge variant="secondary">{campaignData.platform === 'meta' ? 'Meta' : 'TikTok'}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Objective:</strong> {campaignData.objective === 'traffic' ? 'Traffic' : 'Leads'}
                  </div>
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

                {campaignData.platform === 'meta' && campaignData.targetAudience && (
                  <div>
                    <strong>Target Audience:</strong>
                    <p className="mt-1 text-muted-foreground">{campaignData.targetAudience}</p>
                  </div>
                )}

                {campaignData.platform === 'tiktok' && (
                  <div className="space-y-3">
                    {campaignData.ageRanges.length > 0 && (
                      <div>
                        <strong>Age Brackets:</strong>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {campaignData.ageRanges.map(range => (
                            <Badge key={range} variant="outline">{range}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {campaignData.interests && (
                      <div>
                        <strong>Interests:</strong>
                        <p className="mt-1 text-muted-foreground">{campaignData.interests}</p>
                      </div>
                    )}
                    {campaignData.keywords && (
                      <div>
                        <strong>Keywords:</strong>
                        <p className="mt-1 text-muted-foreground">{campaignData.keywords}</p>
                      </div>
                    )}
                    {campaignData.freeTextProfiling && (
                      <div>
                        <strong>Audience Profiling:</strong>
                        <p className="mt-1 text-muted-foreground">{campaignData.freeTextProfiling}</p>
                      </div>
                    )}
                  </div>
                )}

                {campaignData.platform === 'tiktok' && (
                  <>
                    {campaignData.headline && (
                      <div>
                        <strong>Headline:</strong>
                        <p className="mt-1 text-muted-foreground">{campaignData.headline}</p>
                      </div>
                    )}
                    {campaignData.description && (
                      <div>
                        <strong>Description:</strong>
                        <p className="mt-1 text-muted-foreground">{campaignData.description}</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <strong>{campaignData.platform === 'tiktok' ? 'Main Ad Text:' : 'Ad Copy:'}</strong>
                  <p className="mt-1 text-muted-foreground">{campaignData.adCopy}</p>
                </div>

                {campaignData.ctaButton !== "none" && (
                  <div>
                    <strong>Call-to-Action:</strong>
                    <Badge variant="secondary" className="ml-2">
                      {campaignData.ctaButton.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/campaigns")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">Set up your marketing campaign</p>
        </div>
      </div>

      {/* Progress Steps - Only show after platform selection */}
      {currentStep > 0 && (
        <div className="flex justify-between mb-8 overflow-x-auto">
          {steps.slice(1).map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium whitespace-nowrap ${
                    currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.slice(1).length - 1 && (
                <div className={`w-12 h-px mx-4 ${currentStep > step.number ? "bg-primary" : "bg-muted-foreground"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      <Card className="mb-8">
        {currentStep > 0 && (
          <CardHeader>
            <CardTitle>{steps[currentStep]?.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
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
            {isLoading ? "Publishing..." : "Publish Campaign"}
          </Button>
        )}
      </div>

      {/* Disabled Feature Popup */}
      <Dialog open={showDisabledPopup} onOpenChange={setShowDisabledPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Not Available</DialogTitle>
            <DialogDescription>This feature is not yet ready for the MVP.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowDisabledPopup(false)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCampaign;
