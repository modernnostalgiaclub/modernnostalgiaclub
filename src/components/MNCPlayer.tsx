import { Music2 } from 'lucide-react';

export function MNCPlayer() {
  return (
    <section className="py-20 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15">
              <Music2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">MN.C Player</p>
              <p className="font-serif font-semibold text-sm">Songs by MN.C Members</p>
            </div>
          </div>

          {/* HRMNY embed */}
          <div className="mx-auto max-w-[500px]">
            <iframe
              src="https://cfb99341-687d-445e-a1bb-8e44c3f5b56a-00-26mzj8kream7k.worf.replit.dev/embed/manager/b2e20348-2813-46d7-996e-e3d3f9fde44d"
              width="100%"
              height="290"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
              title="modernnostalgiaclub - HRMNY"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
