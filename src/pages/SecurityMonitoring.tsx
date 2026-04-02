import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Activity, Users, Clock, TrendingUp } from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface ActivityPattern {
  user_id: string;
  action: string;
  count: number;
  last_occurrence: string;
  ip_addresses: string[];
}

interface AnomalyAlert {
  type: 'high_frequency' | 'sensitive_action' | 'ip_change' | 'off_hours';
  severity: 'low' | 'medium' | 'high';
  message: string;
  user_id: string;
  timestamp: string;
  details: Record<string, unknown>;
}

const SENSITIVE_ACTIONS = ['role_update', 'tier_update', 'delete', 'user_update'];
const HIGH_FREQUENCY_THRESHOLD = 10; // actions per hour
const OFF_HOURS_START = 2; // 2 AM
const OFF_HOURS_END = 6; // 6 AM

export default function SecurityMonitoring() {
  const { hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [patterns, setPatterns] = useState<ActivityPattern[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !hasRole('admin')) {
      navigate('/dashboard');
    }
  }, [authLoading, hasRole, navigate]);

  useEffect(() => {
    if (hasRole('admin')) {
      fetchAuditLogs();
    }
  }, [hasRole]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', subDays(new Date(), 7).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedLogs = (data || []) as AuditLog[];
      setLogs(typedLogs);
      analyzePatterns(typedLogs);
      detectAnomalies(typedLogs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = (logs: AuditLog[]) => {
    const patternMap = new Map<string, ActivityPattern>();

    logs.forEach((log) => {
      const key = `${log.user_id}-${log.action}`;
      const existing = patternMap.get(key);

      if (existing) {
        existing.count++;
        if (log.ip_address && !existing.ip_addresses.includes(log.ip_address)) {
          existing.ip_addresses.push(log.ip_address);
        }
        if (new Date(log.created_at) > new Date(existing.last_occurrence)) {
          existing.last_occurrence = log.created_at;
        }
      } else {
        patternMap.set(key, {
          user_id: log.user_id,
          action: log.action,
          count: 1,
          last_occurrence: log.created_at,
          ip_addresses: log.ip_address ? [log.ip_address] : [],
        });
      }
    });

    const sortedPatterns = Array.from(patternMap.values()).sort((a, b) => b.count - a.count);
    setPatterns(sortedPatterns.slice(0, 20));
  };

  const detectAnomalies = (logs: AuditLog[]) => {
    const detected: AnomalyAlert[] = [];
    const hourAgo = subHours(new Date(), 1);

    // Group logs by user for frequency analysis
    const userActivityMap = new Map<string, AuditLog[]>();
    logs.forEach((log) => {
      const existing = userActivityMap.get(log.user_id) || [];
      existing.push(log);
      userActivityMap.set(log.user_id, existing);
    });

    // Detect high frequency activity
    userActivityMap.forEach((userLogs, userId) => {
      const recentLogs = userLogs.filter((l) => new Date(l.created_at) > hourAgo);
      if (recentLogs.length >= HIGH_FREQUENCY_THRESHOLD) {
        detected.push({
          type: 'high_frequency',
          severity: recentLogs.length >= HIGH_FREQUENCY_THRESHOLD * 2 ? 'high' : 'medium',
          message: `User performed ${recentLogs.length} actions in the last hour`,
          user_id: userId,
          timestamp: new Date().toISOString(),
          details: { action_count: recentLogs.length },
        });
      }

      // Detect multiple IP addresses
      const ips = new Set(userLogs.map((l) => l.ip_address).filter(Boolean));
      if (ips.size > 2) {
        detected.push({
          type: 'ip_change',
          severity: ips.size > 4 ? 'high' : 'medium',
          message: `User accessed from ${ips.size} different IP addresses`,
          user_id: userId,
          timestamp: new Date().toISOString(),
          details: { ip_count: ips.size, ips: Array.from(ips) },
        });
      }
    });

    // Detect sensitive actions
    logs.forEach((log) => {
      if (SENSITIVE_ACTIONS.some((action) => log.action.toLowerCase().includes(action))) {
        detected.push({
          type: 'sensitive_action',
          severity: 'medium',
          message: `Sensitive action: ${log.action} on ${log.table_name}`,
          user_id: log.user_id,
          timestamp: log.created_at,
          details: { action: log.action, table: log.table_name, record_id: log.record_id },
        });
      }

      // Detect off-hours activity
      const hour = new Date(log.created_at).getHours();
      if (hour >= OFF_HOURS_START && hour < OFF_HOURS_END) {
        detected.push({
          type: 'off_hours',
          severity: 'low',
          message: `Activity during off-hours (${hour}:00)`,
          user_id: log.user_id,
          timestamp: log.created_at,
          details: { hour, action: log.action },
        });
      }
    });

    // Sort by severity and limit
    const severityOrder = { high: 0, medium: 1, low: 2 };
    detected.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    setAnomalies(detected.slice(0, 50));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'high_frequency':
        return <TrendingUp className="h-4 w-4" />;
      case 'sensitive_action':
        return <AlertTriangle className="h-4 w-4" />;
      case 'ip_change':
        return <Users className="h-4 w-4" />;
      case 'off_hours':
        return <Clock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const highSeverityCount = anomalies.filter((a) => a.severity === 'high').length;
  const mediumSeverityCount = anomalies.filter((a) => a.severity === 'medium').length;
  const sensitiveActionCount = anomalies.filter((a) => a.type === 'sensitive_action').length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!hasRole('admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Security Monitoring</h1>
            <p className="text-muted-foreground">Real-time analysis of audit logs and activity patterns</p>
          </div>
        </div>

        {highSeverityCount > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>High Severity Alerts</AlertTitle>
            <AlertDescription>
              {highSeverityCount} high severity anomalies detected. Review immediately.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Events (7d)</CardDescription>
              <CardTitle className="text-2xl">{logs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>High Severity</CardDescription>
              <CardTitle className="text-2xl text-destructive">{highSeverityCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Medium Severity</CardDescription>
              <CardTitle className="text-2xl text-secondary-foreground">{mediumSeverityCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sensitive Actions</CardDescription>
              <CardTitle className="text-2xl">{sensitiveActionCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Anomalies</TabsTrigger>
            <TabsTrigger value="patterns">Activity Patterns</TabsTrigger>
            <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
                <CardDescription>Unusual activity patterns from the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : anomalies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No anomalies detected</p>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {anomalies.map((anomaly, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                        >
                          <div className="mt-0.5">{getAnomalyIcon(anomaly.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getSeverityColor(anomaly.severity)}>
                                {anomaly.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(anomaly.timestamp), 'MMM d, HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{anomaly.message}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              User: {anomaly.user_id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns">
            <Card>
              <CardHeader>
                <CardTitle>Activity Patterns</CardTitle>
                <CardDescription>Most frequent actions by users</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>IPs Used</TableHead>
                        <TableHead>Last Seen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patterns.map((pattern, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">
                            {pattern.user_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{pattern.action}</TableCell>
                          <TableCell>
                            <Badge variant={pattern.count > 20 ? 'destructive' : 'secondary'}>
                              {pattern.count}
                            </Badge>
                          </TableCell>
                          <TableCell>{pattern.ip_addresses.length}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(pattern.last_occurrence), 'MMM d, HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Logs</CardTitle>
                <CardDescription>Last 7 days of activity</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Table</TableHead>
                          <TableHead>IP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.slice(0, 100).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.user_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.table_name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {log.ip_address || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
