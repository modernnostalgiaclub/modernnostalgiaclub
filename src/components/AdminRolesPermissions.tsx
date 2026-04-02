import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Shield, Users, Crown } from 'lucide-react';

const permissions = [
  { area: 'User Management', admin: true, moderator: false, user: false },
  { area: 'Role Assignment', admin: true, moderator: false, user: false },
  { area: 'Membership Plans / Pricing', admin: true, moderator: false, user: false },
  { area: 'Site Settings', admin: true, moderator: false, user: false },
  { area: 'Database Backup', admin: true, moderator: false, user: false },
  { area: 'Send Notifications', admin: true, moderator: false, user: false },
  { area: 'Submission Review', admin: true, moderator: true, user: false },
  { area: 'Community Moderation', admin: true, moderator: true, user: false },
  { area: 'Content Flagging', admin: true, moderator: true, user: false },
  { area: 'Own Profile / Settings', admin: true, moderator: true, user: true },
  { area: 'Submit Audio / Projects', admin: true, moderator: true, user: true },
  { area: 'Community Participation', admin: true, moderator: true, user: true },
  { area: 'Courses & Dashboard', admin: true, moderator: true, user: true },
];

const roleInfo = [
  {
    role: 'Admin',
    icon: Crown,
    color: 'text-amber-500',
    description: 'Full platform control including user management, billing, membership plans, and system settings. Requires MFA/2FA.',
  },
  {
    role: 'Moderator',
    icon: Shield,
    color: 'text-blue-500',
    description: 'Content moderation including submissions, group chat, community posts/comments, and member interaction management.',
  },
  {
    role: 'User',
    icon: Users,
    color: 'text-muted-foreground',
    description: 'Standard member access to manage their own profile, tracks, and community participation.',
  },
];

export function AdminRolesPermissions() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleInfo.map(({ role, icon: Icon, color, description }) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className={`h-5 w-5 ${color}`} />
                {role}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
          <CardDescription>What each role can access and manage across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Feature / Area</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Admin
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Moderator
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    User
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map(({ area, admin, moderator, user }) => (
                <TableRow key={area}>
                  <TableCell className="font-medium">{area}</TableCell>
                  <TableCell className="text-center">
                    {admin ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {moderator ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {user ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
