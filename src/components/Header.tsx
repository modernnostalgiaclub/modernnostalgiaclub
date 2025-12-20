import logoCream from '@/assets/logo-cream.png';
import { Link } from 'react-router-dom';

interface HeaderProps {
  showNav?: boolean;
  isLoggedIn?: boolean;
}

export function Header({ showNav = true, isLoggedIn = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoCream} alt="ModernNostalgia.club" className="h-10 w-auto" />
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
          {isLoggedIn ? (
            <Link to="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Demo Artist
            </Link>
          ) : (
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-primary hover:text-amber-glow transition-colors"
            >
              Log in with Patreon
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
