import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SupportTicketButton } from '@/components/SupportTicketDialog';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarClock,
  LifeBuoy,
  Plug,
} from 'lucide-react';
import { MetaLogo } from '@/components/icons/MetaLogo';
import { TikTokLogo } from '@/components/icons/TikTokLogo';

type Incident = {
  id: string;
  title: string;
  affected_service: string;
  status: 'investigating' | 'monitoring' | 'resolved';
  description: string | null;
  started_at: string;
  resolved_at: string | null;
};

type Connection = {
  id: string;
  service_key: string;
  service_name: string;
  category: 'core' | 'ats';
  status: 'connected' | 'degraded' | 'disconnected';
  last_sync_at: string | null;
  response_time_ms: number | null;
};

type UserConnection = {
  id: string;
  service_key: string;
  service_name: string;
  account_name: string | null;
  userStatus: 'connected' | 'token_expired' | 'disconnected';
  last_sync_at: string | null;
  global?: Connection;
};

type Maintenance = {
  id: string;
  title: string;
  affected_services: string[];
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
};

const incidentVariant = (status: Incident['status']) => {
  switch (status) {
    case 'investigating':
      return 'destructive' as const;
    case 'monitoring':
      return 'secondary' as const;
    case 'resolved':
      return 'outline' as const;
  }
};

const userStatusStyle = (status: UserConnection['userStatus']) => {
  switch (status) {
    case 'connected':
      return { label: 'Connected', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' };
    case 'token_expired':
      return { label: 'Token expired', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' };
    case 'disconnected':
      return { label: 'Disconnected', cls: 'bg-red-500/10 text-red-600 border-red-500/20', dot: 'bg-red-500' };
  }
};

const globalOverrideLabel = (g?: Connection) => {
  if (!g) return null;
  if (g.status === 'degraded') return `${g.service_name} is currently degraded platform-wide`;
  if (g.status === 'disconnected') return `${g.service_name} is currently down platform-wide`;
  return null;
};

const integrationTypeToService = (type: string): { key: string; name: string } => {
  const t = (type || '').toLowerCase();
  if (t === 'meta' || t === 'meta_ads') return { key: 'meta_ads', name: 'Meta Ads API' };
  if (t === 'tiktok' || t === 'tiktok_ads') return { key: 'tiktok_ads', name: 'TikTok Ads API' };
  if (t.startsWith('ats_') || t.startsWith('ats-')) {
    const slug = t.replace(/^ats[_-]/, '').replace('-', '_');
    return { key: `ats_${slug}`, name: `ATS — ${slug.charAt(0).toUpperCase() + slug.slice(1)}` };
  }
  return { key: t, name: type };
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const durationBetween = (startIso: string, endIso: string) => {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return formatDuration(Math.max(1, Math.round(ms / 60000)));
};

const serviceIcon = (key: string) => {
  if (key === 'meta_ads') return <MetaLogo className="h-5 w-5" />;
  if (key === 'tiktok_ads') return <TikTokLogo className="h-5 w-5" />;
  return <Plug className="h-5 w-5 text-primary" />;
};

const StatusPage = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userConnections, setUserConnections] = useState<UserConnection[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();

      const [incRes, connRes, maintRes] = await Promise.all([
        supabase
          .from('status_incidents')
          .select('*')
          .gte('started_at', since)
          .order('started_at', { ascending: false }),
        supabase.from('status_connections').select('*'),
        supabase
          .from('status_maintenance')
          .select('*')
          .gte('scheduled_at', nowIso)
          .order('scheduled_at', { ascending: true }),
      ]);

      const globalConnections = (connRes.data ?? []) as Connection[];
      const globalByKey = new Map(globalConnections.map((g) => [g.service_key, g]));

      setIncidents((incRes.data ?? []) as Incident[]);
      setMaintenance((maintRes.data ?? []) as Maintenance[]);

      // Build the per-user connection list from this client's integrations
      const built: UserConnection[] = [];
      if (profile?.user_id) {
        const { data: memberships } = await supabase
          .from('members')
          .select('org_id')
          .eq('user_id', profile.user_id);
        const orgIds = (memberships ?? []).map((m: any) => m.org_id).filter(Boolean);

        if (orgIds.length) {
          const { data: integrations } = await supabase
            .from('integrations')
            .select('id, integration_type, status, expires_at, last_sync_at, account_name')
            .in('org_id', orgIds);

          const now = Date.now();
          // De-duplicate by service_key (one row per service even if multiple orgs/accounts)
          const bySvc = new Map<string, UserConnection>();
          for (const i of integrations ?? []) {
            const { key, name } = integrationTypeToService((i as any).integration_type);
            const expired = (i as any).expires_at && new Date((i as any).expires_at).getTime() < now;
            const active = (i as any).status === 'active';
            const userStatus: UserConnection['userStatus'] = expired
              ? 'token_expired'
              : active
                ? 'connected'
                : 'disconnected';

            const existing = bySvc.get(key);
            // Prefer the "best" status (connected > token_expired > disconnected)
            const rank = { connected: 2, token_expired: 1, disconnected: 0 } as const;
            if (!existing || rank[userStatus] > rank[existing.userStatus]) {
              const g = globalByKey.get(key);
              bySvc.set(key, {
                id: (i as any).id,
                service_key: key,
                service_name: g?.service_name ?? name,
                account_name: (i as any).account_name ?? null,
                userStatus,
                last_sync_at: (i as any).last_sync_at ?? null,
                global: g,
              });
            }
          }
          built.push(...bySvc.values());
          built.sort((a, b) => a.service_name.localeCompare(b.service_name));
        }
      }

      setUserConnections(built);
      setLoading(false);
    };
    load();
  }, [profile?.user_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Status</h1>
            <p className="text-muted-foreground text-lg">
              Live status of platform services, incidents, and scheduled maintenance
            </p>
          </div>
        </div>

        {/* 1. Active incidents */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              Active incidents
            </CardTitle>
            <CardDescription>Incidents reported in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : incidents.length === 0 ? (
              <div className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">All systems operational</span>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.map((i) => (
                  <div key={i.id} className="rounded-lg border bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="font-semibold">{i.title}</div>
                        <div className="text-sm text-muted-foreground">{i.affected_service}</div>
                      </div>
                      <Badge variant={incidentVariant(i.status)} className="capitalize">
                        {i.status}
                      </Badge>
                    </div>
                    {i.description && (
                      <p className="text-sm text-muted-foreground mt-3">{i.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Started: {formatDateTime(i.started_at)}</span>
                      {i.status === 'resolved' && i.resolved_at && (
                        <span>Duration: {durationBetween(i.started_at, i.resolved_at)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. API connections */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plug className="h-5 w-5 text-primary" />
              </div>
              API connections
            </CardTitle>
            <CardDescription>Status of your account's connected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : userConnections.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                You don't have any platform integrations connected yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userConnections.map((c) => {
                  const s = userStatusStyle(c.userStatus);
                  const override = globalOverrideLabel(c.global);
                  return (
                    <div key={c.id} className="rounded-lg border bg-background/60 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {serviceIcon(c.service_key)}
                          <span className="font-semibold truncate">{c.service_name}</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {c.account_name && <div className="truncate">Account: {c.account_name}</div>}
                        <div>
                          Last sync:{' '}
                          {c.last_sync_at ? formatDateTime(c.last_sync_at) : '—'}
                        </div>
                      </div>
                      {override && (
                        <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-700">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{override}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 italic">
              Incidents and maintenance windows above apply platform-wide.
            </p>
          </CardContent>
        </Card>

        {/* 3. Scheduled maintenance */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              Scheduled maintenance
            </CardTitle>
            <CardDescription>Upcoming planned maintenance windows</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : maintenance.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                No maintenance planned.
              </div>
            ) : (
              <div className="space-y-3">
                {maintenance.map((m) => (
                  <div key={m.id} className="rounded-lg border bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="font-semibold">{m.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {m.affected_services?.join(', ') || '—'}
                        </div>
                      </div>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        {formatDateTime(m.scheduled_at)} ({m.timezone})
                      </span>
                      <span>Expected duration: {formatDuration(m.duration_minutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 italic">
              Clients are notified by email at least 48 hours in advance.
            </p>
          </CardContent>
        </Card>

        {/* 4. Support */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <LifeBuoy className="h-5 w-5 text-primary" />
              </div>
              Support
            </CardTitle>
            <CardDescription>
              Need help or want to report an issue? Our team is here for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupportTicketButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatusPage;
