import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header showNav={false} />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto text-center">
            <span className="text-8xl font-display text-amber/30">404</span>
            <h1 className="text-3xl font-display mt-4 mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              This page doesn't exist in the lab.
            </p>
            <Button variant="hero" asChild>
              <Link to="/">
                <Home className="mr-2 w-5 h-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
