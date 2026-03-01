import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface LabLayoutProps {
  children: ReactNode;
}

export function LabLayout({ children }: LabLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger className="shrink-0" />

            <div className="flex items-center gap-3 ml-auto">
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">
                      {profile?.name || user?.email?.split('@')[0] || 'Account'}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer flex items-center gap-2">
                    {resolvedTheme === 'dark' ? (
                      <><Sun className="h-4 w-4" /> Light Mode</>
                    ) : (
                      <><Moon className="h-4 w-4" /> Dark Mode</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main id="main-content" className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
