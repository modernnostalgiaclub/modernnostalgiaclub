import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Loader2,
  Save,
  Music,
  Instagram,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AtSign,
  FileText,
  Share2,
  Eye,
  Copy,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { profileFormSchema, getValidationErrors, type ProfileFormData as ValidatedProfileData } from '@/lib/formValidation';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

const PRO_OPTIONS = [
  'ASCAP', 'BMI', 'SESAC', 'GMR', 'SOCAN', 'PRS', 'APRA AMCOS', 'GEMA', 'SACEM', 'JASRAC', 'Other'
];

interface ProfileFormData {
  full_name: string;
  stage_name: string;
  username: string;
  bio: string;
  pro: string;
  has_publishing_account: boolean;
  publishing_company: string;
  writer_ipi: string;
  publisher_ipi: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  spotify: string;
  soundcloud: string;
  discord: string;
  linktree: string;
}

const STEPS = [
  { id: 'identity', label: 'Identity', icon: <User className="w-4 h-4" />, description: 'Stage name & username' },
  { id: 'bio', label: 'Bio', icon: <FileText className="w-4 h-4" />, description: 'Tell your story' },
  { id: 'social', label: 'Socials', icon: <Share2 className="w-4 h-4" />, description: 'Link your accounts' },
  { id: 'done', label: 'Done', icon: <Sparkles className="w-4 h-4" />, description: 'Profile ready' },
];

function usernameSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
}

function ProfileSetupWizard({
  formData,
  setFormData,
  onComplete,
  isSaving,
}: {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  onComplete: () => void;
  isSaving: boolean;
}) {
  const [step, setStep] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const profileUrl = formData.username
    ? `https://modernnostalgia.club/artist/${formData.username}`
    : null;

  const progressPct = ((step) / (STEPS.length - 1)) * 100;

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleUsernameChange = (val: string) => {
    setFormData(prev => ({ ...prev, username: usernameSlug(val) }));
  };

  const copyLink = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Card variant="elevated" className="border-primary/20 overflow-hidden">
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-0.5">Artist Profile Setup</p>
            <h2 className="font-display text-xl">{STEPS[step].description}</h2>
          </div>
          <span className="text-xs text-muted-foreground">{step + 1} / {STEPS.length}</span>
        </div>
        <Progress value={progressPct} className="h-1.5 mb-5" />
        <div className="flex gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                i === step
                  ? 'bg-primary text-primary-foreground'
                  : i < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="stage_name" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Stage Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stage_name"
                  value={formData.stage_name}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, stage_name: e.target.value }));
                    if (!formData.username) handleUsernameChange(e.target.value);
                  }}
                  placeholder="The name the world knows you by"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">This is your public artist name shown on your profile and across the platform.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-primary" />
                  Profile Username <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-0">
                  <span className="h-10 px-3 flex items-center bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground text-sm shrink-0">/artist/</span>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={e => handleUsernameChange(e.target.value)}
                    placeholder="your-name"
                    className="rounded-l-none"
                  />
                </div>
                {formData.username && (
                  <p className="text-xs text-primary font-mono">modernnostalgia.club/artist/{formData.username}</p>
                )}
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens only. This is your permanent link-in-bio URL.</p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="bio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Artist Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell music supervisors and fans who you are — your sound, your story, what makes your music worth listening to..."
                  rows={5}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Legal Name (Private)</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Your legal name (same as your PRO registration)"
                />
                <p className="text-xs text-muted-foreground">Not shown publicly. Used for internal music industry records.</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="social" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-sm text-muted-foreground">Add your platforms — these appear on your public artist profile and help fans and supervisors find your work.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'instagram', label: 'Instagram', placeholder: '@yourusername', icon: <Instagram className="w-4 h-4" /> },
                  { id: 'twitter', label: 'X (Twitter)', placeholder: '@yourusername', icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  )},
                  { id: 'tiktok', label: 'TikTok', placeholder: '@yourusername', icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  )},
                  { id: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@channel', icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  )},
                  { id: 'spotify', label: 'Spotify', placeholder: 'open.spotify.com/artist/...', icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  )},
                  { id: 'soundcloud', label: 'SoundCloud', placeholder: 'soundcloud.com/yourname', icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M1.175 12.225c-.015.015-.02.039-.02.073.005.6.015.924.03 1.014.035.235.105.472.202.68.163.374.457.686.838.885.375.2.82.3 1.285.3H20.49c.21 0 .417-.05.6-.15.185-.1.33-.24.435-.42.1-.18.15-.38.15-.59s-.05-.41-.15-.59c-.105-.18-.25-.32-.435-.42-.183-.1-.39-.15-.6-.15H4.48c-.027 0-.047.01-.06.025-.014.016-.02.035-.02.06 0 .025.006.044.02.06.013.016.033.025.06.025H20.49c.15 0 .294.037.422.107.127.07.228.17.3.298.07.127.107.27.107.422s-.037.295-.107.422c-.072.127-.173.227-.3.298-.128.07-.272.107-.422.107H4.51c-.61 0-1.193-.145-1.687-.42-.494-.274-.87-.665-1.09-1.124-.11-.227-.173-.466-.196-.71C1.523 12.96 1.52 12.73 1.52 12.5c0-.205.003-.41.017-.59.003-.04-.005-.075-.022-.103-.017-.028-.043-.044-.073-.044-.03 0-.056.016-.073.044-.017.028-.025.063-.022.103.015.2.018.41.018.59 0 .225.003.46.016.668zm0 0"/></svg>
                  )},
                  { id: 'discord', label: 'Discord', placeholder: 'discord.gg/invite or username', icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.112 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  )},
                  { id: 'linktree', label: 'Linktree', placeholder: 'linktr.ee/yourusername', icon: <LinkIcon className="w-4 h-4" /> },
                ].map(({ id, label, placeholder, icon }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="flex items-center gap-2 text-sm">{icon}{label}</Label>
                    <Input
                      id={id}
                      value={(formData as any)[id]}
                      onChange={e => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-2xl mb-2">Profile Ready!</h3>
                <p className="text-muted-foreground text-sm">
                  {formData.username ? "Your artist profile is live and shareable." : "Save your profile to make it live."}
                </p>
              </div>

              {profileUrl && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Your link-in-bio URL</p>
                  <p className="font-mono text-sm text-primary break-all">{profileUrl}</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
                      {linkCopied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={`/artist/${formData.username}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                        Preview
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={onComplete} disabled={isSaving} variant="maroon" size="lg" className="w-full gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < STEPS.length - 1 && (
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={prev} disabled={step === 0} className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button variant="maroon" size="sm" onClick={next} className="gap-1.5">
              {step === STEPS.length - 2 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        {step === STEPS.length - 1 && step > 0 && (
          <div className="flex justify-start mt-4 pt-4 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={prev} className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
      setAvatarUrl(p.avatar_url || null);
    }
export default function ArtistProfileSettings() {
  const { user, profile, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '', stage_name: '', username: '', bio: '',
    pro: '', has_publishing_account: false, publishing_company: '',
    writer_ipi: '', publisher_ipi: '',
    instagram: '', twitter: '', tiktok: '', youtube: '',
    spotify: '', soundcloud: '', discord: '', linktree: ''
  });

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setFormData({
        full_name: p.full_name || '', stage_name: p.stage_name || '',
        username: p.username || '', bio: p.bio || '',
        pro: p.pro || '', has_publishing_account: p.has_publishing_account || false,
        publishing_company: p.publishing_company || '',
        writer_ipi: p.writer_ipi || '', publisher_ipi: p.publisher_ipi || '',
        instagram: p.instagram || '', twitter: p.twitter || '',
        tiktok: p.tiktok || '', youtube: p.youtube || '',
        spotify: p.spotify || '', soundcloud: p.soundcloud || '',
        discord: p.discord || '', linktree: p.linktree || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    const result = profileFormSchema.safeParse(formData);
    if (!result.success) {
      const errors = getValidationErrors<ValidatedProfileData>(result);
      const firstError = result.error.issues[0]?.message;
      if (firstError) toast.error(firstError);
      return;
    }
    setIsSaving(true);
    try {
      const validData = result.data;
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: validData.full_name || null,
          stage_name: validData.stage_name || null,
          username: formData.username || null,
          bio: formData.bio || null,
          pro: validData.pro || null,
          has_publishing_account: validData.has_publishing_account,
          publishing_company: validData.has_publishing_account ? validData.publishing_company || null : null,
          writer_ipi: validData.has_publishing_account ? validData.writer_ipi || null : null,
          publisher_ipi: validData.has_publishing_account ? validData.publisher_ipi || null : null,
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          tiktok: formData.tiktok || null,
          youtube: formData.youtube || null,
          spotify: formData.spotify || null,
          soundcloud: formData.soundcloud || null,
          discord: formData.discord || null,
          linktree: formData.linktree || null
        } as any)
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Profile saved!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!loading && !user) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background studio-grain flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto">
            <motion.div variants={fadeIn} className="mb-8">
              <SectionLabel className="mb-4">Profile</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-anton uppercase mb-4">Artist Profile</h1>
              <p className="text-muted-foreground">Manage your public artist identity, bio, social links, and publishing info.</p>
            </motion.div>

            <div className="space-y-6">
              <motion.div variants={fadeIn}>
                <ProfileSetupWizard
                  formData={formData}
                  setFormData={setFormData}
                  onComplete={handleSaveProfile}
                  isSaving={isSaving}
                />
              </motion.div>

              {/* Publishing & PRO Information */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Music className="w-4 h-4" />
                      Publishing & PRO Information
                    </CardTitle>
                    <CardDescription>Music industry details for licensing and royalty tracking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="pro">Performing Rights Organization (PRO)</Label>
                      <Select value={formData.pro} onValueChange={v => setFormData(prev => ({ ...prev, pro: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select your PRO" /></SelectTrigger>
                        <SelectContent>
                          {PRO_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="has_publishing"
                        checked={formData.has_publishing_account}
                        onCheckedChange={c => setFormData(prev => ({ ...prev, has_publishing_account: c === true }))}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="has_publishing" className="cursor-pointer">I have a Publishing Account</Label>
                        <p className="text-xs text-muted-foreground">Check if you've registered a publishing company</p>
                      </div>
                    </div>

                    {formData.has_publishing_account && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pl-6 border-l-2 border-primary/30">
                        <div className="space-y-2">
                          <Label htmlFor="publishing_company">Publishing Company Name</Label>
                          <Input id="publishing_company" value={formData.publishing_company} onChange={e => setFormData(prev => ({ ...prev, publishing_company: e.target.value }))} placeholder="Your publishing company" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="writer_ipi">Writer IPI</Label>
                            <Input id="writer_ipi" value={formData.writer_ipi} onChange={e => setFormData(prev => ({ ...prev, writer_ipi: e.target.value }))} placeholder="e.g., 00123456789" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="publisher_ipi">Publisher IPI</Label>
                            <Input id="publisher_ipi" value={formData.publisher_ipi} onChange={e => setFormData(prev => ({ ...prev, publisher_ipi: e.target.value }))} placeholder="e.g., 00987654321" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="pt-2">
                      <Button onClick={handleSaveProfile} disabled={isSaving} variant="maroon" className="gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
