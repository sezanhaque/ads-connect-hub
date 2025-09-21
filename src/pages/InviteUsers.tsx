import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Mail, Search, Users, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  organization_id: string | null;
}

const InviteUsers = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
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

  const handleInviteExistingUser = async (userId: string, userEmail: string) => {
    if (!profile?.organization_id) return;

    try {
      // Check if user is already in the organization
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', userId)
        .eq('org_id', profile.organization_id)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "User already invited",
          description: "This user is already a member of your organization",
          variant: "destructive",
        });
        return;
      }

      // Add user to organization
      const { error } = await supabase
        .from('members')
        .insert({
          user_id: userId,
          org_id: profile.organization_id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "User invited successfully!",
        description: `${userEmail} has been added to your organization`,
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
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

    setIsLoading(true);
    
    try {
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
          inviterName: `${profile.first_name} ${profile.last_name}`,
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
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
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
              View all users in the system and invite them to your organization.
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
              <div className="text-center py-4">Loading users...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : 'No name'
                            }
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInviteExistingUser(user.id, user.email)}
                              disabled={user.organization_id === profile?.organization_id}
                            >
                              {user.organization_id === profile?.organization_id ? 'In Org' : 'Invite'}
                            </Button>
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

        {/* Invite Form */}
        <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
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
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Understand what each role can do in your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Member</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View and create campaigns</li>
                <li>• Manage jobs</li>
                <li>• Access dashboard and reports</li>
                <li>• Update their own profile</li>
              </ul>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Admin</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All member permissions</li>
                <li>• Invite and manage users</li>
                <li>• Connect Meta accounts</li>
                <li>• Organization settings</li>
                <li>• Full administrative access</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Admin roles can only be assigned from the backend
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default InviteUsers;