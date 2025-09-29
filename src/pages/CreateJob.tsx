import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    job_id: '',
    job_status: 'open',
    job_title: '',
    short_description: '',
    location_city: '',
    vacancy_url: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.user_id) {
      toast({
        title: "Error",
        description: "Please log in to create a job",
        variant: "destructive",
      });
      return;
    }

    if (!formData.job_title.trim()) {
      toast({
        title: "Error", 
        description: "Job title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get all user memberships and select preferred org (owner > admin > member)
      const { data: memberships, error: membershipsError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', profile.user_id);

      if (membershipsError) {
        throw membershipsError;
      }

      const preferred = (() => {
        if (!memberships || memberships.length === 0) return null;
        return (
          memberships.find((m: any) => m.role === 'owner') ||
          memberships.find((m: any) => m.role === 'admin') ||
          memberships.find((m: any) => m.role === 'member') ||
          memberships[0]
        );
      })();

      if (!preferred?.org_id) {
        toast({
          title: "Error",
          description: "Organization not found for this account. Please accept your invite or contact support.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('jobs')
        .insert([
          {
            org_id: preferred.org_id,
            external_id: formData.job_id.trim() || null,
            title: formData.job_title.trim(),
            description: formData.short_description.trim() || null,
            status: formData.job_status,
            company_name: formData.company_name.trim() || null,
            location: formData.location_city.trim() || null,
            vacancy_url: formData.vacancy_url.trim() || null,
            created_by: profile.user_id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job created successfully",
      });

      navigate('/jobs');
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: "Error creating job",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/jobs')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-center">Create New Job</h1>
          <p className="text-muted-foreground">
            Add a new job posting to your organization
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  placeholder="e.g. Tech Corp"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_id">Job ID *</Label>
                <Input
                  id="job_id"
                  placeholder="e.g. JOB-001"
                  value={formData.job_id}
                  onChange={(e) => handleInputChange('job_id', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_status">Status</Label>
                <Select 
                  value={formData.job_status} 
                  onValueChange={(value) => handleInputChange('job_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_city">Location</Label>
                <Input
                  id="location_city"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location_city}
                  onChange={(e) => handleInputChange('location_city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacancy_url">Job URL</Label>
                <Input
                  id="vacancy_url"
                  type="url"
                  placeholder="https://company.com/jobs/123"
                  value={formData.vacancy_url}
                  onChange={(e) => handleInputChange('vacancy_url', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Description</Label>
              <Textarea
                id="short_description"
                placeholder="Brief description of the job requirements and responsibilities..."
                rows={4}
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/jobs')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJob;