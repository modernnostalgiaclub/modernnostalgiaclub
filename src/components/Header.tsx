import { useState } from 'react';
import mncLogo from '@/assets/mnc-logo.png';
import logoBlack from '@/assets/logo-black.png';
import mncTextLogo from '@/assets/mnc-text-logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ChevronDown, LogOut, Loader2, Menu, User, Moon, Sun, Instagram, Twitter, ShoppingCart, LayoutDashboard, Users, Settings } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const { totalItems, setIsOpen: setCartOpen } = useCart();
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

  const linkClasses = "text-sm text-white hover:text-primary transition-colors";
  const mobileLinkClasses = "block py-3 text-lg text-foreground hover:text-primary transition-colors";

  const navLinks = isLoggedIn
    ? [
        { label: 'Home', url: '/' },
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'Community', url: '/community' },
        { label: 'Events', url: '/events' },
        { label: 'Artist Resources', url: '/artistresources' },
        { label: 'Store', url: '/store' },
        { label: 'Submit', url: '/feedback' },
      ]
    : [
        { label: 'About', url: '/about' },
        { label: 'Blog', url: '/blog' },
        { label: 'Join the Club', url: '/join' },
        { label: 'Artist Resources', url: '/artistresources' },
        { label: 'Store', url: '/store' },
        { label: 'Contact', url: '/contact' },
      ];

  const DesktopNavLinks = () => (
    <>
      {navLinks.map((link) => (
        <Link key={link.url} to={link.url} className={linkClasses}>{link.label}</Link>
      ))}
    </>
  );

  const MobileNavLinks = () => (
    <>
      {navLinks.map((link) => (
        <Link key={link.url} to={link.url} className={mobileLinkClasses} onClick={closeMobileMenu}>{link.label}</Link>
      ))}
    </>
  );

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: '#141414' }}
      role="banner"
    >
      <div className="w-full px-4 md:px-6 h-20 relative flex items-center justify-between">
        {/* Logo - far left */}
        {/* Mobile sidebar trigger (logged-in only) */}
        {isLoggedIn && (
          <div className="lg:hidden mr-2">
            <SidebarTrigger className="text-blue hover:text-blue-glow h-6 w-6" />
          </div>
        )}

        <Link to="/" className="flex items-center shrink-0" aria-label="ModernNostalgia.club home">
          <img src={logo} alt="" className="h-10 w-auto" aria-hidden="true" />
          <span className="hidden sm:inline font-anton text-sm uppercase tracking-tight text-white -ml-1">Modern Nostalgia<span className="text-primary">.Club</span></span>
        </Link>
        
        {/* Desktop Navigation - truly centered */}
        {showNav && (
          <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 pointer-events-none" aria-label="Main navigation">
            <div className="flex items-center gap-6 pointer-events-auto">
              <DesktopNavLinks />
            </div>
          </nav>
        )}
        
        {/* Right side: social + auth buttons */}
        <div className="flex items-center shrink-0 ml-auto relative z-10">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="hidden lg:flex items-center gap-6">
              <a href="https://www.instagram.com/modernnostalgia.club/" target="_blank" rel="noopener noreferrer" className="text-blue hover:text-blue-glow transition-colors" aria-label="Instagram (opens in new tab)">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.threads.net/@modernnostalgia.club" target="_blank" rel="noopener noreferrer" className="text-blue hover:text-blue-glow transition-colors" aria-label="Threads (opens in new tab)">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.724 2.104-1.126 3.59-1.179.943-.033 1.813.043 2.601.218-.068-1.299-.57-2.28-1.49-2.913-.59-.404-1.352-.614-2.266-.625l-.036-.003c-1.174 0-2.154.395-2.834 1.143l-1.482-1.348c1.065-1.171 2.534-1.794 4.317-1.794l.052.002c1.898.023 3.405.723 4.35 2.024.88 1.21 1.34 2.88 1.365 4.965l.002.096c.033.344.033.69 0 1.032-.13 2.94-1.15 5.04-3.036 6.25-1.674 1.076-3.78 1.625-6.264 1.633zM10.39 15.71c-.14.024-.28.043-.42.055-1.594.13-2.412.9-2.368 1.706.042.748.924 1.393 2.118 1.329 1.08-.058 1.928-.468 2.523-1.22.45-.567.769-1.322.943-2.243-.68-.18-1.446-.28-2.296-.275-.174.002-.34.01-.5.024v-.002z" clipRule="evenodd" fillRule="evenodd"/></svg>
              </a>
              <a href="https://x.com/geohworks" target="_blank" rel="noopener noreferrer" className="text-blue hover:text-blue-glow transition-colors" aria-label="Twitter/X (opens in new tab)">
                <Twitter className="h-4 w-4" />
              </a>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative text-white hover:text-blue transition-colors"
                  aria-label={`Shopping cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-maroon text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
                <NotificationBell />
                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center transition-colors">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || 'Profile'} />
                      <AvatarFallback className="bg-white/10 text-white text-xs">
                        {(profile?.name || profile?.stage_name || user?.email?.charAt(0) || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link to="/dashboard" className="cursor-pointer flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link to="/community" className="cursor-pointer flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Community
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link to="/account" className="cursor-pointer flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdminOrMod && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                        <Link to="/admin" className="cursor-pointer flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center gap-2 text-red-400 focus:text-red-400 focus:bg-white/10">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3 ml-4">
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-white hover:text-primary transition-colors"
                aria-label={`Shopping cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-maroon text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <Button 
                variant="outline"
                size="sm"
                className="w-24"
                onClick={handleLogin}
              >
                Log In
              </Button>
              <Button 
                variant="maroon"
                size="sm"
                className="w-24"
                onClick={() => navigate('/join')}
              >
                Join Now
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          {showNav && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-blue hover:text-blue-glow">
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
                            navigate('/join');
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
