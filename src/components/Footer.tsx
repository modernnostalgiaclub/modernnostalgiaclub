import { Link } from 'react-router-dom';
import logoBlue from '@/assets/mnc-logo-blue.png';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50" role="contentinfo">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img src={logoCream} alt="" className="h-12 w-auto mb-4" aria-hidden="true" />
            <p className="text-sm text-muted-foreground max-w-sm">
              A Creative Economy Lab for artists building sustainable income. Training, systems, and professional workflows for the modern music economy.
            </p>
          </div>
          
          <nav aria-label="Lab navigation">
            <h4 className="font-display text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About MNC
                </Link>
              </li>
              <li>
                <Link to="/lab" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Creator Economy Lab
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link to="/reference" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Artist Resources
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Events
                </Link>
              </li>
            </ul>
          </nav>
          
          <nav aria-label="External links">
            <h4 className="font-display text-lg mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.patreon.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Patreon (opens in new tab)"
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
                  aria-label="DISCO (opens in new tab)"
                >
                  DISCO
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ModernNostalgia.club. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
