import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Copy, CheckCircle, AlertCircle, User, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';

interface AuthEvent {
  event: string;
  timestamp: string;
  userId?: string;
}

export default function AuthDiagnostics() {
  const { user, session, profile, roles, loading } = useAuth();
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Listen to auth state changes and log them
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthEvents(prev => [
        {
          event,
          timestamp: new Date().toISOString(),
          userId: session?.user?.id
        },
        ...prev.slice(0, 9) // Keep last 10 events
      ]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const copyDiagnostics = () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      loading,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      } : null,
      session: session ? {
        expires_at: session.expires_at,
        token_type: session.token_type,
        access_token: session.access_token ? `${session.access_token.slice(0, 20)}...` : null
      } : null,
      profile,
      roles,
      recentEvents: authEvents
    };
    
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    setCopied(true);
    toast.success('Diagnostics copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      toast.error(`Refresh failed: ${error.message}`);
    } else {
      toast.success('Session refreshed');
    }
  };

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <Badge variant={ok ? 'default' : 'destructive'} className="gap-1">
      {ok ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {label}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display mb-2">Auth Diagnostics</h1>
              <p className="text-muted-foreground">Debug authentication state and events</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshSession}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Session
              </Button>
              <Button variant="outline" size="sm" onClick={copyDiagnostics}>
                {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy All'}
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={!loading} label={loading ? 'Loading...' : 'Loaded'} />
                <StatusBadge ok={!!user} label={user ? 'User Present' : 'No User'} />
                <StatusBadge ok={!!session} label={session ? 'Session Active' : 'No Session'} />
                <StatusBadge ok={!!profile} label={profile ? 'Profile Loaded' : 'No Profile'} />
                <StatusBadge ok={roles.length > 0} label={roles.length > 0 ? `${roles.length} Role(s)` : 'No Roles'} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">ID</dt>
                      <dd className="font-mono text-xs break-all">{user.id}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>{user.email || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd>{user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Last Sign In</dt>
                      <dd>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">User Metadata</dt>
                      <dd className="font-mono text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-24">
                        {JSON.stringify(user.user_metadata, null, 2)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-muted-foreground text-sm">No user logged in</p>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session ? (
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Token Type</dt>
                      <dd>{session.token_type}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Expires At</dt>
                      <dd>{session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Access Token (truncated)</dt>
                      <dd className="font-mono text-xs break-all">
                        {session.access_token?.slice(0, 40)}...
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Refresh Token Present</dt>
                      <dd>{session.refresh_token ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-muted-foreground text-sm">No active session</p>
                )}
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile (from DB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">ID</dt>
                      <dd className="font-mono text-xs break-all">{profile.id}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">User ID</dt>
                      <dd className="font-mono text-xs break-all">{profile.user_id}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Name</dt>
                      <dd>{profile.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>{profile.email || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Patreon ID</dt>
                      <dd className="font-mono text-xs">{profile.patreon_id || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Patreon Tier</dt>
                      <dd>
                        <Badge variant="outline">{profile.patreon_tier || 'N/A'}</Badge>
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-muted-foreground text-sm">No profile found</p>
                )}
              </CardContent>
            </Card>

            {/* Roles Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Roles (from DB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No roles assigned</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Auth Events */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Auth Events</CardTitle>
            </CardHeader>
            <CardContent>
              {authEvents.length > 0 ? (
                <div className="space-y-2">
                  {authEvents.map((evt, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm p-2 bg-muted rounded">
                      <Badge variant="outline" className="shrink-0">{evt.event}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      {evt.userId && (
                        <span className="font-mono text-xs text-muted-foreground truncate">
                          {evt.userId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No auth events captured yet. Events will appear here as they occur.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Environment Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Origin</dt>
                  <dd className="font-mono text-xs">{window.location.origin}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Current Path</dt>
                  <dd className="font-mono text-xs">{window.location.pathname}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">In Iframe</dt>
                  <dd>{window.self !== window.top ? 'Yes (preview mode)' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Supabase URL</dt>
                  <dd className="font-mono text-xs">{import.meta.env.VITE_SUPABASE_URL || 'Not set'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
