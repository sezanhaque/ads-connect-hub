import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Mail } from 'lucide-react';

const InviteUsers = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

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
      const { error } = await supabase
        .from('invites')
        .insert({
          email,
          role,
          org_id: profile.organization_id,
          token,
        });

      if (error) throw error;

      toast({
        title: "Invitation sent!",
        description: `An invitation has been sent to ${email}`,
      });
      
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
        <h1 className="text-3xl font-bold">Invite Users</h1>
        <p className="text-muted-foreground">
          Invite new team members to join your organization.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Send Invitation
            </CardTitle>
            <CardDescription>
              Enter the email address of the person you'd like to invite.
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
                    <SelectItem value="admin">Admin</SelectItem>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteUsers;