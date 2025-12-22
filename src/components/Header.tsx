import { useState } from 'react';
import logoCream from '@/assets/logo-cream.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const PATREON_PAGE_URL = 'https://www.patreon.com/modernnostalgiaclub';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  const { user, profile, loading, hasRole, signInWithPatreon, signOut } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const linkClasses = mobile 
      ? "block py-3 text-lg text-foreground hover:text-primary transition-colors"
      : "text-sm text-muted-foreground hover:text-foreground transition-colors";

    if (isLoggedIn) {
      const isAdminOrMod = hasRole('admin') || hasRole('moderator');
      return (
        <>
          <Link to="/dashboard" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
            Dashboard
          </Link>
          <Link to="/classroom" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
            Classroom
          </Link>
          <Link to="/studio" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
            Studio Floor
          </Link>
          <Link to="/reference-shelf" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
            Reference Shelf
          </Link>
          <Link to="/community" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
            Community
          </Link>
          <Link to="/account" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
            Account
          </Link>
          {isAdminOrMod && (
            <Link to="/admin" className={`${linkClasses} flex items-center gap-1`} onClick={mobile ? closeMobileMenu : undefined}>
              <Shield className="h-3 w-3" />
              Admin
            </Link>
          )}
        </>
      );
    }
    
    return (
      <>
        <a href="#what-this-is" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
          What This Is
        </a>
        <a href="#how-it-works" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
          How It Works
        </a>
        <a href="#why-this-exists" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
          Why This Exists
        </a>
        <a href="#partners" className={linkClasses} onClick={mobile ? closeMobileMenu : undefined}>
          Partners
        </a>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoCream} alt="ModernNostalgia.club" className="h-14 w-auto" />
        </Link>
        
        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>
        )}
        
        <div className="flex items-center gap-4">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {profile?.name || user?.email?.split('@')[0] || 'Account'}
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost"
              onClick={handleJoinPatreon}
              className="hidden md:inline-flex text-sm font-medium text-primary hover:text-maroon-glow transition-colors"
            >
              Join on Patreon
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </Button>
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
                  <NavLinks mobile />
                  
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
                            handleJoinPatreon();
                            closeMobileMenu();
                          }}
                        >
                          Join on Patreon
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </Button>
                        <button
                          onClick={() => {
                            handleMemberLogin();
                            closeMobileMenu();
                          }}
                          className="w-full text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                        >
                          Already a member? Log in
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