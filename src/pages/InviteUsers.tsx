import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Mail, Search, Users, Shield, CheckCircle, UserX } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at: string;
  user_id: string;
  is_member: boolean;
}

const InviteUsers = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [adAccountIds, setAdAccountIds] = useState<string[]>([]);
  const [currentAdAccountId, setCurrentAdAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.organization_id) {
      fetchUsers();
    }
  }, [profile?.organization_id]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      const email = user.email || '';
      const searchLower = searchTerm.toLowerCase();
      
      return email.toLowerCase().includes(searchLower) ||
             fullName.toLowerCase().includes(searchLower);
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    if (!profile?.organization_id) {
      console.log('No organization_id available yet');
      return;
    }

    try {
      setLoadingUsers(true);
      console.log('Fetching users for org:', profile.organization_id);
      
      // Fetch all users in the app for admin to see and invite
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Found profiles:', profilesData?.length || 0);

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        return;
      }

      // Get all user IDs to check their membership status
      const userIds = profilesData.map(profile => profile.user_id);

      // Check which users are already members of this organization
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('user_id, role')
        .eq('org_id', profile.organization_id)
        .in('user_id', userIds);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      console.log('Found members:', membersData?.length || 0);

      // Transform the data to include membership status
      const transformedUsers = profilesData.map(userProfile => {
        const membership = membersData?.find(m => m.user_id === userProfile.user_id);
        return {
          id: userProfile.user_id,
          user_id: userProfile.user_id,
          email: userProfile.email || 'No email',
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          role: membership ? membership.role : null,
          created_at: userProfile.created_at,
          is_member: !!membership,
        };
      });
      
      console.log('Transformed users:', transformedUsers.length);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInviteUser = async () => {
    if (!selectedUser || !profile?.organization_id) {
      toast({
        title: "Error",
        description: "Invalid user or organization",
        variant: "destructive",
      });
      return;
    }

    if (adAccountIds.length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one AD Account ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting user invitation process...');

      // Automatically add "act_" prefix to all IDs
      const finalAdAccountIds = adAccountIds.map(id => {
        const trimmed = id.trim();
        return trimmed.startsWith('act_') ? trimmed : `act_${trimmed}`;
      });

      // 1) Ensure the user is a member of the admin org (ignore duplicates)
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          user_id: selectedUser.user_id,
          org_id: profile.organization_id,
          role: 'member',
        });
      if (memberError && memberError.code !== '23505') {
        throw memberError;
      }

      // 2) Securely set up the invited user's own organization integration and sync via Edge Function
      const { data, error } = await supabase.functions.invoke('member-meta-setup', {
        body: {
          target_user_id: selectedUser.user_id,
          ad_account_ids: finalAdAccountIds,
          admin_org_id: profile.organization_id,
          append: true, // Tell edge function to append, not replace
        },
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to set up Meta integration for user');
      }

      toast({
        title: 'Ad Accounts added successfully!',
        description: `${selectedUser.email} now has access to ${finalAdAccountIds.length} new ad account(s). Data has been synced.`,
      });

      // Reset form and close dialog
      setAdAccountIds([]);
      setCurrentAdAccountId('');
      setSelectedUser(null);
      setDialogOpen(false);

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      if (error?.code === '23505') {
        toast({
          title: 'User already in organization',
          description: 'This user is already a member of your organization',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add ad accounts. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !profile?.organization_id) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (adAccountIds.length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one AD Account ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Automatically add "act_" prefix to all IDs
      const finalAdAccountIds = adAccountIds.map(id => {
        const trimmed = id.trim();
        return trimmed.startsWith('act_') ? trimmed : `act_${trimmed}`;
      });

      // Generate a unique token
      const token = crypto.randomUUID();
      
      // Create invite record
      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          email,
          role,
          org_id: profile.organization_id,
          token,
          ad_account_id: finalAdAccountIds,
        });

      if (inviteError) throw inviteError;

      // Get organization name for the email
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .single();

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          role,
          token,
          inviterName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Admin',
          organizationName: orgData?.name || 'Your Organization'
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Invitation created but email failed",
          description: "The invitation was saved but the email could not be sent. Please check the logs.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invitation sent!",
          description: `An invitation email has been sent to ${email}`,
        });
      }
      
      setEmail('');
      setRole('member');
      setAdAccountIds([]);
      setCurrentAdAccountId('');
    } catch (error: any) {
      console.error('Error sending invite:', error);
      
      // Handle duplicate invite error
      if (error?.code === '23505') {
        toast({
          title: "Invitation already sent",
          description: "An invitation has already been sent to this email address",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send invitation. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users and invite new team members to your organization.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription>
              View all users in the app and invite them to your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'No name provided'
                            }
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.is_member ? (
                              <Badge variant={user.role === 'admin' || user.role === 'owner' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                                {(user.role === 'admin' || user.role === 'owner') && <Shield className="h-3 w-3" />}
                                {user.role === 'owner' ? 'Owner' : user.role === 'admin' ? 'Admin' : 'Member'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <UserX className="h-3 w-3" />
                                Not a member
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                           <TableCell>
                             {user.is_member ? (
                               <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                 <CheckCircle className="h-3 w-3" />
                                 In Organization
                               </Badge>
                             ) : (
                                <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                  setDialogOpen(open);
                                   if (!open) {
                                     setSelectedUser(null);
                                     setAdAccountIds([]);
                                     setCurrentAdAccountId('');
                                   }
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        setSelectedUser(user);
                                        
                                        // Fetch existing ad account IDs for this user
                                        const { data: ownerMembership } = await supabase
                                          .from('members')
                                          .select('org_id')
                                          .eq('user_id', user.user_id)
                                          .eq('role', 'owner')
                                          .maybeSingle();

                                        if (ownerMembership?.org_id) {
                                          const { data: integration } = await supabase
                                            .from('integrations')
                                            .select('ad_account_id')
                                            .eq('org_id', ownerMembership.org_id)
                                            .eq('integration_type', 'meta')
                                            .eq('user_id', user.user_id)
                                            .maybeSingle();

                                          if (integration?.ad_account_id) {
                                            // Pre-populate with existing IDs (without act_ prefix for display)
                                            const existingIds = (integration.ad_account_id as string[])
                                              .map(id => id.replace(/^act_/, ''));
                                            setAdAccountIds(existingIds);
                                          }
                                        }
                                        
                                        setDialogOpen(true);
                                      }}
                                      className="flex items-center gap-1"
                                    >
                                      <UserPlus className="h-3 w-3" />
                                      Add Ad Accounts
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Add Ad Accounts to User</DialogTitle>
                                      <DialogDescription>
                                        Add or update Meta Ad Account access for {user.email}. Existing accounts will be preserved.
                                      </DialogDescription>
                                    </DialogHeader>
                                   <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="ad-account-id">AD Account IDs</Label>
                                        <div className="space-y-2">
                                          <div className="flex gap-2">
                                            <Input
                                              id="ad-account-id"
                                              placeholder="971311827719449"
                                              value={currentAdAccountId}
                                              onChange={(e) => setCurrentAdAccountId(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && currentAdAccountId.trim()) {
                                                  e.preventDefault();
                                                  setAdAccountIds([...adAccountIds, currentAdAccountId.trim()]);
                                                  setCurrentAdAccountId('');
                                                }
                                              }}
                                            />
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                if (currentAdAccountId.trim()) {
                                                  setAdAccountIds([...adAccountIds, currentAdAccountId.trim()]);
                                                  setCurrentAdAccountId('');
                                                }
                                              }}
                                            >
                                              Add
                                            </Button>
                                          </div>
                                          {adAccountIds.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {adAccountIds.map((id, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                                                  <span>{id.startsWith('act_') ? id : `act_${id}`}</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => setAdAccountIds(adAccountIds.filter((_, i) => i !== index))}
                                                    className="hover:text-destructive"
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          <p className="text-xs text-muted-foreground">
                                            Enter numbers only - the "act_" prefix will be added automatically. Press Enter or click Add.
                                          </p>
                                        </div>
                                      </div>
                                   </div>
                                   <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setDialogOpen(false);
                                          setSelectedUser(null);
                                          setAdAccountIds([]);
                                          setCurrentAdAccountId('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleInviteUser}
                                        disabled={adAccountIds.length === 0 || isLoading}
                                      >
                                        {isLoading ? 'Inviting...' : 'Invite User'}
                                      </Button>
                                   </DialogFooter>
                                 </DialogContent>
                               </Dialog>
                             )}
                           </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Form & Role Info */}
        {/* <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Email Invitation
              </CardTitle>
              <CardDescription>
                Send an invitation email to someone not yet registered in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Admin roles can only be assigned from the backend
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Send Invitation
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Permissions
              </CardTitle>
              <CardDescription>
                Understand what each role can do in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <h4 className="font-medium">Member</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• View and create campaigns</li>
                  <li>• Manage jobs and applications</li>
                  <li>• Access dashboard and reports</li>
                  <li>• Update their own profile</li>
                </ul>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <h4 className="font-medium">Admin/Owner</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All member permissions</li>
                  <li>• Invite and manage users</li>
                  <li>• Connect Meta accounts</li>
                  <li>• Organization settings</li>
                  <li>• Full administrative access</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
};

export default InviteUsers;