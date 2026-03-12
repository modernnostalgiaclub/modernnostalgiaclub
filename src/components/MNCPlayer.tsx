import { Music2 } from 'lucide-react';

export function MNCPlayer() {
  return (
    <section className="py-20 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="max-w-[800px] mx-auto">

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
          <div className="mx-auto max-w-[480px]">
            <iframe
              id="disco-playlist-28389354"
              name="disco-playlist-28389354"
              src="https://geohworks.disco.ac/e/p/28389354?download=false&s=LvCZEdEzXNDzoMJzQf9NBb-6Q0s%3AL0Elg6Ls&artwork=true&color=%234E98FF&theme=dark"
              width="100%"
              height="800"
              frameBorder="0"
              allowFullScreen
              className="disco-embed"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
              title="modernnostalgiaclub - DISCO Playlist"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
