import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Twitter, Instagram, AtSign } from 'lucide-react';
import mncLogo from '@/assets/mnc-logo.png';
import logoBlack from '@/assets/logo-black.png';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === 'dark' ? mncLogo : logoBlack;

  return (
    <footer className="border-t border-white/10" style={{ background: '#1a1a1a' }} role="contentinfo">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start md:gap-16">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="" className="h-10 w-auto" aria-hidden="true" />
              <span className="font-anton text-sm uppercase tracking-tight text-white -ml-1">Modern Nostalgia<span className="text-primary">.Club</span></span>
            </Link>
            <p className="text-sm text-white/70 max-w-sm">
              Modern Nostalgia Club is a creative economy designed for artists who want to build sustainable income through music. It combines training, systems, and real-world workflows to help artists move beyond just creating and into operating like modern, independent businesses.
            </p>
            <p className="text-sm text-white/70 max-w-sm mt-3">
              It's not just about making music. It's about building a structure around your creativity so it can actually pay you.
            </p>
          </div>
          
          <nav aria-label="Site navigation" className="md:justify-self-center md:pt-1">
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/reference" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Artist Resources
                </Link>
              </li>
              <li>
                <Link to="/join" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Join the Club
                </Link>
              </li>
              <li>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLScQm7rwO_R-O1Fg_0LR1_A3dyq_aPPB4JRJs6UvN63hBuprMQ/viewform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-primary transition-colors"
                  aria-label="Submit Music (opens in new tab)"
                >
                  Submit Music
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Social links" className="md:justify-self-end md:pt-1">
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/geohworks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-primary transition-colors md:justify-end"
                  aria-label="Follow Modern Nostalgia Club on Twitter/X (opens in new tab)"
                >
                  <Twitter size={16} />
                  <span>Twitter/X</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/modernnostalgia.club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-primary transition-colors md:justify-end"
                  aria-label="Follow Modern Nostalgia Club on Instagram (opens in new tab)"
                >
                  <Instagram size={16} />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.threads.net/@modernnostalgia.club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-primary transition-colors md:justify-end"
                  aria-label="Follow Modern Nostalgia Club on Threads (opens in new tab)"
                >
                  <AtSign size={16} />
                  <span>Threads</span>
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
