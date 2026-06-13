import { useLocation } from 'react-router-dom';
import { Pause, Play, SkipBack, SkipForward, ListMusic, X, Volume2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import mncLogo from '@/assets/mnc-logo.png';
import { cn } from '@/lib/utils';

// Routes where the persistent player should NOT render (authenticated workspace).
const WORKSPACE_PREFIXES = [
  '/dashboard',
  '/courses',
  '/classroom',
  '/feedback',
  '/studio',
  '/community',
  '/members',
  '/events',
  '/beatlibrary',
  '/ebooks',
  '/profile',
  '/account',
  '/notifications',
  '/admin',
  '/artistresources/30-day-tracker',
  '/artistresources/beat-license',
];

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function PersistentPlayer() {
  const { pathname } = useLocation();
  const player = usePlayer();
  const [queueOpen, setQueueOpen] = useState(false);

  const onWorkspace = WORKSPACE_PREFIXES.some((p) => pathname.startsWith(p));
  if (onWorkspace) return null;
  if (!player.current) return null;

  const cover = player.current.cover_art_url || mncLogo;
  const progressPct =
    player.duration > 0 ? (player.progress / player.duration) * 100 : 0;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        role="region"
        aria-label="Audio player"
      >
        {/* progress bar */}
        <div className="h-1 w-full bg-muted/40">
          <div
            className="h-full bg-primary transition-[width] duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          {/* artwork + meta */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={cover}
              alt=""
              className="w-12 h-12 rounded object-cover flex-shrink-0 bg-muted"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = mncLogo;
              }}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{player.current.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {player.current.artist_name || 'Modern Nostalgia Club'}
              </div>
            </div>
          </div>

          {/* transport */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous"
              onClick={player.prev}
              disabled={player.currentIndex <= 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              aria-label={player.isPlaying ? 'Pause' : 'Play'}
              onClick={player.togglePlay}
              className="rounded-full"
            >
              {player.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next"
              onClick={player.next}
              disabled={player.currentIndex >= player.queue.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* scrubber (md+) */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right">
              {formatTime(player.progress)}
            </span>
            <Slider
              value={[player.progress]}
              max={player.duration || 1}
              step={0.5}
              onValueChange={(v) => player.seek(v[0])}
              className="flex-1"
              aria-label="Seek"
            />
            <span className="text-[10px] tabular-nums text-muted-foreground w-9">
              {formatTime(player.duration)}
            </span>
          </div>

          {/* volume (lg+) */}
          <div className="hidden lg:flex items-center gap-2 w-28">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[player.volume * 100]}
              max={100}
              step={1}
              onValueChange={(v) => player.setVolume(v[0] / 100)}
              aria-label="Volume"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Queue"
            onClick={() => setQueueOpen(true)}
          >
            <ListMusic className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* spacer so page content isn't hidden behind the bar */}
      <div aria-hidden className="h-20" />

      {/* Queue panel */}
      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="font-anton uppercase tracking-wide text-xl">
              Up Next
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {player.queue.map((t, i) => (
              <button
                key={`${t.id}-${i}`}
                onClick={() => {
                  player.jumpTo(i);
                  setQueueOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-muted/60 transition-colors',
                  i === player.currentIndex && 'bg-muted'
                )}
              >
                <img
                  src={t.cover_art_url || mncLogo}
                  alt=""
                  className="w-10 h-10 rounded object-cover flex-shrink-0 bg-muted"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = mncLogo;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-sm truncate',
                      i === player.currentIndex ? 'text-primary font-medium' : ''
                    )}
                  >
                    {t.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.artist_name || 'Modern Nostalgia Club'}
                  </div>
                </div>
                {i === player.currentIndex && player.isPlaying && (
                  <div className="text-xs text-primary uppercase tracking-wider">Now</div>
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
