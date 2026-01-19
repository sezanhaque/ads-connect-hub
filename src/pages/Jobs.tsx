import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIntegrations } from '@/hooks/useIntegrations';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink,
  RefreshCw,
  Edit,
  Trash2,
  Megaphone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import metaLogo from '@/assets/meta-logo.png';
import tiktokLogo from '@/assets/tiktok-logo.png';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Job {
  id: string;
  external_id: string | null;
  title: string;
  description: string | null;
  status: string;
  company_name: string | null;
  location: string | null;
  vacancy_url: string | null;
  org_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const Jobs = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { syncJobsFromSheet, loading: integrationsLoading } = useIntegrations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    company_name: '',
    external_id: '',
    location: '',
    vacancy_url: ''
  });
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    if (profile?.user_id) {
      fetchJobs();
      fetchOrganization();
    }
  }, [profile?.user_id]);

  const fetchOrganization = async () => {
    if (!profile?.user_id) return;

    try {
      // Get all user memberships and pick the best one (owner > admin > member)  
      const { data: memberships } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', profile.user_id);

      const preferred = (() => {
        if (!memberships || memberships.length === 0) return null;
        return (
          memberships.find((m: any) => m.role === 'owner') ||
          memberships.find((m: any) => m.role === 'admin') ||
          memberships.find((m: any) => m.role === 'member') ||
          memberships[0]
        );
      })();

      if (preferred?.org_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', preferred.org_id)
          .single();

        setOrganization(orgData);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const fetchJobs = async () => {
    if (!profile?.user_id) return;

    try {
      // Get user's primary organization (prioritize their own org over admin orgs)
      const { data: memberships, error: membershipsError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', profile.user_id);

      if (membershipsError) throw membershipsError;

      // Find user's primary org (prefer owner/admin roles over member)
      const primaryOrg = (() => {
        if (!memberships || memberships.length === 0) return null;
        return (
          memberships.find((m: any) => m.role === 'owner') ||
          memberships.find((m: any) => m.role === 'admin') ||
          memberships.find((m: any) => m.role === 'member') ||
          memberships[0]
        );
      })();

      if (!primaryOrg?.org_id) {
        setJobs([]);
        setLoading(false);
        return;
      }

      // Fetch jobs only from user's primary organization
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('org_id', primaryOrg.org_id)
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
                         (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (job.company_name && job.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (job.external_id && job.external_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSync = async () => {
    if (!organization?.google_sheet_id) {
      toast({
        title: "No Google Sheet configured",
        description: "Please configure a Google Sheet ID in Organization Settings first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await syncJobsFromSheet(organization.id, organization.google_sheet_id);
      fetchJobs(); // Refresh jobs list
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      status: job.status,
      company_name: job.company_name || '',
      external_id: job.external_id || '',
      location: job.location || '',
      vacancy_url: job.vacancy_url || ''
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
          status: formData.status,
          company_name: formData.company_name.trim() || null,
          external_id: formData.external_id.trim() || null,
          location: formData.location.trim() || null,
          vacancy_url: normalizeUrl(formData.vacancy_url) || null
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      toast({
        title: "Job updated",
        description: "Job has been updated successfully",
      });

      setFormData({ title: '', description: '', status: 'open', company_name: '', external_id: '', location: '', vacancy_url: '' });
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
          {/* <Button 
            variant="outline"
            onClick={handleSync}
            disabled={integrationsLoading || !organization?.google_sheet_id}
          >
            {integrationsLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Sheets
              </>
            )}
          </Button> */}
          
          <Button onClick={() => navigate('/jobs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
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
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading jobs...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No jobs found</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      {job.external_id || '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        {job.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {job.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{job.company_name || '-'}</TableCell>
                    <TableCell>{job.location || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(job.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Megaphone className="h-4 w-4" />
                            Create
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem 
                            onClick={() => navigate(`/campaigns/create?jobId=${job.id}&platform=meta`)}
                            className="gap-2 cursor-pointer"
                          >
                            <img src={metaLogo} alt="Meta" className="h-4 w-4" />
                            Meta
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/campaigns/create?jobId=${job.id}&platform=tiktok`)}
                            className="gap-2 cursor-pointer"
                          >
                            <img src={tiktokLogo} alt="TikTok" className="h-4 w-4" />
                            TikTok
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {job.vacancy_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={job.vacancy_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update job posting details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-job-title">Job Title *</Label>
                <Input 
                  id="edit-job-title" 
                  placeholder="e.g. Senior Developer"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-company-name">Company Name</Label>
                <Input 
                  id="edit-company-name" 
                  placeholder="e.g. Tech Corp"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-external-id">Job ID</Label>
                <Input 
                  id="edit-external-id" 
                  placeholder="e.g. JOB-001"
                  value={formData.external_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_id: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-job-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-vacancy-url">Job URL</Label>
                <Input 
                  id="edit-vacancy-url" 
                  placeholder="e.g. company.com/jobs/123"
                  value={formData.vacancy_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, vacancy_url: e.target.value }))}
                />
              </div>
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
  );
};

export default Jobs;