import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIntegrations } from '@/hooks/useIntegrations';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string | null;
  status: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const Jobs = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { syncGoogleSheets, loading: integrationsLoading } = useIntegrations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    status: 'active'
  });
  const [sheetsUrl, setSheetsUrl] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error loading jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSync = async () => {
    if (!sheetsUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await syncGoogleSheets(sheetsUrl);
      setSheetsUrl('');
      fetchJobs(); // Refresh jobs list
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const handleCreateJob = async () => {
    const orgId = profile?.organization_id ?? null;

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Job title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
          .insert([{
            organization_id: orgId,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            status: formData.status,
            created_by: profile?.user_id ?? user?.id as string
          }]);

      if (error) throw error;

      toast({
        title: "Job created",
        description: "New job has been created successfully",
      });

      setFormData({ title: '', description: '', budget: '', status: 'active' });
      setIsCreateDialogOpen(false);
      fetchJobs();
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: "Error creating job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      budget: '',
      status: job.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Job title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      toast({
        title: "Job updated",
        description: "Job has been updated successfully",
      });

      setFormData({ title: '', description: '', budget: '', status: 'active' });
      setIsEditDialogOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job deleted",
        description: "Job has been deleted successfully",
      });

      fetchJobs();
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error deleting job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            Manage job postings and sync with Google Sheets
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Sheets
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync Google Sheets</DialogTitle>
                <DialogDescription>
                  Enter your Google Sheets URL to sync job data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sheets-url">Google Sheets URL</Label>
                  <Input
                    id="sheets-url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSync}
                  disabled={integrationsLoading}
                  className="w-full"
                >
                  {integrationsLoading ? 'Syncing...' : 'Sync Jobs'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Job</DialogTitle>
                <DialogDescription>
                  Create a new job posting manually
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input 
                    id="job-title" 
                    placeholder="e.g. Senior Developer"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="job-description">Description</Label>
                  <Textarea 
                    id="job-description" 
                    placeholder="Brief job description..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="job-budget">Budget ($)</Label>
                  <Input 
                    id="job-budget" 
                    type="number" 
                    placeholder="2500"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="job-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateJob}>
                    Create Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Job Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Job</DialogTitle>
                <DialogDescription>
                  Update job posting details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-job-title">Job Title</Label>
                  <Input 
                    id="edit-job-title" 
                    placeholder="e.g. Senior Developer"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-job-description">Description</Label>
                  <Textarea 
                    id="edit-job-description" 
                    placeholder="Brief job description..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-job-budget">Budget ($)</Label>
                  <Input 
                    id="edit-job-budget" 
                    type="number" 
                    placeholder="2500"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-job-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateJob}>
                    Update Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading jobs...</div>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>{job.description || 'No description'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Status: {job.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {new Date(job.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No jobs found</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first job or sync with Google Sheets'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;