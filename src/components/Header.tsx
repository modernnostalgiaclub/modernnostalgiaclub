import React, { useState } from 'react';
import mncLogo from '@/assets/mnc-logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ChevronDown, LogOut, Loader2, Menu, User, Moon, Sun, ShoppingCart, LayoutDashboard, Users, Settings, BookOpen, Music } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarTrigger, SidebarContext } from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PATREON_PAGE_URL, SITE_NAVIGATION } from '@/lib/siteNavigation';

function SafeSidebarTrigger() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) return null;
  return <div className="lg:hidden"><SidebarTrigger className="text-inverse" /></div>;
}

const NavLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { url: string; label: string }>(function NavLink({ url, label, ...props }, ref) {
  if (url.startsWith('https://')) return <a ref={ref} href={url} target="_blank" rel="noopener noreferrer" {...props}>{label}</a>;
  // Native anchors also work when arriving from a different public page.
  if (url.includes('#')) return <a ref={ref} href={url} {...props}>{label}</a>;
  return <Link ref={ref} to={url} {...props}>{label}</Link>;
});

interface HeaderProps {
  showNav?: boolean;
  sticky?: boolean;
  announcement?: React.ReactNode;
}

export function Header({ showNav = true, sticky = false, announcement }: HeaderProps) {
  const { user, profile, loading, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminOrMod = hasRole('admin') || hasRole('moderator');
  const closeMobileMenu = () => setMobileMenuOpen(false);

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
      closeMobileMenu();
    } catch (error) { console.error('Failed to sign out:', error); }
  }

  const memberLinks = [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { label: 'Community', url: '/community', icon: Users },
    { label: 'Courses', url: '/courses', icon: BookOpen },
    { label: 'Studio Floor', url: '/feedback', icon: Music },
    { label: 'Profile', url: '/profile', icon: User },
    { label: 'Settings', url: '/account', icon: Settings },
  ];

  const cart = <Button variant="ghost" size="icon" className="relative text-inverse hover:bg-inverse/10" onClick={() => setCartOpen(true)} title="Shopping cart" aria-label={`Shopping cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}>
    <ShoppingCart aria-hidden="true" />
    {totalItems > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-inverse px-1 text-[10px] font-bold text-ink">{totalItems}</span>}
  </Button>;

  return (
    <header className={`site-chrome ${sticky ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50`} role="banner">
      {announcement}
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:gap-5 md:px-6">
        {user && <SafeSidebarTrigger />}
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="ModernNostalgia.club home">
          <img src={mncLogo} alt="" className="h-10 w-auto" aria-hidden="true" />
          <span className="hidden xl:inline font-anton text-sm uppercase text-inverse">Modern Nostalgia.Club</span>
        </Link>

        {showNav && <nav className="hidden min-w-0 items-center gap-1 lg:flex" aria-label="Main navigation">
          {SITE_NAVIGATION.map(group => <DropdownMenu key={group.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 px-3 text-inverse hover:bg-inverse/10 data-[state=open]:bg-inverse/10">{group.label}<ChevronDown className="h-3 w-3" aria-hidden="true" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={12} className="site-chrome min-w-56 rounded-none border-border p-2">
              {group.links.map(link => <DropdownMenuItem key={link.url} asChild className="min-h-11 cursor-pointer rounded-none px-3 text-inverse focus:bg-inverse/10 focus:text-inverse">
                <NavLink {...link} />
              </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>)}
          <Button variant="ghost" asChild className="px-3 text-inverse hover:bg-inverse/10"><Link to="/contact">Contact</Link></Button>
        </nav>}

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <div className="hidden items-center gap-2 lg:flex">
            {cart}
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-inverse-muted" /> : user ? <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-inverse/10" aria-label="Account menu" title="Account menu">
                    <Avatar className="h-8 w-8 border border-inverse/20">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || 'Profile'} />
                      <AvatarFallback className="bg-khaki text-xs text-inverse">{(profile?.name || profile?.stage_name || user.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="site-chrome w-52 rounded-none border-border p-2">
                  {memberLinks.map(({ label, url, icon: Icon }) => <DropdownMenuItem key={url} asChild className="min-h-11 rounded-none text-inverse focus:bg-inverse/10 focus:text-inverse"><Link to={url}><Icon aria-hidden="true" className="mr-2 h-4 w-4" />{label}</Link></DropdownMenuItem>)}
                  {isAdminOrMod && <><DropdownMenuSeparator className="bg-inverse/20" /><DropdownMenuItem asChild className="min-h-11 rounded-none text-inverse focus:bg-inverse/10 focus:text-inverse"><Link to="/admin"><Shield className="mr-2 h-4 w-4" aria-hidden="true" />Admin</Link></DropdownMenuItem></>}
                  <DropdownMenuSeparator className="bg-inverse/20" />
                  <DropdownMenuItem onClick={handleSignOut} className="min-h-11 rounded-none text-inverse focus:bg-inverse/10 focus:text-inverse"><LogOut className="mr-2 h-4 w-4" aria-hidden="true" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <>
              <Button variant="ghost" className="px-3 text-inverse hover:bg-inverse/10" onClick={() => navigate('/login')}>Log In</Button>
              <Button variant="editorial" asChild><a href={PATREON_PAGE_URL} target="_blank" rel="noopener noreferrer">Join the Club</a></Button>
            </>}
          </div>
          {showNav && <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-inverse hover:bg-inverse/10 lg:hidden" aria-label="Open menu"><Menu aria-hidden="true" /></Button></SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined} className="site-chrome w-[min(360px,100%)] overflow-y-auto border-border">
              <SheetTitle className="mb-6 text-left font-anton text-2xl uppercase text-inverse">Modern Nostalgia.Club</SheetTitle>
              <nav aria-label="Mobile navigation" className="space-y-5">
                {SITE_NAVIGATION.map(group => <div key={group.label} className="border-t border-inverse/20 pt-4">
                  <p className="mb-2 text-xs font-bold uppercase text-inverse-muted">{group.label}</p>
                  {group.links.map(link => <NavLink key={link.url} {...link} className="flex min-h-11 items-center py-2 text-sm text-inverse hover:underline" onClick={closeMobileMenu} />)}
                </div>)}
                <NavLink url="/contact" label="Contact" className="flex min-h-11 items-center border-t border-inverse/20 py-4 text-sm text-inverse" onClick={closeMobileMenu} />
                <div className="border-t border-inverse/20 pt-4">
                  <div className="mb-3 flex items-center justify-between"><span className="text-sm text-inverse-muted">Shopping cart</span>{cart}</div>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : user ? <div className="space-y-2">
                    {memberLinks.map(({ url, label }) => <NavLink key={url} url={url} label={label} className="flex min-h-11 items-center text-sm text-inverse" onClick={closeMobileMenu} />)}
                    {isAdminOrMod && <NavLink url="/admin" label="Admin" className="flex min-h-11 items-center text-sm text-inverse" onClick={closeMobileMenu} />}
                    <Button variant="inverseOutline" className="w-full justify-start" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>{resolvedTheme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</Button>
                    <Button variant="inverseOutline" className="w-full justify-start" onClick={handleSignOut}><LogOut aria-hidden="true" />Sign Out</Button>
                  </div> : <Button variant="inverseOutline" className="w-full" onClick={() => { navigate('/login'); closeMobileMenu(); }}>Log In</Button>}
                </div>
              </nav>
            </SheetContent>
          </Sheet>}
        </div>
      </div>
    </header>
  );
}
