import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Music2, Plus, Loader2, Trash2, ExternalLink, Eye,
  AlertCircle, CheckCircle2, DollarSign, Mail, Download, User2,
  Youtube, Headphones, Info, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard } from 'lucide-react';

function StripeConnectSection() {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if ((data as any)?.stripe_onboarding_complete) setConnected(true);
      });
    // Handle return from Stripe onboarding
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe') === 'complete') {
      supabase.from('profiles').update({ stripe_onboarding_complete: true } as any).eq('user_id', user.id)
        .then(() => {
          setConnected(true);
          toast.success('Stripe account connected! You can now receive tips directly.');
        });
    }
  }, [user]);

  const handleConnect = async () => {
    if (!user) return;
    setConnecting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Failed to start Stripe onboarding');
        return;
      }
      window.location.href = data.onboarding_url;
    } catch {
      toast.error('Failed to connect Stripe');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="pt-2 border-t border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Connect Stripe
          </p>
          <p className="text-xs text-muted-foreground">
            {connected
              ? 'Tips go directly to your bank account'
              : 'Connect Stripe to receive tips directly to your bank'}
          </p>
        </div>
        {connected ? (
          <span className="flex items-center gap-1.5 text-xs text-secondary-foreground bg-secondary px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={handleConnect} disabled={connecting} className="gap-2 shrink-0">
            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
            {connecting ? 'Connecting...' : 'Connect Stripe'}
          </Button>
        )}
      </div>
    </div>
  );
}

interface ArtistTrack {
  id: string;
  title: string;
  artist_name: string | null;
  cover_art_url: string | null;
  duration: string | null;
  track_type: string;
  price: number;
  is_email_gated: boolean;
  is_for_licensing: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

interface ProfileExtended {
  username: string | null;
  bio: string | null;
  discord: string | null;
  hero_image_url: string | null;
  youtube: string | null;
  soundcloud: string | null;
  spotify: string | null;
  tip_enabled: boolean;
  tip_message: string | null;
  profile_visibility: string;
}

export function MyMusicTab() {
  const { user, profile } = useAuth();

  // Profile fields
  const [extProfile, setExtProfile] = useState<ProfileExtended>({
    username: null, bio: null, discord: null, hero_image_url: null,
    youtube: null, soundcloud: null, spotify: null,
    tip_enabled: false, tip_message: null, profile_visibility: 'public'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Tracks
  const [tracks, setTracks] = useState<ArtistTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  // DISCO link form
  const [discoUrl, setDiscoUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedMeta, setParsedMeta] = useState<{
    id: string; title: string; artist_name: string | null;
    cover_art_url: string | null; duration: string | null;
    track_type: string; version_count: number; track_count: number;
  } | null>(null);

  // Access settings for new track
  const [accessType, setAccessType] = useState<'free' | 'email_gate' | 'paid'>('free');
  const [paidPrice, setPaidPrice] = useState('');
  const [isForLicensing, setIsForLicensing] = useState(false);
  const [savingTrack, setSavingTrack] = useState(false);

  const USERNAME_REGEX = /^[a-z0-9-]+$/;

  useEffect(() => {
    if (user) {
      loadExtendedProfile();
      loadTracks();
    }
  }, [user]);

  const loadExtendedProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('username, bio, discord, hero_image_url, youtube, soundcloud, spotify, tip_enabled, tip_message, profile_visibility')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setExtProfile({
        username: (data as any).username || null,
        bio: (data as any).bio || null,
        discord: (data as any).discord || null,
        hero_image_url: (data as any).hero_image_url || null,
        youtube: (data as any).youtube || null,
        soundcloud: (data as any).soundcloud || null,
        spotify: (data as any).spotify || null,
        tip_enabled: (data as any).tip_enabled || false,
        tip_message: (data as any).tip_message || null,
        profile_visibility: (data as any).profile_visibility || 'public',
      });
    }
  };

  const loadTracks = async () => {
    if (!user) return;
    setLoadingTracks(true);
    const { data, error } = await supabase
      .from('artist_tracks')
      .select('id, title, artist_name, cover_art_url, duration, track_type, price, is_email_gated, is_for_licensing, is_published, sort_order, created_at')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (!error && data) setTracks(data as ArtistTrack[]);
    setLoadingTracks(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (extProfile.username && !USERNAME_REGEX.test(extProfile.username)) {
      toast.error('Username can only contain lowercase letters, numbers, and hyphens');
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: extProfile.username || null,
        bio: extProfile.bio || null,
        discord: extProfile.discord || null,
        hero_image_url: extProfile.hero_image_url || null,
        youtube: extProfile.youtube || null,
        soundcloud: extProfile.soundcloud || null,
        spotify: extProfile.spotify || null,
        tip_enabled: extProfile.tip_enabled,
        tip_message: extProfile.tip_message || null,
        profile_visibility: extProfile.profile_visibility,
      } as any)
      .eq('user_id', user.id);
    if (error) {
      if (error.code === '23505') {
        toast.error('That username is already taken. Please choose another.');
      } else {
        toast.error('Failed to save profile settings');
      }
    } else {
      toast.success('Artist profile updated!');
    }
    setSavingProfile(false);
  };

  const handleParseDiscoLink = async () => {
    const isDiscoUrl = (() => {
      try { return new URL(discoUrl).hostname.endsWith('disco.ac'); } catch { return false; }
    })();
    if (!discoUrl || !isDiscoUrl) {
      toast.error('Please enter a valid DISCO link (e.g. s.disco.ac/... or artist.disco.ac/e/p/...)');
      return;
    }
    setParsing(true);
    setParsedMeta(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('parse-disco-link', {
        body: { disco_url: discoUrl },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Failed to parse DISCO link');
        return;
      }
      setParsedMeta(data.track);
      toast.success('Track metadata loaded! Review and save below.');
    } catch {
      toast.error('Failed to parse DISCO link. Make sure it is a public share link.');
    } finally {
      setParsing(false);
    }
  };

  const handleAddTrack = async () => {
    if (!parsedMeta || !user) return;
    setSavingTrack(true);
    const price = accessType === 'paid' ? parseFloat(paidPrice) || 0 : 0;
    const isEmailGated = accessType === 'email_gate';
    const { error } = await supabase
      .from('artist_tracks')
      .update({
        price,
        is_email_gated: isEmailGated,
        is_for_licensing: isForLicensing,
      })
      .eq('id', parsedMeta.id)
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to save track settings');
    } else {
      toast.success('Track added to your profile!');
      setDiscoUrl('');
      setParsedMeta(null);
      setAccessType('free');
      setPaidPrice('');
      setIsForLicensing(false);
      loadTracks();
    }
    setSavingTrack(false);
  };

  const handleDeleteTrack = async (trackId: string) => {
    const { error } = await supabase.from('artist_tracks').delete().eq('id', trackId);
    if (error) {
      toast.error('Failed to remove track');
    } else {
      toast.success('Track removed');
      setTracks(prev => prev.filter(t => t.id !== trackId));
    }
  };

  const handleTogglePublish = async (track: ArtistTrack) => {
    const { error } = await supabase
      .from('artist_tracks')
      .update({ is_published: !track.is_published })
      .eq('id', track.id);
    if (!error) {
      setTracks(prev => prev.map(t => t.id === track.id ? { ...t, is_published: !t.is_published } : t));
    }
  };

  const profileUrl = extProfile.username
    ? `${window.location.origin}/artist/${extProfile.username}`
    : null;

  return (
    <div className="space-y-8">

      {/* Username setup banner */}
      {!extProfile.username && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20"
        >
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Set your artist username to unlock your public profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Once set, your profile will be available at <span className="font-mono">/artist/your-username</span>
            </p>
          </div>
        </motion.div>
      )}

      {profileUrl && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm flex-1 truncate font-mono text-muted-foreground">{profileUrl}</span>
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0" asChild>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="w-3.5 h-3.5" />
              View
            </a>
          </Button>
        </div>
      )}

      {/* ── Profile Settings ── */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User2 className="w-5 h-5" />
            Public Profile Settings
          </CardTitle>
          <CardDescription>Customize what visitors see on your artist page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Artist Username</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm shrink-0">@</span>
                <Input
                  id="username"
                  value={extProfile.username || ''}
                  onChange={(e) => setExtProfile(p => ({ ...p, username: e.target.value.toLowerCase() }))}
                  placeholder="your-username"
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord">Discord Handle</Label>
              <Input
                id="discord"
                value={extProfile.discord || ''}
                onChange={(e) => setExtProfile(p => ({ ...p, discord: e.target.value }))}
                placeholder="server-invite-code or @username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={extProfile.youtube || ''}
                onChange={(e) => setExtProfile(p => ({ ...p, youtube: e.target.value }))}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soundcloud">SoundCloud</Label>
              <Input
                id="soundcloud"
                value={extProfile.soundcloud || ''}
                onChange={(e) => setExtProfile(p => ({ ...p, soundcloud: e.target.value }))}
                placeholder="https://soundcloud.com/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spotify">Spotify Artist URL</Label>
              <Input
                id="spotify"
                value={extProfile.spotify || ''}
                onChange={(e) => setExtProfile(p => ({ ...p, spotify: e.target.value }))}
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-image">Hero Banner Image URL</Label>
              <Input
                id="hero-image"
                value={extProfile.hero_image_url || ''}
                onChange={(e) => setExtProfile(p => ({ ...p, hero_image_url: e.target.value }))}
                placeholder="https://your-image-url.com/banner.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Artist Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={extProfile.bio || ''}
              onChange={(e) => setExtProfile(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell visitors about yourself and your music..."
            />
          </div>

          {/* Tip Jar */}
          <div className="pt-2 border-t border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable Tip Jar</p>
                <p className="text-xs text-muted-foreground">Allow fans to support you with tips via Stripe</p>
              </div>
              <Switch
                checked={extProfile.tip_enabled}
                onCheckedChange={(v) => setExtProfile(p => ({ ...p, tip_enabled: v }))}
              />
            </div>
            {extProfile.tip_enabled && (
              <Input
                placeholder='Tip jar message, e.g. "Coffee helps me make more music!"'
                value={extProfile.tip_message || ''}
                onChange={(e) => setExtProfile(p => ({ ...p, tip_message: e.target.value }))}
              />
            )}
          </div>

          {/* Stripe Connect */}
          <StripeConnectSection />

          <Button onClick={handleSaveProfile} disabled={savingProfile} variant="maroon" className="gap-2">
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile Settings
          </Button>
        </CardContent>
      </Card>

      {/* ── Add Music via DISCO ── */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Add Music via DISCO
          </CardTitle>
          <CardDescription>Paste your DISCO share link to feature music on your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Instructions */}
          <div className="rounded-lg bg-muted/50 border border-border/50 p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              How to add music with DISCO
            </p>
            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Go to your <a href="https://app.disco.ac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DISCO account</a></li>
              <li>Open a track or playlist, click the <strong>Share</strong> button</li>
              <li>Copy the public share link (starts with <span className="font-mono text-xs">s.disco.ac/</span>)</li>
              <li>Paste it below and click <strong>Preview Metadata</strong></li>
            </ol>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50 mt-2">
              <strong>Why DISCO?</strong> This platform uses DISCO for professional audio delivery — the same workflow used in real sync licensing. Your audio files stay on DISCO. We never store your audio. DISCO links are kept private and never shown publicly on your profile.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={discoUrl}
              onChange={(e) => setDiscoUrl(e.target.value)}
              placeholder="https://s.disco.ac/xxxxxxxxxx"
              className="font-mono text-sm"
            />
            <Button onClick={handleParseDiscoLink} disabled={parsing} variant="outline" className="shrink-0 gap-2">
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {parsing ? 'Parsing...' : 'Preview'}
            </Button>
          </div>

          {/* Parsed metadata preview */}
          <AnimatePresence>
            {parsedMeta && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs text-primary font-medium uppercase tracking-wide mb-3">Metadata Preview</p>
                  <div className="flex gap-4 items-start">
                    {parsedMeta.cover_art_url && (
                      <img src={parsedMeta.cover_art_url} alt="cover" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="space-y-1">
                      <p className="font-display font-medium">{parsedMeta.title}</p>
                      {parsedMeta.artist_name && <p className="text-sm text-muted-foreground">{parsedMeta.artist_name}</p>}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary" className="capitalize">{parsedMeta.track_type}</Badge>
                        {parsedMeta.duration && <Badge variant="outline">{parsedMeta.duration}</Badge>}
                        {parsedMeta.version_count > 0 && <Badge variant="outline">{parsedMeta.version_count} versions</Badge>}
                        {parsedMeta.track_count > 0 && <Badge variant="outline">{parsedMeta.track_count} tracks</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access Settings */}
                <div className="space-y-3">
                  <Label>Access Settings</Label>
                  <RadioGroup value={accessType} onValueChange={(v) => setAccessType(v as any)} className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="free" id="free" />
                      <label htmlFor="free" className="flex items-center gap-2 cursor-pointer text-sm">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Free Download</p>
                          <p className="text-xs text-muted-foreground">Anyone can download without signing up</p>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="email_gate" id="email_gate" />
                      <label htmlFor="email_gate" className="flex items-center gap-2 cursor-pointer text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email Gate</p>
                          <p className="text-xs text-muted-foreground">Visitor enters email to download — you capture the lead</p>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="paid" id="paid" />
                      <label htmlFor="paid" className="flex items-center gap-2 cursor-pointer text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Paid Download</p>
                          <p className="text-xs text-muted-foreground">Set a price — Stripe required (coming soon)</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {accessType === 'paid' && (
                    <div className="flex items-center gap-2 pl-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0.99"
                        step="0.01"
                        placeholder="9.99"
                        value={paidPrice}
                        onChange={(e) => setPaidPrice(e.target.value)}
                        className="max-w-[120px]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                  <Checkbox
                    id="for-licensing"
                    checked={isForLicensing}
                    onCheckedChange={(v) => setIsForLicensing(v === true)}
                  />
                  <label htmlFor="for-licensing" className="text-sm cursor-pointer">
                    <p className="font-medium">Available for Sync Licensing</p>
                    <p className="text-xs text-muted-foreground">
                      Adds this track to the Music Supervisor section on your profile, where industry professionals can submit licensing requests
                    </p>
                  </label>
                </div>

                <Button onClick={handleAddTrack} disabled={savingTrack} variant="maroon" className="gap-2">
                  {savingTrack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add to Profile
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Your Tracks ── */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Your Tracks</CardTitle>
          <CardDescription>{tracks.length} track{tracks.length !== 1 ? 's' : ''} on your profile</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTracks ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tracks yet. Paste a DISCO link above to add your first track.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                  {track.cover_art_url ? (
                    <img src={track.cover_art_url} alt={track.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Music2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{track.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">{track.track_type}</Badge>
                      {track.is_email_gated && <Badge variant="outline" className="text-xs gap-1"><Mail className="w-2.5 h-2.5" />Email Gate</Badge>}
                      {track.price > 0 && <Badge variant="outline" className="text-xs gap-1"><DollarSign className="w-2.5 h-2.5" />${track.price}</Badge>}
                      {track.price === 0 && !track.is_email_gated && <Badge variant="outline" className="text-xs">Free</Badge>}
                      {track.is_for_licensing && <Badge variant="secondary" className="text-xs">Licensing</Badge>}
                      {!track.is_published && <Badge variant="destructive" className="text-xs">Unpublished</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleTogglePublish(track)}
                      title={track.is_published ? 'Unpublish' : 'Publish'}
                    >
                      <Eye className={`w-4 h-4 ${track.is_published ? 'text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove track?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove <strong>{track.title}</strong> from your profile. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteTrack(track.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
