import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, ChevronDown, ChevronRight, Plus, Search, Settings2, Shield, Trash2, UserPlus, Users, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanyMode } from '@/hooks/useCompanyMode';
import { MetaLogo, TikTokLogo } from '@/components/icons';

type CompanyMemberRole = 'owner' | 'admin' | 'member';

interface CompanyMemberRow {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  role: CompanyMemberRole;
}


interface CompanyIntegrationRow {
  integration_type: 'meta' | 'tiktok';
  ad_account_ids: string[];
  access_token: string | null;
  account_name: string | null;
  last_sync_at: string | null;
}

interface CompanyRow {
  id: string;
  domain: string;
  display_name: string;
  created_at: string;
  balance: number;
  currency: string;
  members: CompanyMemberRow[];
  integrations: CompanyIntegrationRow[];
}

interface ProfileRow {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

const Companies = () => {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [flagBusy, setFlagBusy] = useState(false);
  const [manageCompany, setManageCompany] = useState<CompanyRow | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newDomainTouched, setNewDomainTouched] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInitialMembers, setNewInitialMembers] = useState<string[]>([]);
  const [newBusy, setNewBusy] = useState(false);
  const { enabled: companyMode } = useCompanyMode();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [{ data: comps }, { data: members }, { data: credits }, { data: integrations }, { data: profs }] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('company_members').select('*'),
      supabase.from('company_credits').select('*'),
      supabase.from('company_integrations').select('*'),
      supabase.from('profiles').select('user_id, email, first_name, last_name'),
    ]);
    setProfiles((profs ?? []) as ProfileRow[]);

    const membersByCompany = new Map<string, CompanyMemberRow[]>();
    (members ?? []).forEach((m: any) => {
      const list = membersByCompany.get(m.company_id) ?? [];
      list.push({
        id: m.id,
        user_id: m.user_id,
        email: m.email,
        created_at: m.created_at,
        role: (m.role as CompanyMemberRole) ?? 'member',
      });
      membersByCompany.set(m.company_id, list);
    });


    const creditsByCompany = new Map<string, { balance: number; currency: string }>();
    (credits ?? []).forEach((c: any) =>
      creditsByCompany.set(c.company_id, { balance: Number(c.balance ?? 0), currency: c.currency ?? 'EUR' }),
    );

    const integrationsByCompany = new Map<string, CompanyIntegrationRow[]>();
    (integrations ?? []).forEach((i: any) => {
      const list = integrationsByCompany.get(i.company_id) ?? [];
      list.push({
        integration_type: i.integration_type,
        ad_account_ids: i.ad_account_ids ?? [],
        access_token: i.access_token ?? null,
        account_name: i.account_name ?? null,
        last_sync_at: i.last_sync_at ?? null,
      });
      integrationsByCompany.set(i.company_id, list);
    });

    const rows: CompanyRow[] = (comps ?? []).map((c: any) => ({
      id: c.id,
      domain: c.domain,
      display_name: c.display_name,
      created_at: c.created_at,
      balance: creditsByCompany.get(c.id)?.balance ?? 0,
      currency: creditsByCompany.get(c.id)?.currency ?? 'EUR',
      members: membersByCompany.get(c.id) ?? [],
      integrations: integrationsByCompany.get(c.id) ?? [],
    }));
    setCompanies(rows);
    setLoading(false);

    // Keep the open dialog in sync with freshly fetched data
    setManageCompany((current) => (current ? rows.find((r) => r.id === current.id) ?? null : null));
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
    window.location.reload();
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? companies.filter(
        (c) =>
          (c.domain ?? '').toLowerCase().includes(q) ||
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
            Admins create companies and assign users to them. Signing up no longer creates a company automatically.
          </p>
        </div>
        <Button onClick={() => { setNewDomain(''); setNewDomainTouched(false); setNewName(''); setNewInitialMembers([]); setNewOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New company
        </Button>
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
              <p className="text-xs mt-1">Click "New company" to create the first one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead>Shared balance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const open = !!expanded[c.id];
                  const meta = c.integrations.find((i) => i.integration_type === 'meta');
                  const tiktok = c.integrations.find((i) => i.integration_type === 'tiktok');
                  return (
                    <>
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => setExpanded((s) => ({ ...s, [c.id]: !s[c.id] }))}
                      >
                        <TableCell>{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</TableCell>
                        <TableCell className="font-medium">{c.display_name}</TableCell>
                        <TableCell className="text-muted-foreground">{c.domain ? `@${c.domain}` : <span className="italic">no domain</span>}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" /> {c.members.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {meta && meta.ad_account_ids.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <MetaLogo size={12} /> {meta.ad_account_ids.length}
                              </Badge>
                            )}
                            {tiktok && tiktok.ad_account_ids.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <TikTokLogo size={12} /> {tiktok.ad_account_ids.length}
                              </Badge>
                            )}
                            {!meta?.ad_account_ids.length && !tiktok?.ad_account_ids.length && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.balance.toFixed(2)} {c.currency}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setManageCompany(c);
                            }}
                          >
                            <Settings2 className="h-4 w-4 mr-1" /> Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                      {open && (
                        <TableRow key={`${c.id}-x`}>
                          <TableCell colSpan={8} className="bg-muted/30">
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
                                    <span className="flex items-center gap-2">
                                      {m.email}
                                      <Badge
                                        variant={m.role === 'owner' ? 'default' : m.role === 'admin' ? 'secondary' : 'outline'}
                                        className="text-[10px] uppercase"
                                      >
                                        {m.role}
                                      </Badge>
                                    </span>
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

      <ManageCompanyDialog
        company={manageCompany}
        profiles={profiles}
        companies={companies}
        onClose={() => setManageCompany(null)}
        onChanged={fetchData}
      />

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a new company</DialogTitle>
            <DialogDescription>
              Give it a name, then optionally tie it to a domain and invite the first members. You can change everything later.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const initials = (newName || 'New')
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase())
              .join('') || 'N';
            const domainTaken = !!newDomain && companies.some((c) => (c.domain ?? '').toLowerCase() === newDomain);
            const nameTaken = !!newName.trim() && companies.some((c) => c.display_name.toLowerCase() === newName.trim().toLowerCase());
            const companyByUser = new Map<string, string>();
            companies.forEach((c) => c.members.forEach((m) => companyByUser.set(m.user_id, c.display_name)));
            const availableProfiles = [...profiles].sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''));
            const toggleMember = (id: string) =>
              setNewInitialMembers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

            const handleNameChange = (v: string) => {
              setNewName(v);
              if (!newDomainTouched) {
                const guess = v
                  .toLowerCase()
                  .replace(/&/g, 'and')
                  .replace(/[^a-z0-9]+/g, '')
                  .slice(0, 30);
                setNewDomain(guess ? `${guess}.com` : '');
              }
            };

            return (
              <div className="space-y-5">
                {/* Live preview */}
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold text-lg">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{newName || 'Untitled company'}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {newDomain ? `@${newDomain}` : 'No domain set'} ·{' '}
                      {newInitialMembers.length} member{newInitialMembers.length === 1 ? '' : 's'} to add
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-company-name">Company name</Label>
                  <Input
                    id="new-company-name"
                    placeholder="e.g. Acme Inc."
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    autoFocus
                  />
                  {nameTaken && (
                    <p className="text-xs text-amber-600">A company with this name already exists.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-company-domain">
                      Email domain <span className="text-muted-foreground font-normal">· optional</span>
                    </Label>
                    {newDomain && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewDomain('');
                          setNewDomainTouched(true);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <Input
                    id="new-company-domain"
                    placeholder="acme.com"
                    value={newDomain}
                    onChange={(e) => {
                      setNewDomainTouched(true);
                      setNewDomain(e.target.value.toLowerCase().trim());
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Members can have any email address. Use this only when the company really maps to a single domain.
                  </p>
                  {domainTaken && (
                    <p className="text-xs text-destructive">This domain is already linked to another company.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Add members now <span className="text-muted-foreground font-normal">· optional</span>
                  </Label>
                  {availableProfiles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No registered users found.</p>
                  ) : (
                    <>
                      <div className="max-h-44 overflow-y-auto rounded-md border divide-y">
                        {availableProfiles.slice(0, 100).map((p) => {
                          const selected = newInitialMembers.includes(p.user_id);
                          const currentCompany = companyByUser.get(p.user_id);
                          return (
                            <button
                              type="button"
                              key={p.user_id}
                              onClick={() => toggleMember(p.user_id)}
                              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                selected ? 'bg-primary/10' : 'hover:bg-muted/60'
                              }`}
                            >
                              <span className="truncate">{p.email ?? p.user_id}</span>
                              <span className="flex items-center gap-2 shrink-0">
                                {currentCompany && (
                                  <Badge variant="outline" className="text-[10px] font-normal">
                                    in {currentCompany}
                                  </Badge>
                                )}
                                {selected && <Badge variant="secondary" className="text-[10px]">Added</Badge>}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {newInitialMembers.length} selected. Users already in another company will also become members here.
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button
              disabled={newBusy || !newName.trim()}
              onClick={async () => {
                setNewBusy(true);
                const { data: created, error } = await supabase
                  .from('companies')
                  .insert({ domain: newDomain || null, display_name: newName.trim() })
                  .select('id')
                  .single();
                if (error || !created) {
                  setNewBusy(false);
                  toast({ title: 'Could not create', description: error?.message || 'Unknown error', variant: 'destructive' });
                  return;
                }
                await supabase.from('company_credits').insert({ company_id: created.id });

                if (newInitialMembers.length > 0) {
                  const rows = newInitialMembers
                    .map((uid) => {
                      const p = profiles.find((x) => x.user_id === uid);
                      if (!p) return null;
                      return { company_id: created.id, user_id: uid, email: p.email, role: 'member' as const };
                    })
                    .filter(Boolean) as any[];
                  if (rows.length > 0) {
                    const { error: mErr } = await (supabase.from('company_members') as any).insert(rows);
                    if (mErr) {
                      toast({ title: 'Company created, but some members failed', description: mErr.message, variant: 'destructive' });
                    }
                  }
                }

                setNewBusy(false);
                toast({
                  title: 'Company created',
                  description: newInitialMembers.length
                    ? `${newName.trim()} is ready with ${newInitialMembers.length} member(s).`
                    : `${newName.trim()} is ready. Assign members from the Manage dialog.`,
                });
                setNewOpen(false);
                fetchData();
              }}
            >
              {newBusy ? 'Creating…' : 'Create company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ManageProps {
  company: CompanyRow | null;
  profiles: ProfileRow[];
  companies: CompanyRow[];
  onClose: () => void;
  onChanged: () => void;
}

const ManageCompanyDialog = ({ company, profiles, companies, onClose, onChanged }: ManageProps) => {
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [assignBusy, setAssignBusy] = useState(false);
  const { toast } = useToast();
  const [topupAmount, setTopupAmount] = useState('');
  const [topupBusy, setTopupBusy] = useState(false);
  const [metaIds, setMetaIds] = useState<string[]>([]);
  const [metaInput, setMetaInput] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaBusy, setMetaBusy] = useState(false);
  const [metaSyncBusy, setMetaSyncBusy] = useState(false);
  const [tiktokIds, setTiktokIds] = useState<string[]>([]);
  const [tiktokInput, setTiktokInput] = useState('');
  const [tiktokToken, setTiktokToken] = useState('');
  const [tiktokBusy, setTiktokBusy] = useState(false);
  const [tiktokSyncBusy, setTiktokSyncBusy] = useState(false);
  const [roleBusyFor, setRoleBusyFor] = useState<string | null>(null);


  useEffect(() => {
    if (!company) return;
    const meta = company.integrations.find((i) => i.integration_type === 'meta');
    const tiktok = company.integrations.find((i) => i.integration_type === 'tiktok');
    setMetaIds((meta?.ad_account_ids ?? []).map((id) => id.replace(/^act_/, '')));
    setTiktokIds(tiktok?.ad_account_ids ?? []);
    setMetaToken(meta?.access_token ?? '');
    setTiktokToken(tiktok?.access_token ?? '');
    setTopupAmount('');
    setMetaInput('');
    setTiktokInput('');
  }, [company?.id]);

  if (!company) return null;

  const handleTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive number.', variant: 'destructive' });
      return;
    }
    setTopupBusy(true);
    const { data, error } = await supabase.functions.invoke('admin-set-company-balance', {
      body: { company_id: company.id, mode: 'add', amount: amt, currency: company.currency || 'EUR' },
    });
    setTopupBusy(false);
    if (error || !data?.success) {
      toast({ title: 'Error', description: error?.message || data?.error || 'Failed to update balance', variant: 'destructive' });
      return;
    }
    toast({ title: 'Balance updated', description: `New shared balance: ${Number(data.balance).toFixed(2)} ${data.currency}` });
    setTopupAmount('');
    onChanged();
  };

  const savePlatform = async (platform: 'meta' | 'tiktok', ids: string[], accessToken: string) => {
    const setBusy = platform === 'meta' ? setMetaBusy : setTiktokBusy;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('company-platform-setup', {
      body: { company_id: company.id, platform, ad_account_ids: ids, access_token: accessToken },
    });
    setBusy(false);
    if (error || !data?.success) {
      toast({ title: 'Error', description: error?.message || data?.error || 'Failed to save', variant: 'destructive' });
      return;
    }
    toast({ title: `${platform === 'meta' ? 'Meta' : 'TikTok'} saved`, description: `${data.count} account(s) shared${data.has_token ? ' with token' : ''}.` });
    onChanged();
  };

  const syncPlatform = async (platform: 'meta' | 'tiktok') => {
    const setBusy = platform === 'meta' ? setMetaSyncBusy : setTiktokSyncBusy;
    setBusy(true);
    const fn = platform === 'meta' ? 'company-meta-sync' : 'company-tiktok-sync';
    const { data, error } = await supabase.functions.invoke(fn, {
      body: { company_id: company.id },
    });
    setBusy(false);
    if (error || !data?.success) {
      toast({ title: 'Sync failed', description: error?.message || data?.error || 'Sync error', variant: 'destructive' });
      return;
    }
    toast({ title: 'Sync complete', description: `${data.synced_count}/${data.total_campaigns} campaigns synced.` });
    onChanged();
  };

  const updateMemberRole = async (memberId: string, role: CompanyMemberRole) => {
    setRoleBusyFor(memberId);
    const { error } = await (supabase.from('company_members') as any)
      .update({ role })
      .eq('id', memberId);
    setRoleBusyFor(null);
    if (error) {
      toast({ title: 'Could not update role', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Role updated', description: `Set to ${role}.` });
    onChanged();
  };



  const renderIdList = (
    ids: string[],
    setIds: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void,
    placeholder: string,
  ) => (
    <>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              e.preventDefault();
              setIds([...ids, input.trim()]);
              setInput('');
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!input.trim()) return;
            setIds([...ids, input.trim()]);
            setInput('');
          }}
        >
          Add
        </Button>
      </div>
      {ids.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {ids.map((id, idx) => (
            <Badge key={`${id}-${idx}`} variant="secondary" className="gap-1">
              {id}
              <button
                type="button"
                onClick={() => setIds(ids.filter((_, i) => i !== idx))}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </>
  );

  return (
    <Dialog open={!!company} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company.display_name}</DialogTitle>
          <DialogDescription>
            {company.domain ? `@${company.domain} · ` : ''}{company.members.length} member(s) · Shared balance {company.balance.toFixed(2)} {company.currency}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="balance">Top up</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4 pt-4">
            <div>
              <Label>Assign user to this company</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Any registered user can be added, regardless of their email domain or current company.
              </p>
              {(() => {
                const inThisCompany = new Set(company.members.map((m) => m.user_id));
                const companyByUser = new Map<string, string>();
                companies.forEach((c) =>
                  c.members.forEach((m) => {
                    if (c.id !== company.id) companyByUser.set(m.user_id, c.display_name);
                  }),
                );
                const available = profiles
                  .filter((p) => !inThisCompany.has(p.user_id))
                  .sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''));
                return (
                  <div className="flex gap-2">
                    <Select value={assignUserId} onValueChange={setAssignUserId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={available.length ? 'Select a user…' : 'All users already added'} />
                      </SelectTrigger>
                      <SelectContent>
                        {available.map((p) => {
                          const other = companyByUser.get(p.user_id);
                          return (
                            <SelectItem key={p.user_id} value={p.user_id}>
                              {p.email ?? p.user_id}{other ? ` — in ${other}` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      disabled={!assignUserId || assignBusy}
                      onClick={async () => {
                        const profile = profiles.find((p) => p.user_id === assignUserId);
                        if (!profile) return;
                        setAssignBusy(true);
                        const { error } = await (supabase.from('company_members') as any).insert({
                          company_id: company.id,
                          user_id: assignUserId,
                          email: profile.email,
                          role: 'member',
                        });
                        setAssignBusy(false);
                        if (error) {
                          toast({ title: 'Could not assign', description: error.message, variant: 'destructive' });
                          return;
                        }
                        toast({ title: 'Member added' });
                        setAssignUserId('');
                        onChanged();
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                );
              })()}
            </div>

            <div className="border rounded-md divide-y">
              {company.members.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No members yet.</p>
              ) : (
                company.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">{m.email}</span>
                      <Badge
                        variant={m.role === 'owner' ? 'default' : m.role === 'admin' ? 'secondary' : 'outline'}
                        className="text-[10px] uppercase"
                      >
                        {m.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={m.role}
                        onValueChange={(v) => updateMemberRole(m.id, v as CompanyMemberRole)}
                        disabled={roleBusyFor === m.id}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">owner</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="member">member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!confirm(`Remove ${m.email} from ${company.display_name}?`)) return;
                          const { error } = await supabase
                            .from('company_members')
                            .delete()
                            .eq('id', m.id);
                          if (error) {
                            toast({ title: 'Could not remove', description: error.message, variant: 'destructive' });
                            return;
                          }
                          toast({ title: 'Member removed' });
                          onChanged();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>






          <TabsContent value="balance" className="space-y-4 pt-4">
            <div>
              <Label>Add to shared balance ({company.currency})</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                />
                <Button onClick={handleTopup} disabled={topupBusy}>
                  {topupBusy ? 'Adding…' : 'Add'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Current shared balance: {company.balance.toFixed(2)} {company.currency}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-3 pt-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <MetaLogo size={20} />
              <span className="font-medium">Shared Meta ad accounts</span>
            </div>
            <Label>AD Account IDs</Label>
            <p className="text-xs text-muted-foreground">
              Numbers only; the "act_" prefix is added automatically. Press Enter or click Add.
            </p>
            {renderIdList(metaIds, setMetaIds, metaInput, setMetaInput, '971311827719449')}
            <div className="pt-2">
              <Label>Shared Meta access token</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Long-lived token (starts with <code>EAA</code>). Used to pull data for all company members.
              </p>
              <Input
                type="password"
                placeholder="EAA…"
                value={metaToken}
                onChange={(e) => setMetaToken(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => syncPlatform('meta')} disabled={metaSyncBusy}>
                {metaSyncBusy ? 'Syncing…' : 'Sync now'}
              </Button>
              <Button onClick={() => savePlatform('meta', metaIds, metaToken)} disabled={metaBusy}>
                {metaBusy ? 'Saving…' : 'Save Meta'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-3 pt-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <TikTokLogo size={20} />
              <span className="font-medium">Shared TikTok advertiser IDs</span>
            </div>
            <Label>Advertiser IDs</Label>
            <p className="text-xs text-muted-foreground">Press Enter or click Add.</p>
            {renderIdList(tiktokIds, setTiktokIds, tiktokInput, setTiktokInput, '7123456789012345678')}
            <div className="pt-2">
              <Label>Shared TikTok access token</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Long-lived TikTok Business API access token. Used for all company members.
              </p>
              <Input
                type="password"
                placeholder="Access token"
                value={tiktokToken}
                onChange={(e) => setTiktokToken(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => syncPlatform('tiktok')} disabled={tiktokSyncBusy}>
                {tiktokSyncBusy ? 'Syncing…' : 'Sync now'}
              </Button>
              <Button onClick={() => savePlatform('tiktok', tiktokIds, tiktokToken)} disabled={tiktokBusy}>
                {tiktokBusy ? 'Saving…' : 'Save TikTok'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Companies;
