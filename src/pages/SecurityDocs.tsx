import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Shield, 
  Lock, 
  Database, 
  Key, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Eye,
  Server
} from 'lucide-react';

export default function SecurityDocs() {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Security Documentation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive overview of security measures implemented across the platform.
              This documentation is restricted to administrators only.
            </p>
            <Badge variant="outline" className="text-xs">
              Admin Access Only
            </Badge>
          </div>

          {/* Quick Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Security Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusItem label="RLS Enabled" status="active" />
                <StatusItem label="MFA Available" status="active" />
                <StatusItem label="Audit Logging" status="active" />
                <StatusItem label="Input Validation" status="active" />
              </div>
            </CardContent>
          </Card>

          {/* Main Documentation */}
          <Accordion type="single" collapsible className="space-y-4">
            {/* Authentication & Authorization */}
            <AccordionItem value="auth" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Authentication & Authorization</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <Section title="Role-Based Access Control">
                  <p>
                    User roles are stored in a dedicated <code>user_roles</code> table, separate from 
                    the profiles table, to prevent privilege escalation attacks. The system supports 
                    three roles:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>Admin</strong> - Full platform control, can manage users and content</li>
                    <li><strong>Moderator</strong> - Can review submissions and approve content</li>
                    <li><strong>User</strong> - Standard member access based on Patreon tier</li>
                  </ul>
                </Section>

                <Section title="Multi-Factor Authentication (MFA)">
                  <p>
                    Admin accounts support optional TOTP-based 2FA via authenticator apps. When enabled:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Admins must verify MFA before accessing admin dashboards (AdminMFAGate)</li>
                    <li>Sensitive actions require re-authentication (useReauth hook)</li>
                    <li>MFA status is tracked in AuthContext</li>
                  </ul>
                </Section>

                <Section title="Patreon OAuth Integration">
                  <p>
                    OAuth tokens are stored in a private schema (<code>private.patreon_tokens</code>) 
                    that is inaccessible via the client API. Only backend edge functions with service 
                    role can access tokens for operations like token refresh.
                  </p>
                </Section>
              </AccordionContent>
            </AccordionItem>

            {/* Database Security */}
            <AccordionItem value="database" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Database Security</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <Section title="Row-Level Security (RLS)">
                  <p>
                    All tables have RLS enabled with explicit policies. Key patterns:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>Anonymous Blocking</strong> - All tables have RESTRICTIVE policies blocking anonymous access</li>
                    <li><strong>User Isolation</strong> - Users can only access their own data via <code>auth.uid() = user_id</code></li>
                    <li><strong>Admin Override</strong> - Admins can access all data via <code>has_role()</code> function</li>
                    <li><strong>Tier Enforcement</strong> - Content access validated at database level via <code>user_has_tier_access()</code></li>
                  </ul>
                </Section>

                <Section title="Security Definer Functions">
                  <p>
                    Critical operations use SECURITY DEFINER functions to prevent RLS recursion 
                    and data leakage:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><code>has_role()</code> - Checks user roles without recursion</li>
                    <li><code>get_user_submissions()</code> - Returns submissions with internal_notes hidden from regular users</li>
                    <li><code>get_public_profiles()</code> - Returns only public profile data</li>
                    <li><code>log_admin_access()</code> - Records audit logs with masked IP addresses</li>
                  </ul>
                </Section>

                <Section title="Sensitive Data Protection">
                  <p>Tables containing sensitive data have additional protections:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>submissions.internal_notes</strong> - Never exposed to regular users</li>
                    <li><strong>submissions.reviewer_notes</strong> - Only visible after review is complete</li>
                    <li><strong>beat_license_submissions</strong> - Only accessible by owner and admin</li>
                    <li><strong>audit_logs</strong> - Admin-only access with IP masking</li>
                  </ul>
                </Section>
              </AccordionContent>
            </AccordionItem>

            {/* Audit Logging */}
            <AccordionItem value="audit" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Audit Logging</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <Section title="What's Logged">
                  <p>Admin actions are recorded with:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>User ID of the admin performing the action</li>
                    <li>Action type (view, update, delete, etc.)</li>
                    <li>Table name and record ID affected</li>
                    <li>Additional details in JSON format</li>
                    <li>Masked IP address (last octet replaced with 0 for IPv4)</li>
                    <li>Timestamp</li>
                  </ul>
                </Section>

                <Section title="Privacy Considerations">
                  <p>
                    IP addresses are automatically masked by <code>log_admin_access()</code> for privacy:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>IPv4: Last octet replaced with 0 (e.g., 192.168.1.123 → 192.168.1.0)</li>
                    <li>IPv6: Truncated to first 3 groups</li>
                  </ul>
                </Section>

                <Section title="Implementation">
                  <p>
                    Use the <code>useAuditLog</code> hook in admin components:
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-sm mt-2 overflow-x-auto">
{`const { logAccess } = useAuditLog();

await logAccess({
  tableName: 'profiles',
  action: 'update_tier',
  recordId: userId,
  details: { newTier: 'creator-accelerator' }
});`}
                  </pre>
                </Section>
              </AccordionContent>
            </AccordionItem>

            {/* Edge Functions */}
            <AccordionItem value="edge" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Edge Function Security</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <Section title="Authentication">
                  <p>
                    Edge functions are configured with <code>verify_jwt = true</code> in 
                    supabase/config.toml, requiring valid authentication tokens for all requests.
                  </p>
                </Section>

                <Section title="CORS Configuration">
                  <p>
                    CORS is restricted to an allowlist of specific domains rather than wildcard 
                    access. Only approved origins can call edge functions.
                  </p>
                </Section>

                <Section title="Input Handling">
                  <ul className="list-disc pl-6 space-y-1">
                    <li>All user inputs are validated before processing</li>
                    <li>HTML content is escaped before inclusion in emails/output</li>
                    <li>XSS prevention through proper sanitization</li>
                  </ul>
                </Section>
              </AccordionContent>
            </AccordionItem>

            {/* Input Validation */}
            <AccordionItem value="validation" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Input Validation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <Section title="Zod Schema Validation">
                  <p>
                    User inputs are validated using Zod schemas defined in 
                    <code>src/lib/formValidation.ts</code>. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>String length limits and trimming</li>
                    <li>Email format validation</li>
                    <li>URL format and protocol validation</li>
                    <li>Enum/option validation</li>
                  </ul>
                </Section>

                <Section title="XSS Prevention">
                  <p>
                    A <code>sanitizeString()</code> helper escapes potentially dangerous characters:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>HTML entities are escaped (&lt;, &gt;, &amp;, etc.)</li>
                    <li>Applied to user-generated content before storage/display</li>
                  </ul>
                </Section>

                <Section title="URL Validation">
                  <p>
                    URL inputs are validated via <code>src/lib/urlValidation.ts</code> to ensure 
                    only safe protocols (http/https) and valid formats are accepted.
                  </p>
                </Section>
              </AccordionContent>
            </AccordionItem>

            {/* Best Practices */}
            <AccordionItem value="practices" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Admin Best Practices</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <Section title="Account Security">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Enable MFA</strong> - Go to Account → Two-Factor Authentication to set up TOTP</li>
                    <li><strong>Use strong passwords</strong> - Minimum 12 characters with mixed case, numbers, symbols</li>
                    <li><strong>Review sessions</strong> - Regularly check for unauthorized access</li>
                  </ul>
                </Section>

                <Section title="Data Handling">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Minimize data exposure</strong> - Only access data when necessary for your task</li>
                    <li><strong>Use internal notes appropriately</strong> - Never share internal_notes with users</li>
                    <li><strong>Document actions</strong> - Audit logs capture your actions automatically</li>
                  </ul>
                </Section>

                <Section title="User Management">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Principle of least privilege</strong> - Assign minimum necessary roles</li>
                    <li><strong>Review moderators</strong> - Regularly audit who has elevated access</li>
                    <li><strong>Tier changes</strong> - Verify requests before updating Patreon tiers</li>
                  </ul>
                </Section>

                <Section title="Incident Response">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Suspicious activity</strong> - Check audit_logs for unusual patterns</li>
                    <li><strong>Compromised account</strong> - Immediately revoke access and reset credentials</li>
                    <li><strong>Data breach</strong> - Document scope, notify affected users, review RLS policies</li>
                  </ul>
                </Section>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Warning */}
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Important Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Never share admin credentials or bypass MFA requirements</p>
              <p>• All admin actions are logged and auditable</p>
              <p>• Report security concerns immediately to the platform owner</p>
              <p>• This documentation is confidential - do not share externally</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: 'active' | 'warning' | 'inactive' }) {
  const colors = {
    active: 'bg-green-500/20 text-green-600 border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
    inactive: 'bg-red-500/20 text-red-600 border-red-500/30',
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[status]} text-center`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-xs capitalize mt-1">{status}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
