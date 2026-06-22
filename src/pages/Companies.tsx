import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Building2, ChevronDown, ChevronRight, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanyMode } from '@/hooks/useCompanyMode';

interface CompanyMemberRow {
  user_id: string;
  email: string;
  created_at: string;
}

interface CompanyRow {
  id: string;
  domain: string;
  display_name: string;
  created_at: string;
  balance: number;
  currency: string;
  members: CompanyMemberRow[];
}

const Companies = () => {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [flagBusy, setFlagBusy] = useState(false);
  const { enabled: companyMode } = useCompanyMode();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [{ data: comps }, { data: members }, { data: credits }] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('company_members').select('*'),
      supabase.from('company_credits').select('*'),
    ]);

    const membersByCompany = new Map<string, CompanyMemberRow[]>();
    (members ?? []).forEach((m: any) => {
      const list = membersByCompany.get(m.company_id) ?? [];
      list.push({ user_id: m.user_id, email: m.email, created_at: m.created_at });
      membersByCompany.set(m.company_id, list);
    });

    const creditsByCompany = new Map<string, { balance: number; currency: string }>();
    (credits ?? []).forEach((c: any) =>
      creditsByCompany.set(c.company_id, { balance: Number(c.balance ?? 0), currency: c.currency ?? 'EUR' }),
    );

    const rows: CompanyRow[] = (comps ?? []).map((c: any) => ({
      id: c.id,
      domain: c.domain,
      display_name: c.display_name,
      created_at: c.created_at,
      balance: creditsByCompany.get(c.id)?.balance ?? 0,
      currency: creditsByCompany.get(c.id)?.currency ?? 'EUR',
      members: membersByCompany.get(c.id) ?? [],
    }));
    setCompanies(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCompanyMode = async (value: boolean) => {
    setFlagBusy(true);
    const { error } = await supabase
      .from('feature_flags')
      .update({ company_mode_enabled: value })
      .eq('id', true);
    setFlagBusy(false);
    if (error) {
      toast({ title: 'Could not update flag', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: value ? 'Company mode enabled' : 'Company mode disabled' });
    // refresh page so useCompanyMode picks up new value
    window.location.reload();
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? companies.filter(
        (c) =>
          c.domain.toLowerCase().includes(q) ||
          c.display_name.toLowerCase().includes(q) ||
          c.members.some((m) => m.email.toLowerCase().includes(q)),
      )
    : companies;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6" /> Companies
          </h1>
          <p className="text-muted-foreground text-sm">
            Companies are created automatically from verified company email domains. All members of a company share credits and data.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company mode</CardTitle>
          <CardDescription>
            Master switch. While off, signups behave the way they do today. When on, new signups must use a company email (verified),
            and accounts get grouped by domain.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Switch checked={companyMode} disabled={flagBusy} onCheckedChange={toggleCompanyMode} />
          <span className="text-sm">{companyMode ? 'Enabled' : 'Disabled'}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All companies</CardTitle>
              <CardDescription>{companies.length} total</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by domain or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No companies yet.</p>
              <p className="text-xs mt-1">Companies appear as soon as a user signs up with a verified company email.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Shared balance</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const open = !!expanded[c.id];
                  return (
                    <>
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => setExpanded((s) => ({ ...s, [c.id]: !s[c.id] }))}
                      >
                        <TableCell>{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</TableCell>
                        <TableCell className="font-medium">{c.display_name}</TableCell>
                        <TableCell className="text-muted-foreground">@{c.domain}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" /> {c.members.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {c.balance.toFixed(2)} {c.currency}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                      {open && (
                        <TableRow key={`${c.id}-x`}>
                          <TableCell colSpan={6} className="bg-muted/30">
                            {c.members.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2 px-4">No members yet.</p>
                            ) : (
                              <div className="py-2 px-4 space-y-1">
                                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">
                                  Member accounts ({c.members.length})
                                </p>
                                {c.members.map((m) => (
                                  <div
                                    key={m.user_id}
                                    className="flex items-center justify-between text-sm py-1 border-b last:border-b-0"
                                  >
                                    <span>{m.email}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Joined {new Date(m.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Companies;
