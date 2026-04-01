import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import mncLogo from '@/assets/mnc-logo.png';
import logoBlack from '@/assets/logo-black.png';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === 'dark' ? mncLogo : logoBlack;

  return (
    <footer className="border-t border-white/10" style={{ background: '#1a1a1a' }} role="contentinfo">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={logo} alt="" className="h-10 w-auto" aria-hidden="true" />
              <span className="font-anton text-sm uppercase tracking-tight text-white -ml-1">Modern Nostalgia<span className="text-primary">.Club</span></span>
            </div>
            <p className="text-sm text-white/70 max-w-sm">
              Modern Nostalgia Club is a creative economy designed for artists who want to build sustainable income through music. It combines training, systems, and real-world workflows to help artists move beyond just creating and into operating like modern, independent businesses.
            </p>
            <p className="text-sm text-white/70 max-w-sm mt-3">
              It's not just about making music. It's about building a structure around your creativity so it can actually pay you.
            </p>
          </div>
          
          <nav aria-label="Lab navigation">
            <h4 className="font-display text-lg mb-4 text-white">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-primary transition-colors">
                  About MNC
                </Link>
              </li>
              <li>
                <Link to="/lab" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Creator Economy Lab
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link to="/reference" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Artist Resources
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
            </ul>
          </nav>
          
          <nav aria-label="External links">
            <h4 className="font-display text-lg mb-4 text-white">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.patreon.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-primary transition-colors"
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
                  className="text-sm text-white/70 hover:text-primary transition-colors"
                  aria-label="DISCO (opens in new tab)"
                >
                  DISCO
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} ModernNostalgia.club. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-xs text-white/50 hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/terms" className="text-xs text-white/50 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-xs text-white/50 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
