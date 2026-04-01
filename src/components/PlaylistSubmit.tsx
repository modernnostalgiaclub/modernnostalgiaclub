import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export function PlaylistSubmit() {
  return (
    <section className="py-20" style={{ background: '#ffffff' }}>
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-foreground uppercase tracking-tight leading-[1.05]">
          Submit to Our Playlists
        </h2>
        <p className="mt-4 text-sm md:text-base text-muted-foreground">
          Submit your music for consideration in our curated playlists, which are frequently reviewed by screenwriters, directors, music supervisors, and editors.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/studio">
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Link>
        </Button>
      </div>
    </section>
  );
}
