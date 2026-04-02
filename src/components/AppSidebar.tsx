import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  LayoutDashboard,
  GraduationCap,
  Music,
  Users,
  Calendar,
  BookOpen,
  Disc3,
  ShoppingBag,
  Settings,
  Mail,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const topItems = [
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
];

const mainItems = [
  { title: 'Courses', url: '/courses', icon: GraduationCap },
  { title: 'Beat Library', url: '/beatlibrary', icon: Music },
  { title: 'Community', url: '/community', icon: Users },
  { title: 'Events', url: '/events', icon: Calendar },
  { title: 'Ebooks', url: '/ebooks', icon: BookOpen },
  { title: 'Submit for Feedback', url: '/feedback', icon: Disc3 },
  { title: 'Store', url: '/store', icon: ShoppingBag },
];

const bottomItems = [
  { title: 'Settings', url: '/account', icon: Settings },
  { title: 'Contact', url: '/contact', icon: Mail },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('moderator');

  const isActive = (url: string) =>
    location.pathname === url || location.pathname.startsWith(url + '/');

  const renderItems = (items: typeof topItems) => (
    <SidebarMenu>
      {items.map((item) => (
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
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 top-20 h-[calc(100vh-5rem)] [&>div]:bg-[#1a1a1a] [&>div]:text-white/80"
    >
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>{renderItems(topItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-white/10 mx-3" />

        <SidebarGroup>
          <SidebarGroupContent>{renderItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-white/10 mx-3" />

        <SidebarGroup>
          <SidebarGroupContent>{renderItems(bottomItems)}</SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator className="bg-white/10 mx-3" />
            <SidebarGroup>
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
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
