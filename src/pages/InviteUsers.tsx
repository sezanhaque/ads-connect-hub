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
import { UserPlus, Search, Users, Shield, UserX, ArrowLeft } from 'lucide-react';

type Platform = 'meta' | 'tiktok' | null;

interface UserPlatforms {
  meta: boolean;
  tiktok: boolean;
}

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at: string;
  user_id: string;
  is_member: boolean;
  connected_platforms: UserPlatforms;
}

const InviteUsers = () => {
  const [adAccountIds, setAdAccountIds] = useState<string[]>([]);
  const [currentAdAccountId, setCurrentAdAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
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

      // Fetch integrations for this admin's org to check user-specific integrations
      let integrationsData: any[] = [];
      
      const { data: integrations, error: intError } = await supabase
        .from('integrations')
        .select('org_id, integration_type, user_id, status')
        .eq('org_id', profile.organization_id)
        .eq('status', 'active');
      
      if (!intError && integrations) {
        integrationsData = integrations;
      }

      console.log('Found integrations:', integrationsData.length);

      // Transform the data to include membership status and connected platforms
      const transformedUsers = profilesData.map(userProfile => {
        const membership = membersData?.find(m => m.user_id === userProfile.user_id);
        
        // Check platform connections - look for integrations with this user_id in the admin's org
        const userIntegrations = integrationsData.filter(
          i => i.user_id === userProfile.user_id
        );
        
        const connected_platforms: UserPlatforms = {
          meta: userIntegrations.some(i => i.integration_type === 'meta'),
          tiktok: userIntegrations.some(i => i.integration_type === 'tiktok'),
        };

        return {
          id: userProfile.user_id,
          user_id: userProfile.user_id,
          email: userProfile.email || 'No email',
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          role: membership ? membership.role : null,
          created_at: userProfile.created_at,
          is_member: !!membership,
          connected_platforms,
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
    if (!selectedUser || !profile?.organization_id || !selectedPlatform) {
      toast({
        title: "Error",
        description: "Invalid user, organization, or platform",
        variant: "destructive",
      });
      return;
    }

    if (adAccountIds.length === 0) {
      toast({
        title: "Error",
        description: `Please provide at least one ${selectedPlatform === 'meta' ? 'AD Account ID' : 'Advertiser ID'}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(`Starting user invitation process for ${selectedPlatform}...`);

      if (selectedPlatform === 'meta') {
        // Automatically add "act_" prefix to all IDs for Meta
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
            append: true,
          },
        });

        if (error || !data?.success) {
          throw new Error(error?.message || data?.error || 'Failed to set up Meta integration for user');
        }

        toast({
          title: 'Meta Ad Accounts added successfully!',
          description: `${selectedUser.email} now has access to ${finalAdAccountIds.length} new ad account(s). Data has been synced.`,
        });
      } else {
        // TikTok integration
        const finalAdvertiserIds = adAccountIds.map(id => id.trim());

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

        // 2) Set up TikTok integration via Edge Function
        const { data, error } = await supabase.functions.invoke('member-tiktok-setup', {
          body: {
            target_user_id: selectedUser.user_id,
            advertiser_ids: finalAdvertiserIds,
            admin_org_id: profile.organization_id,
            append: true,
          },
        });

        if (error || !data?.success) {
          throw new Error(error?.message || data?.error || 'Failed to set up TikTok integration for user');
        }

        toast({
          title: 'TikTok Advertiser IDs added successfully!',
          description: `${selectedUser.email} now has access to ${finalAdvertiserIds.length} new advertiser(s). Data has been synced.`,
        });
      }

      // Reset form and close dialog
      resetDialog();

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
          description: error.message || 'Failed to add accounts. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setSelectedPlatform(null);
    setAdAccountIds([]);
    setCurrentAdAccountId('');
  };

  const handleOpenDialog = async (user: User) => {
    setSelectedUser(user);
    setSelectedPlatform(null);
    setAdAccountIds([]);
    setCurrentAdAccountId('');
    setDialogOpen(true);
  };

  const handleSelectPlatform = async (platform: Platform) => {
    if (!selectedUser || !platform) return;
    
    setSelectedPlatform(platform);
    setAdAccountIds([]);
    
    // For existing members, fetch their current account IDs for the selected platform
    if (selectedUser.is_member) {
      try {
        const { data: ownerMembership } = await supabase
          .from('members')
          .select('org_id')
          .eq('user_id', selectedUser.user_id)
          .eq('role', 'owner')
          .maybeSingle();

        if (ownerMembership?.org_id) {
          const { data: integration } = await supabase
            .from('integrations')
            .select('ad_account_id')
            .eq('org_id', ownerMembership.org_id)
            .eq('integration_type', platform)
            .eq('user_id', selectedUser.user_id)
            .maybeSingle();

          if (integration?.ad_account_id) {
            // Pre-populate with existing IDs (without act_ prefix for Meta display)
            const existingIds = (integration.ad_account_id as string[])
              .map(id => platform === 'meta' ? id.replace(/^act_/, '') : id);
            setAdAccountIds(existingIds);
          }
        }
      } catch (error) {
        console.error('Error fetching existing accounts:', error);
      }
    }
  };

  const renderPlatformSelection = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select which platform integration you want to set up for this user.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
          onClick={() => handleSelectPlatform('meta')}
        >
          <img src="/meta-logo.png" alt="Meta" className="h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="font-medium">Meta</span>
          <span className="text-xs text-muted-foreground">Facebook & Instagram</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
          onClick={() => handleSelectPlatform('tiktok')}
        >
          <img src="/tiktok-logo.png" alt="TikTok" className="h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="font-medium">TikTok</span>
          <span className="text-xs text-muted-foreground">TikTok Ads</span>
        </Button>
      </div>
    </div>
  );

  const renderAccountInput = () => {
    const isMeta = selectedPlatform === 'meta';
    const labelText = isMeta ? 'AD Account IDs' : 'Advertiser IDs';
    const placeholder = isMeta ? '971311827719449' : '7123456789012345678';
    const helpText = isMeta 
      ? 'Enter numbers only - the "act_" prefix will be added automatically. Press Enter or click Add.'
      : 'Enter your TikTok Advertiser IDs. Press Enter or click Add.';

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 -ml-2"
          onClick={() => setSelectedPlatform(null)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to platform selection
        </Button>
        
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <img 
            src={isMeta ? "/meta-logo.png" : "/tiktok-logo.png"} 
            alt={isMeta ? "Meta" : "TikTok"} 
            className="h-6 w-6 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="font-medium">{isMeta ? 'Meta' : 'TikTok'} Integration</span>
        </div>

        <div>
          <Label htmlFor="ad-account-id">{labelText}</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="ad-account-id"
                placeholder={placeholder}
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
                    <span>{isMeta ? (id.startsWith('act_') ? id : `act_${id}`) : id}</span>
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
            <p className="text-xs text-muted-foreground">{helpText}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderConnectedPlatforms = (platforms: UserPlatforms) => {
    if (!platforms.meta && !platforms.tiktok) {
      return <span className="text-muted-foreground text-sm">None</span>;
    }
    
    return (
      <div className="flex gap-1">
        {platforms.meta && (
          <Badge variant="outline" className="text-xs">
            Meta
          </Badge>
        )}
        {platforms.tiktok && (
          <Badge variant="outline" className="text-xs">
            TikTok
          </Badge>
        )}
      </div>
    );
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
                      <TableHead>Connected Platforms</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                            {renderConnectedPlatforms(user.connected_platforms)}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                              if (!open) {
                                resetDialog();
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant={user.is_member ? "secondary" : "outline"}
                                  onClick={() => handleOpenDialog(user)}
                                  className="flex items-center gap-1"
                                >
                                  <UserPlus className="h-3 w-3" />
                                  {user.is_member ? 'Manage Integrations' : 'Invite User'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {!selectedPlatform 
                                      ? 'Select Platform'
                                      : user.is_member 
                                        ? `Manage ${selectedPlatform === 'meta' ? 'Meta' : 'TikTok'} Accounts` 
                                        : `Set Up ${selectedPlatform === 'meta' ? 'Meta' : 'TikTok'} Integration`
                                    }
                                  </DialogTitle>
                                  <DialogDescription>
                                    {!selectedPlatform 
                                      ? `Choose which platform to configure for ${user.email}.`
                                      : user.is_member 
                                        ? `Add or update ${selectedPlatform === 'meta' ? 'Meta Ad Account' : 'TikTok Advertiser'} access for ${user.email}.`
                                        : `Invite ${user.email} to join your organization with ${selectedPlatform === 'meta' ? 'Meta' : 'TikTok'} integration access.`
                                    }
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {!selectedPlatform ? renderPlatformSelection() : renderAccountInput()}
                                
                                {selectedPlatform && (
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={resetDialog}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleInviteUser}
                                      disabled={adAccountIds.length === 0 || isLoading}
                                    >
                                      {isLoading ? 'Processing...' : (selectedUser?.is_member ? 'Update Accounts' : 'Invite User')}
                                    </Button>
                                  </DialogFooter>
                                )}
                              </DialogContent>
                            </Dialog>
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
      </div>
    </div>
  );
};

export default InviteUsers;
