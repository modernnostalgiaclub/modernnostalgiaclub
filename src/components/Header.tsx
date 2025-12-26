import { useState } from 'react';
import logoCream from '@/assets/logo-cream.png';
import logoBlack from '@/assets/logo-black.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Menu, User, Moon, Sun } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PATREON_PAGE_URL = 'https://www.patreon.com/modernnostalgiaclub';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  const { user, profile, loading, hasRole, signInWithPatreon, signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const logo = resolvedTheme === 'dark' ? logoCream : logoBlack;
  const isAdmin = hasRole('admin');
  const isAdminOrMod = isAdmin || hasRole('moderator');

  const handleJoinPatreon = () => {
    window.open(PATREON_PAGE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleMemberLogin = async () => {
    try {
      await signInWithPatreon();
    } catch (error) {
      console.error('Failed to initiate Patreon login:', error);
    }
  };

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
            Reference
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
        <a href="#what-this-is" className={linkClasses}>
          What This Is
        </a>
        <a href="#how-it-works" className={linkClasses}>
          How It Works
        </a>
        <a href="#why-this-exists" className={linkClasses}>
          Why This Exists
        </a>
        <a href="#partners" className={linkClasses}>
          Partners
        </a>
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
            Reference
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
        <a href="#what-this-is" className={mobileLinkClasses} onClick={closeMobileMenu}>
          What This Is
        </a>
        <a href="#how-it-works" className={mobileLinkClasses} onClick={closeMobileMenu}>
          How It Works
        </a>
        <a href="#why-this-exists" className={mobileLinkClasses} onClick={closeMobileMenu}>
          Why This Exists
        </a>
        <a href="#partners" className={mobileLinkClasses} onClick={closeMobileMenu}>
          Partners
        </a>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="ModernNostalgia.club" className="h-12 w-auto" />
        </Link>
        
        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-6">
            <DesktopNavLinks />
          </nav>
        )}
        
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
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
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleJoinPatreon}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Join on Patreon
              </button>
              <Button 
                variant="maroon"
                onClick={handleMemberLogin}
              >
                Explore the Lab
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
                          variant="maroon"
                          className="w-full"
                          onClick={() => {
                            handleMemberLogin();
                            closeMobileMenu();
                          }}
                        >
                          Explore the Lab
                        </Button>
                        <button
                          onClick={() => {
                            handleJoinPatreon();
                            closeMobileMenu();
                          }}
                          className="w-full text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                        >
                          Join on Patreon
                        </button>
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
