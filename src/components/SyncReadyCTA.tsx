import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SyncReadyCTA() {
  return (
    <section className="py-20" style={{ background: '#1a1a1a' }}>
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.05] text-primary-foreground">
          Is Your Music Actually Sync-Ready?
        </h2>
        <p className="mt-4 text-sm md:text-base text-primary-foreground/70">
          Most artists think they are. Take this quiz to check and see where you stand.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/sync-quiz">
            Take the Quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
