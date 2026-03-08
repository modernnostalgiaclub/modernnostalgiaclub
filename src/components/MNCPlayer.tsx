import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Music2, Loader2, ExternalLink
} from 'lucide-react';

interface PlayerTrack {
  id: string;
  title: string;
  artist_name: string | null;
  cover_art_url: string | null;
  duration: string | null;
  track_type: string | null;
  versions: { name: string; version_tag: string }[];
  mp3_storage_paths: { version_name: string; storage_path: string }[];
  sort_order: number;
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MNCPlayer() {
  const [tracks, setTracks] = useState<PlayerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  async function loadTracks() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_landing_player_tracks');
      if (!error && data) {
        setTracks(data as unknown as PlayerTrack[]);
      }
    } catch {
      // Silently fail — no tracks available
    }
    setLoading(false);
  }

  const fetchAudio = useCallback(async (track: PlayerTrack, versionIndex = 0) => {
    setLoadingTrack(true);
    setIsPlaying(false);

    // Revoke previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setAudioUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('artist-track-download', {
        body: { track_id: track.id, version_index: versionIndex }
      });

      if (error) return;

      // The function returns a binary response — convert to blob URL
      if (data instanceof Blob) {
        const url = URL.createObjectURL(data);
        objectUrlRef.current = url;
        setAudioUrl(url);
      }
    } catch {
      // fail silently
    } finally {
      setLoadingTrack(false);
    }
  }, []);

  const currentTrack = tracks[currentIndex] ?? null;

  const handlePlay = useCallback(async () => {
    if (!currentTrack) return;

    if (!audioUrl && !loadingTrack) {
      await fetchAudio(currentTrack);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
    }
  }, [currentTrack, audioUrl, loadingTrack, isPlaying, fetchAudio]);

  // Auto-play once audio URL is set
  useEffect(() => {
    if (audioUrl && audioRef.current && !loadingTrack) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [audioUrl, loadingTrack]);

  const handlePrev = () => {
    const newIdx = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentIndex(newIdx);
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    const newIdx = (currentIndex + 1) % tracks.length;
    setCurrentIndex(newIdx);
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current && isFinite(duration) && duration > 0) {
      audioRef.current.currentTime = (val[0] / 100) * duration;
    }
  };

  const handleVolumeChange = (val: number[]) => {
    const v = val[0] / 100;
    setVolume(v);
    setIsMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  // Don't render if no tracks
  if (!loading && tracks.length === 0) return null;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="py-20 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Hidden audio element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
              onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
              onEnded={handleNext}
              onWaiting={() => setIsBuffering(true)}
              onCanPlay={() => setIsBuffering(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              volume={isMuted ? 0 : volume}
            />
          )}

          {loading ? (
            <div className="rounded-2xl overflow-hidden border border-border/40 h-48 flex items-center justify-center"
              style={{ background: 'hsl(222 47% 6%)' }}>
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-border/40"
              style={{ background: 'hsl(222 47% 6%)', boxShadow: '0 0 40px hsl(var(--primary) / 0.08)' }}>

              {/* Header bar */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30"
                style={{ background: 'hsl(222 47% 4%)' }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15">
                  <Music2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">MN.C Player</p>
                  <p className="font-serif font-semibold text-sm truncate">Songs by MN.C Members</p>
                </div>
                {/* Animated bars */}
                <div className="flex items-end gap-0.5 h-5">
                  {[1, 2, 3, 4].map(n => (
                    <span
                      key={n}
                      className="w-1 rounded-full bg-primary"
                      style={{
                        height: isPlaying ? `${[60, 100, 40, 80][n - 1]}%` : '30%',
                        transition: 'height 0.3s ease',
                        animation: isPlaying ? `bounce ${0.6 + n * 0.1}s ease-in-out infinite alternate` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Now playing */}
              <AnimatePresence mode="wait">
                {currentTrack && (
                  <motion.div
                    key={currentTrack.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    {/* Cover art */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      {currentTrack.cover_art_url ? (
                        <img src={currentTrack.cover_art_url} alt={currentTrack.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <Music2 className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-sm truncate">{currentTrack.title}</h3>
                      {currentTrack.artist_name && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{currentTrack.artist_name}</p>
                      )}
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
                        <Slider
                          value={[progressPct]}
                          onValueChange={handleSeek}
                          min={0}
                          max={100}
                          step={0.1}
                          className="flex-1 h-1"
                        />
                        <span className="text-xs text-muted-foreground w-8 tabular-nums">{formatTime(duration)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center justify-between px-5 pb-4">
                {/* Playback */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handlePrev}
                    disabled={tracks.length <= 1}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                    onClick={handlePlay}
                    disabled={loadingTrack || isBuffering || !currentTrack}
                  >
                    {loadingTrack || isBuffering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleNext}
                    disabled={tracks.length <= 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    min={0}
                    max={100}
                    className="w-20 h-1"
                  />
                </div>
              </div>

              {/* Track list */}
              {tracks.length > 1 && (
                <div className="border-t border-border/30 px-5 py-3"
                  style={{ background: 'hsl(222 47% 4%)' }}>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {tracks.map((t, i) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCurrentIndex(i);
                          setAudioUrl(null);
                          setCurrentTime(0);
                          setDuration(0);
                          setIsPlaying(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 ${
                          i === currentIndex
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        {t.cover_art_url ? (
                          <img src={t.cover_art_url} alt={t.title} className="w-5 h-5 rounded object-cover shrink-0" />
                        ) : (
                          <Music2 className="w-4 h-4 shrink-0" />
                        )}
                        <span className="max-w-[100px] truncate">{t.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
