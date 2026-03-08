import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Instagram, Music2, ExternalLink, Download, Mail,
  DollarSign, Youtube, Headphones, Heart, Send,
  ChevronDown, ChevronUp, Play, Users, Loader2
} from 'lucide-react';
import { Footer } from '@/components/Footer';

interface ArtistProfileData {
  user_id: string;
  stage_name: string;
  bio: string | null;
  avatar_url: string | null;
  hero_image_url: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  soundcloud: string | null;
  spotify: string | null;
  discord: string | null;
  linktree: string | null;
  tip_enabled: boolean;
  tip_message: string | null;
  profile_visibility: string;
}

interface PublicTrack {
  id: string;
  user_id: string;
  title: string;
  artist_name: string | null;
  cover_art_url: string | null;
  duration: string | null;
  track_type: string;
  versions: { name: string; version_tag: string; duration: string }[];
  sections: { section_name: string; track_count: number; tracks: { title: string; artist: string; duration: string }[] }[];
  price: number;
  is_email_gated: boolean;
  is_for_licensing: boolean;
  sort_order: number;
  show_add_to_disco_button: boolean;
  disco_url: string | null;
}

const BUDGET_RANGES = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
  'To be negotiated'
];

export default function ArtistProfile() {
  const { username } = useParams<{ username: string }>();
  const searchParams = new URLSearchParams(window.location.search);
  const [artist, setArtist] = useState<ArtistProfileData | null>(null);
  const [tracks, setTracks] = useState<PublicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Tip jar state
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [tippingLoading, setTippingLoading] = useState(false);

  // Email gate modal
  const [emailGateOpen, setEmailGateOpen] = useState(false);
  const [gatingTrack, setGatingTrack] = useState<{ id: string; title: string; versionIndex: number } | null>(null);
  const [gateEmail, setGateEmail] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Expanded tracks
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());

  // Licensing form
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [selectedTrackForLicensing, setSelectedTrackForLicensing] = useState('');
  const [licenseForm, setLicenseForm] = useState({
    supervisor_name: '', supervisor_email: '', company: '',
    project_description: '', budget_range: ''
  });
  const [submittingLicense, setSubmittingLicense] = useState(false);

  useEffect(() => {
    if (!username) return;
    loadArtistProfile();
    // Show tip success toast if coming back from Stripe
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('tip') === 'success') {
      toast.success('Thank you for your support! 🙏');
    }
  }, [username]);

  const loadArtistProfile = async () => {
    setLoading(true);
    try {
      // Use security-definer functions that never expose disco_url
      const [profileResult, tracksResult] = await Promise.all([
        supabase.rpc('get_artist_profile', { p_username: username }),
        supabase.rpc('get_public_artist_tracks', { p_username: username })
      ]);

      if (profileResult.error || !profileResult.data || profileResult.data.length === 0) {
        setNotFound(true);
        return;
      }

      setArtist(profileResult.data[0] as ArtistProfileData);
      setTracks((tracksResult.data || []) as unknown as PublicTrack[]);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (track: PublicTrack, versionIndex = 0) => {
    if (track.is_email_gated) {
      setGatingTrack({ id: track.id, title: track.title, versionIndex });
      setEmailGateOpen(true);
    } else {
      triggerDownload(track.id, versionIndex);
    }
  };

  const triggerDownload = async (trackId: string, versionIndex = 0, email?: string) => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('artist-track-download', {
        body: { track_id: trackId, version_index: versionIndex, email }
      });

      if (error) {
        toast.error(error.message || 'Download failed');
        return;
      }
      if (data?.error) {
        if (data.requires_email) {
          setEmailGateOpen(true);
        } else {
          toast.error(data.error);
        }
        return;
      }

      toast.success('Download started!');
    } catch (err) {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleGatedDownload = async () => {
    if (!gatingTrack || !gateEmail || !gateEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setDownloading(true);
    await triggerDownload(gatingTrack.id, gatingTrack.versionIndex, gateEmail);
    setEmailGateOpen(false);
    setGateEmail('');
    setDownloading(false);
  };

  const handleLicensingSubmit = async () => {
    if (!licenseForm.supervisor_name || !licenseForm.supervisor_email || !licenseForm.project_description) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!artist) return;
    setSubmittingLicense(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-licensing-request', {
        body: {
          artist_user_id: artist.user_id,
          supervisor_name: licenseForm.supervisor_name,
          supervisor_email: licenseForm.supervisor_email,
          company: licenseForm.company || null,
          project_description: licenseForm.project_description,
          track_id: selectedTrackForLicensing || null,
          budget_range: licenseForm.budget_range || null
        }
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Failed to submit request');
        return;
      }
      toast.success('Licensing request sent! The artist will be in touch.');
      setLicensingOpen(false);
      setLicenseForm({ supervisor_name: '', supervisor_email: '', company: '', project_description: '', budget_range: '' });
    } catch {
      toast.error('Failed to submit request');
    } finally {
      setSubmittingLicense(false);
    }
  };

  const toggleTrackExpand = (trackId: string) => {
    setExpandedTracks(prev => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
  };

  const handleSendTip = async () => {
    if (!artist) return;
    const amount = tipAmount ?? parseFloat(customTip);
    if (!amount || amount < 1) {
      toast.error('Please select or enter a tip amount (minimum $1)');
      return;
    }
    setTippingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-tip-payment', {
        body: { artist_user_id: artist.user_id, amount, username },
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Failed to create payment session');
        return;
      }
      window.location.href = data.checkout_url;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setTippingLoading(false);
    }
  };

  const licensingTracks = tracks.filter(t => t.is_for_licensing);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !artist) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Music2 className="w-16 h-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-display">Artist not found</h1>
        <p className="text-muted-foreground">No artist with username <strong>@{username}</strong> exists.</p>
        <Button asChild variant="outline">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const socialLinks = [
    { icon: <Instagram className="w-5 h-5" />, label: 'Instagram', value: artist.instagram, href: artist.instagram ? `https://instagram.com/${artist.instagram.replace('@', '')}` : null },
    { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>, label: 'TikTok', value: artist.tiktok, href: artist.tiktok ? `https://tiktok.com/${artist.tiktok.startsWith('@') ? artist.tiktok : '@' + artist.tiktok}` : null },
    { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, label: 'X', value: artist.twitter, href: artist.twitter ? `https://x.com/${artist.twitter.replace('@', '')}` : null },
    { icon: <Youtube className="w-5 h-5" />, label: 'YouTube', value: artist.youtube, href: artist.youtube },
    { icon: <Headphones className="w-5 h-5" />, label: 'SoundCloud', value: artist.soundcloud, href: artist.soundcloud },
    { icon: <Music2 className="w-5 h-5" />, label: 'Spotify', value: artist.spotify, href: artist.spotify },
    { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.08.11 18.1.128 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>, label: 'Discord', value: artist.discord, href: artist.discord ? `https://discord.gg/${artist.discord}` : null },
    { icon: <ExternalLink className="w-5 h-5" />, label: 'Linktree', value: artist.linktree, href: artist.linktree },
  ].filter(s => s.value);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        {artist.hero_image_url ? (
          <img src={artist.hero_image_url} alt="Artist banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="-mt-16 mb-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background overflow-hidden bg-muted mb-4 shadow-xl">
            {artist.avatar_url ? (
              <img src={artist.avatar_url} alt={artist.stage_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Music2 className="w-10 h-10 text-primary" />
              </div>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display mb-2"
          >
            {artist.stage_name}
          </motion.h1>

          {artist.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm md:text-base max-w-md mb-4 leading-relaxed"
            >
              {artist.bio}
            </motion.p>
          )}

          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mt-2"
            >
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </motion.div>
          )}
        </div>

        {/* Featured Music */}
        {tracks.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4 text-center">Featured Music</h2>
            <div className="space-y-4">
              {tracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-0">
                      {/* Track header */}
                      <div className="flex gap-4 p-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {track.cover_art_url ? (
                            <img src={track.cover_art_url} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <Music2 className="w-6 h-6 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-base font-medium truncate">{track.title}</h3>
                          {track.artist_name && (
                            <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {track.duration && (
                              <span className="text-xs text-muted-foreground">{track.duration}</span>
                            )}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                              {track.track_type}
                            </span>
                            {track.is_email_gated && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Email Gate
                              </span>
                            )}
                            {track.price > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">
                                ${track.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* DISCO Embed Player */}
                      <div className="px-4 pb-3">
                        {/* Note: disco_url is NEVER sent to client — we use a placeholder embed message */}
                        <div className="w-full h-16 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                          <Play className="w-4 h-4" />
                          <span>Listen on DISCO</span>
                        </div>
                      </div>

                      {/* Download / Access buttons */}
                      <div className="px-4 pb-4 flex flex-wrap gap-2">
                        {track.price > 0 ? (
                          <Button size="sm" variant="default" className="gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" />
                            Buy — ${track.price}
                          </Button>
                        ) : track.is_email_gated ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => handleDownload(track)}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Free — Enter Email to Download
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => handleDownload(track)}
                            disabled={downloading}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Free Download
                          </Button>
                        )}

                        {track.track_type === 'single' && track.versions.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-muted-foreground"
                            onClick={() => toggleTrackExpand(track.id)}
                          >
                            {expandedTracks.has(track.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {track.versions.length} versions
                          </Button>
                        )}
                      </div>

                      {/* Expanded versions */}
                      {expandedTracks.has(track.id) && track.versions.length > 0 && (
                        <div className="border-t border-border/30 px-4 py-3 space-y-2 bg-muted/20">
                          {track.versions.map((v, vi) => (
                            <div key={vi} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{v.name}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleDownload(track, vi)}
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Playlist tracks */}
                      {track.track_type === 'playlist' && expandedTracks.has(track.id) && track.sections.map((section, si) => (
                        <div key={si} className="border-t border-border/30 px-4 py-3 bg-muted/20">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{section.section_name}</p>
                          <div className="space-y-1.5">
                            {section.tracks.slice(0, 10).map((t, ti) => (
                              <div key={ti} className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground w-5 text-right shrink-0">{ti + 1}.</span>
                                <span className="flex-1 truncate">{t.title}</span>
                                {t.artist && <span className="text-muted-foreground text-xs truncate shrink-0">{t.artist}</span>}
                              </div>
                            ))}
                            {section.tracks.length > 10 && (
                              <p className="text-xs text-muted-foreground text-center pt-1">+{section.tracks.length - 10} more tracks</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Tip Jar */}
        {artist.tip_enabled && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h2 className="font-display text-xl mb-1">Support {artist.stage_name}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {artist.tip_message || 'Your support means everything. Thank you! 🙏'}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {[3, 5, 10, 20].map((amount) => (
                    <Button
                      key={amount}
                      variant={tipAmount === amount ? 'default' : 'outline'}
                      size="sm"
                      className="min-w-[60px]"
                      onClick={() => { setTipAmount(amount); setCustomTip(''); }}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 max-w-xs mx-auto mt-2 mb-4">
                  <Input
                    placeholder="Custom amount"
                    type="number"
                    min="1"
                    className="text-center"
                    value={customTip}
                    onChange={(e) => { setCustomTip(e.target.value); setTipAmount(null); }}
                  />
                </div>
                <Button
                  variant="maroon"
                  className="gap-1.5 w-full max-w-xs mx-auto"
                  onClick={handleSendTip}
                  disabled={tippingLoading || (!tipAmount && !customTip)}
                >
                  {tippingLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Heart className="w-3.5 h-3.5" />
                  )}
                  {tippingLoading ? 'Redirecting...' : `Support ${artist.stage_name}`}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">Powered by Stripe · Secure checkout</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Music Supervisor Licensing */}
        {licensingTracks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl mb-1">Music Supervisor Licensing</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Looking to license this music for film, TV, or advertising? Get in touch.
                    </p>
                    <Button
                      onClick={() => setLicensingOpen(true)}
                      variant="maroon"
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Contact for Licensing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Footer attribution */}
        <div className="text-center py-8">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Powered by Modern Nostalgia Club
          </Link>
        </div>
      </div>

      {/* Email Gate Modal */}
      <Dialog open={emailGateOpen} onOpenChange={setEmailGateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your email to download</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              {gatingTrack?.title && <span>Downloading: <strong>{gatingTrack.title}</strong><br /></span>}
              Enter your email to get access to this free download.
            </p>
            <div className="space-y-2">
              <Label htmlFor="gate-email">Email Address</Label>
              <Input
                id="gate-email"
                type="email"
                placeholder="you@example.com"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGatedDownload()}
              />
            </div>
            <Button onClick={handleGatedDownload} disabled={downloading} className="w-full gap-2">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Free
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              No spam. Your email is only used to grant access.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Licensing Request Modal */}
      <Dialog open={licensingOpen} onOpenChange={setLicensingOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Music Licensing Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Submit a licensing inquiry to <strong>{artist.stage_name}</strong>. They will reach out to discuss terms.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Your Name *</Label>
                <Input placeholder="Full name" value={licenseForm.supervisor_name}
                  onChange={(e) => setLicenseForm(p => ({ ...p, supervisor_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" placeholder="your@email.com" value={licenseForm.supervisor_email}
                  onChange={(e) => setLicenseForm(p => ({ ...p, supervisor_email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Company / Studio</Label>
              <Input placeholder="Company name (optional)" value={licenseForm.company}
                onChange={(e) => setLicenseForm(p => ({ ...p, company: e.target.value }))} />
            </div>
            {licensingTracks.length > 0 && (
              <div className="space-y-1.5">
                <Label>Track (optional)</Label>
                <Select value={selectedTrackForLicensing} onValueChange={setSelectedTrackForLicensing}>
                  <SelectTrigger><SelectValue placeholder="Select a track" /></SelectTrigger>
                  <SelectContent>
                    {licensingTracks.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Project Description *</Label>
              <Textarea
                placeholder="Describe your project, how you want to use the music, timeline, etc."
                rows={4}
                value={licenseForm.project_description}
                onChange={(e) => setLicenseForm(p => ({ ...p, project_description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Budget Range</Label>
              <Select value={licenseForm.budget_range} onValueChange={(v) => setLicenseForm(p => ({ ...p, budget_range: v }))}>
                <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLicensingSubmit} disabled={submittingLicense} className="w-full gap-2" variant="maroon">
              {submittingLicense ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Licensing Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
