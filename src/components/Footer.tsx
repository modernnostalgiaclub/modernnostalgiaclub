import { Link } from 'react-router-dom';
import logoCream from '@/assets/logo-cream.png';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img src={logoCream} alt="ModernNostalgia.club" className="h-12 w-auto mb-4" />
            <p className="text-sm text-muted-foreground max-w-sm">
              A Creative Economy Lab for artists building sustainable income. Training, systems, and professional workflows for the modern music economy.
            </p>
          </div>
          
          <div>
            <h4 className="font-display text-lg mb-4">Lab</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/classroom" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Classroom
                </Link>
              </li>
              <li>
                <Link to="/studio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Studio Floor
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/reference" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Reference Shelf
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-lg mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.patreon.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Patreon
                </a>
              </li>
              <li>
                <a 
                  href="https://disco.ac/signup?b=5076&u=23831" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  DISCO
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ModernNostalgia.club. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Building the future of the creative economy.
          </p>
        </div>
      </div>
    </footer>
  );
}
