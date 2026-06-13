import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PlayerTrack = {
  id: string;
  title: string;
  artist_name: string | null;
  cover_art_url: string | null;
};

type PlayerState = {
  queue: PlayerTrack[];
  currentIndex: number;
  current: PlayerTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  jumpTo: (index: number) => void;
  clear: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isLoading, setIsLoading] = useState(false);

  // Lazily create the audio element
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = 'metadata';
      a.volume = volume;
      audioRef.current = a;
    }
    return audioRef.current;
  }, [volume]);

  const loadAndPlay = useCallback(
    async (track: PlayerTrack) => {
      const audio = getAudio();
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-track-stream-url', {
          body: { track_id: track.id },
        });
        if (error || !data?.url) throw error || new Error('No URL');
        audio.src = data.url;
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('Player: failed to load track', e);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    },
    [getAudio]
  );

  const playQueue = useCallback(
    (tracks: PlayerTrack[], startIndex = 0) => {
      if (!tracks.length) return;
      setQueue(tracks);
      setCurrentIndex(startIndex);
      void loadAndPlay(tracks[startIndex]);
    },
    [loadAndPlay]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const next = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= queue.length - 1) return;
    const i = currentIndex + 1;
    setCurrentIndex(i);
    void loadAndPlay(queue[i]);
  }, [currentIndex, queue, loadAndPlay]);

  const prev = useCallback(() => {
    if (currentIndex <= 0) return;
    const i = currentIndex - 1;
    setCurrentIndex(i);
    void loadAndPlay(queue[i]);
  }, [currentIndex, queue, loadAndPlay]);

  const jumpTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= queue.length) return;
      setCurrentIndex(i);
      void loadAndPlay(queue[i]);
    },
    [queue, loadAndPlay]
  );

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(seconds)) audio.currentTime = seconds;
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const clear = useCallback(() => {
    audioRef.current?.pause();
    setQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  // Wire audio events
  useEffect(() => {
    const audio = getAudio();
    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      // auto-advance
      setCurrentIndex((idx) => {
        if (idx >= 0 && idx < queue.length - 1) {
          const nextIdx = idx + 1;
          void loadAndPlay(queue[nextIdx]);
          return nextIdx;
        }
        setIsPlaying(false);
        return idx;
      });
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [getAudio, queue, loadAndPlay]);

  const current = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  const value = useMemo<PlayerState>(
    () => ({
      queue,
      currentIndex,
      current,
      isPlaying,
      progress,
      duration,
      volume,
      isLoading,
      playQueue,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      jumpTo,
      clear,
    }),
    [
      queue,
      currentIndex,
      current,
      isPlaying,
      progress,
      duration,
      volume,
      isLoading,
      playQueue,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      jumpTo,
      clear,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
