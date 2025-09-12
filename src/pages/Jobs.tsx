import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  RefreshCw
} from 'lucide-react';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - would come from Supabase
  const jobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      description: 'React, TypeScript, 3+ years experience',
      status: 'active',
      external_id: 'GSHEET_001',
      created_at: '2024-01-15',
      metadata: {
        source: 'google_sheets',
        last_sync: '2024-01-20T10:30:00Z',
        applications: 45,
        budget: 2500
      }
    },
    {
      id: '2', 
      title: 'Product Marketing Manager',
      description: 'B2B SaaS experience, campaign management',
      status: 'paused',
      external_id: 'GSHEET_002',
      created_at: '2024-01-10',
      metadata: {
        source: 'google_sheets',
        last_sync: '2024-01-19T15:45:00Z',
        applications: 23,
        budget: 1800
      }
    },
    {
      id: '3',
      title: 'UX Designer',
      description: 'Figma, user research, portfolio required',
      status: 'active',
      external_id: 'MANUAL_001',
      created_at: '2024-01-18',
      metadata: {
        source: 'manual',
        applications: 12,
        budget: 2000
      }
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleSync = () => {
    // Would trigger Google Sheets sync edge function
    console.log('Syncing with Google Sheets...');
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
          <Button variant="outline" onClick={handleSync}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Sheets
          </Button>
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
                  <Input id="job-title" placeholder="e.g. Senior Developer" />
                </div>
                <div>
                  <Label htmlFor="job-description">Description</Label>
                  <Textarea 
                    id="job-description" 
                    placeholder="Brief job description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="job-budget">Budget ($)</Label>
                  <Input id="job-budget" type="number" placeholder="2500" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Create Job
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
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription>{job.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.metadata.applications} applications</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${job.metadata.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                {job.metadata.source === 'google_sheets' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span>Google Sheets</span>
                  </div>
                )}
              </div>
              
              {job.metadata.last_sync && (
                <div className="text-xs text-muted-foreground">
                  Last synced: {new Date(job.metadata.last_sync).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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