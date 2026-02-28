import logoCream from '@/assets/logo-cream.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  const { user, profile, loading, signInWithPatreon, signOut } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const handlePatreonLogin = async () => {
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
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoCream} alt="ModernNostalgia.club" className="h-14 w-auto" />
        </Link>
        
        {showNav && (
          <nav className="hidden md:flex items-center gap-8">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/classroom" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Classroom
                </Link>
                <Link to="/studio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Studio Floor
                </Link>
                <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </Link>
                <Link to="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Account
                </Link>
              </>
            ) : (
              <>
                <a href="#what-this-is" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  What This Is
                </a>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </a>
                <a href="#why-this-exists" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Why This Exists
                </a>
              </>
            )}
          </nav>
        )}
        
        <div className="flex items-center gap-4">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
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
              onClick={handlePatreonLogin}
              className="text-sm font-medium text-primary hover:text-maroon-glow transition-colors"
            >
              Log in with Patreon
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}