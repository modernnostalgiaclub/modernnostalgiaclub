import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logoCream from '@/assets/logo-cream.png';
import logoBlack from '@/assets/logo-black.png';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  GraduationCap,
  Disc3,
  BookOpen,
  Users,
  Music,
  Calendar,
  Settings,
  Bell,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

const navSections = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: '4 Pillars',
    items: [
      { title: 'Courses', url: '/courses', icon: GraduationCap },
      { title: 'Submit for Feedback', url: '/feedback', icon: Disc3 },
      { title: 'Artist Resources', url: '/artistresources', icon: BookOpen },
      { title: 'Community', url: '/community', icon: Users },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { title: 'Beat Library', url: '/beatlibrary', icon: Music },
      { title: 'Events', url: '/events', icon: Calendar },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Settings', url: '/account', icon: Settings },
      { title: 'Notifications', url: '/notifications', icon: Bell },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { hasRole } = useAuth();
  const { resolvedTheme } = useTheme();
  const isAdmin = hasRole('admin') || hasRole('moderator');
  const logo = resolvedTheme === 'dark' ? logoCream : logoBlack;

  const isActive = (url: string) => location.pathname === url || location.pathname.startsWith(url + '/');

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/" aria-label="Home">
          <img
            src={logo}
            alt="ModernNostalgia.club"
            className={collapsed ? 'h-6 w-auto' : 'h-8 w-auto'}
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Admin (role-gated) */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin')}
                    tooltip="Admin Panel"
                  >
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Admin Panel</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
