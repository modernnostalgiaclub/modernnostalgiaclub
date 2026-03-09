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

          {/* DISCO embed */}
          <div className="rounded-2xl overflow-hidden border border-border/40 shadow-lg mx-auto max-w-[480px]">
            <iframe
              id="disco-playlist-28389354"
              name="disco-playlist-28389354"
              src="https://geohworks.disco.ac/e/p/28389354?download=false&s=vkGsc11Q4t-yDoVG_oa3knlKgXY%3A2zm102ef&artwork=true&color=%234E98FF&theme=dark"
              width="100%"
              height="395"
              allowFullScreen
              frameBorder="0"
              className="disco-embed block"
              title="MN.C Member Tracks"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
