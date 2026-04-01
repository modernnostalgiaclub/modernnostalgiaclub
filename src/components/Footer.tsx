import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import mncLogo from '@/assets/mnc-logo.png';
import logoBlack from '@/assets/logo-black.png';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === 'dark' ? mncLogo : logoBlack;

  return (
    <footer className="border-t border-white/10" style={{ background: '#1a1a1a' }} role="contentinfo">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="flex items-center mb-3">
              <img src={logo} alt="" className="h-8 w-auto" aria-hidden="true" />
              <span className="font-anton text-sm uppercase tracking-tight text-white -ml-1">Modern Nostalgia<span className="text-primary">.Club</span></span>
            </div>
            <p className="text-xs text-white/70 max-w-xs">
              A creative economy designed for artists who want to build sustainable income through music.
            </p>
          </div>
          
          <nav aria-label="Site navigation" className="md:col-span-1">
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-sm text-white/70 hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-sm text-white/70 hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-sm text-white/70 hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/reference" className="text-sm text-white/70 hover:text-primary transition-colors">Artist Resources</Link></li>
              <li><Link to="/join" className="text-sm text-white/70 hover:text-primary transition-colors">Join MNC</Link></li>
              <li>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLScQm7rwO_R-O1Fg_0LR1_A3dyq_aPPB4JRJs6UvN63hBuprMQ/viewform" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-primary transition-colors" aria-label="Submit Music (opens in new tab)">
                  Submit Music
                </a>
              </li>
              <li><Link to="/contact" className="text-sm text-white/70 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </nav>

          <div className="md:col-span-1 flex flex-col justify-end">
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} ModernNostalgia.club. All rights reserved.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link to="/terms" className="text-xs text-white/50 hover:text-primary transition-colors">Terms</Link>
              <Link to="/privacy" className="text-xs text-white/50 hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
