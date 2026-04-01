import { useState } from 'react';
import mncLogo from '@/assets/mnc-logo.png';
import logoBlack from '@/assets/logo-black.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ChevronDown, LogOut, Loader2, Menu, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { NotificationBell } from '@/components/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header_PATREON_PAGE_URL = 'https://www.patreon.com/modernnostalgiaclub'; // kept for reference

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  const { user, profile, loading, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const logo = resolvedTheme === 'dark' ? mncLogo : logoBlack;
  const isAdmin = hasRole('admin');
  const isAdminOrMod = isAdmin || hasRole('moderator');

  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/login?tab=signup');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const linkClasses = "text-sm text-muted-foreground hover:text-foreground transition-colors";
  const mobileLinkClasses = "block py-3 text-lg text-foreground hover:text-primary transition-colors";

  const DesktopNavLinks = () => {
    if (isLoggedIn) {
      return (
        <>
          <Link to="/dashboard" className={linkClasses}>
            Dashboard
          </Link>
          <Link to="/classroom" className={linkClasses}>
            Classroom
          </Link>
          <Link to="/studio" className={linkClasses}>
            Studio Floor
          </Link>
          <Link to="/reference" className={linkClasses}>
            Artist Resources
          </Link>
          <Link to="/events" className={linkClasses}>
            Events
          </Link>
          <Link to="/beats" className={linkClasses}>
            Beat Library
          </Link>
          
          {/* Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`${linkClasses} flex items-center gap-1`}>
              Community
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="bg-background border-border">
              <DropdownMenuItem asChild>
                <Link to="/community" className="cursor-pointer">
                  Community Forum
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/members" className="cursor-pointer">
                  Member Directory
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    }
    
    return (
      <>
        <Link to="/about" className={linkClasses}>
          About
        </Link>
        <Link to="/blog" className={linkClasses}>
          Blog
        </Link>
        <Link to="/lab" className={linkClasses}>
          The Lab
        </Link>
        <Link to="/artists" className={linkClasses}>
          Artists
        </Link>
        <Link to="/sync-quiz" className={linkClasses}>
          Is Your Music Sync Ready?
        </Link>
        <Link to="/reference" className={linkClasses}>
          Artist Resources
        </Link>
      </>
    );
  };

  const MobileNavLinks = () => {
    if (isLoggedIn) {
      return (
        <>
          <Link to="/dashboard" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Dashboard
          </Link>
          <Link to="/classroom" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Classroom
          </Link>
          <Link to="/studio" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Studio Floor
          </Link>
          <Link to="/reference" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Artist Resources
          </Link>
          <Link to="/events" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Events
          </Link>
          <Link to="/beats" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Beat Library
          </Link>
          <Link to="/community" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Community
          </Link>
          <Link to="/members" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Members
          </Link>
          <Link to="/account" className={mobileLinkClasses} onClick={closeMobileMenu}>
            Account
          </Link>
          {isAdminOrMod && (
            <Link to="/admin" className={`${mobileLinkClasses} flex items-center gap-1`} onClick={closeMobileMenu}>
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </>
      );
    }
    
    return (
      <>
        <Link to="/about" className={mobileLinkClasses} onClick={closeMobileMenu}>
          About
        </Link>
        <Link to="/blog" className={mobileLinkClasses} onClick={closeMobileMenu}>
          Blog
        </Link>
        <Link to="/lab" className={mobileLinkClasses} onClick={closeMobileMenu}>
          The Lab
        </Link>
        <Link to="/artists" className={mobileLinkClasses} onClick={closeMobileMenu}>
          Artists
        </Link>
        <Link to="/sync-quiz" className={mobileLinkClasses} onClick={closeMobileMenu}>
          Is Your Music Sync Ready?
        </Link>
        <Link to="/reference" className={mobileLinkClasses} onClick={closeMobileMenu}>
          Artist Resources
        </Link>
      </>
    );
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10"
      style={{ background: 'hsl(222 47% 4% / 0.85)' }}
      role="banner"
    >
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="ModernNostalgia.club home">
          <img src={logo} alt="" className="h-12 w-auto" aria-hidden="true" />
          <span className="sr-only">ModernNostalgia.club</span>
        </Link>
        
        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <DesktopNavLinks />
          </nav>
        )}
        
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              {/* Notifications */}
              <NotificationBell />
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <User className="h-4 w-4" />
                  {profile?.name || user?.email?.split('@')[0] || 'Account'}
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border-border w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer flex items-center gap-2">
                    {resolvedTheme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenuItem>
                  {isAdminOrMod && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogin}
              >
                Log In
              </Button>
              <Button 
                variant="maroon"
                size="sm"
                onClick={handleSignUp}
              >
                Join Now
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          {showNav && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-border">
                <nav className="flex flex-col mt-8 space-y-2">
                  <MobileNavLinks />
                  
                  <div className="pt-6 mt-6 border-t border-border">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : isLoggedIn ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Signed in as {profile?.name || user?.email?.split('@')[0]}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={toggleTheme}
                        >
                          {resolvedTheme === 'dark' ? (
                            <>
                              <Sun className="w-4 h-4 mr-2" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="w-4 h-4 mr-2" />
                              Dark Mode
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleSignOut}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            handleLogin();
                            closeMobileMenu();
                          }}
                        >
                          Log In
                        </Button>
                        <Button 
                          variant="maroon"
                          className="w-full"
                          onClick={() => {
                            handleSignUp();
                            closeMobileMenu();
                          }}
                        >
                          Join Now
                        </Button>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
