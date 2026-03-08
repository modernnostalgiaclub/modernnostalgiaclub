import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Music2, RefreshCw, Download, CheckCircle2, XCircle, Loader2,
  ListMusic, Eye, EyeOff, Plus
} from 'lucide-react';

interface ArtistTrack {
  id: string;
  title: string;
  artist_name: string | null;
  cover_art_url: string | null;
  track_type: string | null;
  versions: unknown[];
  mp3_storage_paths: { version_name: string; storage_path: string }[];
  show_in_landing_player: boolean;
  show_add_to_disco_button: boolean;
  is_published: boolean | null;
  disco_url: string;
  user_id: string;
}

export function AdminArtistTracks() {
  const [tracks, setTracks] = useState<ArtistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  async function fetchTracks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('artist_tracks')
      .select('id, title, artist_name, cover_art_url, track_type, versions, mp3_storage_paths, show_in_landing_player, show_add_to_disco_button, is_published, disco_url, user_id')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load artist tracks');
    } else {
      setTracks((data || []) as unknown as ArtistTrack[]);
    }
    setLoading(false);
  }

  async function handleIngest(trackId: string) {
    setIngestingId(trackId);
    try {
      const { data, error } = await supabase.functions.invoke('ingest-disco-track', {
        body: { track_id: trackId }
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Ingest failed');
        return;
      }

      toast.success(`Ingested ${data.ingested} version(s). ${data.failed > 0 ? `${data.failed} failed.` : ''}`);
      await fetchTracks();
    } catch (err) {
      toast.error('Ingest failed');
    } finally {
      setIngestingId(null);
    }
  }

  async function toggleField(trackId: string, field: 'show_in_landing_player' | 'show_add_to_disco_button', value: boolean) {
    setTogglingId(trackId);
    const { error } = await supabase
      .from('artist_tracks')
      .update({ [field]: value })
      .eq('id', trackId);

    if (error) {
      toast.error('Failed to update');
    } else {
      setTracks(prev => prev.map(t => t.id === trackId ? { ...t, [field]: value } : t));
    }
    setTogglingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Artist Tracks Manager</h2>
          <p className="text-sm text-muted-foreground">Manage tracks from all artists — ingest MP3s, control landing player visibility, and supervisor features.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTracks} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {tracks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No artist tracks yet. Artists can add tracks from their profiles.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tracks.map(track => {
            const versions = Array.isArray(track.versions) ? track.versions as { name?: string; mp3_url?: string }[] : [];
            const storagePaths = Array.isArray(track.mp3_storage_paths) ? track.mp3_storage_paths : [];
            const hasStoredAudio = storagePaths.length > 0;
            const hasMp3Urls = versions.some(v => v.mp3_url);
            const isIngesting = ingestingId === track.id;
            const isToggling = togglingId === track.id;

            return (
              <Card key={track.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    {/* Cover art */}
                    <div className="w-14 h-14 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {track.cover_art_url ? (
                        <img src={track.cover_art_url} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm truncate">{track.title}</h3>
                        {!track.is_published && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                        <Badge variant="outline" className="text-xs capitalize">{track.track_type || 'single'}</Badge>
                      </div>
                      {track.artist_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">{track.artist_name}</p>
                      )}

                      {/* Audio storage status */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {hasStoredAudio ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {storagePaths.length} version{storagePaths.length !== 1 ? 's' : ''} stored
                          </span>
                        ) : hasMp3Urls ? (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Download className="w-3.5 h-3.5" />
                            MP3 URLs found — ready to ingest
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="w-3.5 h-3.5" />
                            No audio stored
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ingest button */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={hasStoredAudio ? 'outline' : 'default'}
                        className="gap-1.5 text-xs h-8"
                        onClick={() => handleIngest(track.id)}
                        disabled={isIngesting}
                        title="Download MP3s from DISCO and store them"
                      >
                        {isIngesting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        {hasStoredAudio ? 'Re-ingest' : 'Ingest MP3s'}
                      </Button>
                    </div>
                  </div>

                  {/* Toggles row */}
                  <div className="border-t border-border/40 px-4 py-3 flex flex-wrap gap-6 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`player-${track.id}`}
                        checked={track.show_in_landing_player}
                        onCheckedChange={v => toggleField(track.id, 'show_in_landing_player', v)}
                        disabled={isToggling}
                      />
                      <Label htmlFor={`player-${track.id}`} className="text-xs flex items-center gap-1 cursor-pointer">
                        {track.show_in_landing_player ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        Show in Landing Player
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`disco-${track.id}`}
                        checked={track.show_add_to_disco_button}
                        onCheckedChange={v => toggleField(track.id, 'show_add_to_disco_button', v)}
                        disabled={isToggling}
                      />
                      <Label htmlFor={`disco-${track.id}`} className="text-xs flex items-center gap-1 cursor-pointer">
                        <ListMusic className="w-3 h-3" />
                        Add to DISCO Button
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
