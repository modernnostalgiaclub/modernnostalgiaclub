import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import {
  ExternalLink, Send, CheckCircle, Download, Target,
  ShoppingBag, BookOpen, Music, Instagram, Clock,
  ChevronDown, ChevronUp, Mail, UserPlus, LogIn,
  Youtube, Twitter
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import logoCream from '@/assets/logo-cream.png';

const SOCIAL_LINKS = [
  { label: 'Instagram', icon: Instagram, url: 'https://instagram.com/modernnostalgia.club' },
  { label: 'Twitter / X', icon: Twitter, url: 'https://x.com/modernnostalgiaclub' },
  { label: 'YouTube', icon: Youtube, url: 'https://youtube.com/@geohworks' },
  { label: 'Spotify', icon: Music, url: 'https://open.spotify.com/artist/geohworks' },
  { label: 'DISCO', icon: ExternalLink, url: 'https://geohworks.disco.ac' },
] as const;

const FUNNEL_LINKS = [
  {
    label: 'Free Artist Survival Guide',
    sublabel: 'Resources for independent artists',
    icon: Download,
    to: '/free-guide',
    external: false,
  },
  {
    label: 'Are You Sync Ready?',
    sublabel: 'Take the 5-min quiz',
    icon: Target,
    to: '/sync-quiz',
    external: false,
  },
  {
    label: 'The Store',
    sublabel: 'Beats, tools & templates',
    icon: ShoppingBag,
    to: '/store',
    external: false,
  },
  {
    label: 'Artist Resources',
    sublabel: 'Reference shelf & guides',
    icon: BookOpen,
    to: '/reference',
    external: false,
  },
  {
    label: 'Listen on DISCO',
    sublabel: 'Full catalog — streaming & licensing',
    icon: Music,
    to: 'https://geohworks.disco.ac',
    external: true,
  },
] as const;

const roleOptions = [
  { value: 'Artist', label: 'Artist' },
  { value: 'Brand', label: 'Brand' },
  { value: 'Music Tech', label: 'Music Tech' },
  { value: 'Publisher / Sync', label: 'Publisher / Sync' },
  { value: 'Other', label: 'Other' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function Connect() {
  const navigate = useNavigate();

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const newsletterAntiSpam = useAntiSpam({ storageKey: 'newsletter_cooldown', cooldownMs: 30000 });

  // Contact form
  const [contactOpen, setContactOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', role: '', notes: '',
  });
  const contactAntiSpam = useAntiSpam({ storageKey: 'connect_cooldown', cooldownMs: 30000 });

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    const spamError = newsletterAntiSpam.validate();
    if (spamError) { toast.error(spamError); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) { toast.error('Please enter a valid email'); return; }

    setNewsletterSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('capture-download-email', {
        body: {
          email: newsletterEmail.trim().toLowerCase(),
          trackId: 'newsletter',
          trackTitle: 'Newsletter Signup',
          ...newsletterAntiSpam.getSubmissionData(),
        },
      });
      if (error) throw error;
      newsletterAntiSpam.triggerCooldown();
      setNewsletterDone(true);
      toast.success("You're on the list!");
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setNewsletterSubmitting(false);
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const spamError = contactAntiSpam.validate();
    if (spamError) { toast.error(spamError); return; }
    if (!formData.name.trim() || !formData.email.trim()) { toast.error('Name and email are required'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { toast.error('Please enter a valid email'); return; }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('networking-contact-submit', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company.trim() || null,
          role: formData.role || 'Other',
          notes: formData.notes.trim() || null,
          event_tag: 'NAMM',
          ...contactAntiSpam.getSubmissionData(),
        },
      });
      setSubmitting(false);
      if (error) {
        if (error.message?.includes('429') || data?.error?.includes('Too many')) {
          toast.error('Too many submissions. Please try again later.');
        } else {
          toast.error('Something went wrong. Please try again.');
        }
        return;
      }
      contactAntiSpam.triggerCooldown();
      setSubmitted(true);
      toast.success("You're connected!");
    } catch {
      setSubmitting(false);
      toast.error('Something went wrong. Please try again.');
    }
  }

  const contactDisabled = submitting || contactAntiSpam.isInCooldown;
  const newsletterDisabled = newsletterSubmitting || newsletterAntiSpam.isInCooldown;

  return (
    <>
      <Helmet>
        <title>Connect | Modern Nostalgia Club</title>
        <meta name="description" content="Stay connected with Modern Nostalgia Club. Infrastructure for independent artists and creative economies." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <div className="min-h-screen bg-dark text-cream">
        <div className="max-w-md mx-auto px-5 py-10 space-y-8">

          {/* ── Header ── */}
          <motion.header
            className="text-center space-y-1"
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <img src={logoCream} alt="Modern Nostalgia Club" className="h-20 mx-auto mb-3" />
            <p className="text-cream font-semibold text-lg tracking-wide">Ge Oh</p>
            <p className="text-cream/70 text-sm tracking-wide">modernnostalgia.club</p>
            <p className="text-cream/50 text-xs tracking-wide italic">
              Infrastructure for independent artists and creative economies.
            </p>
          </motion.header>

          {/* ── Social Icons ── */}
          <motion.div
            className="flex items-center justify-center gap-4"
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            {SOCIAL_LINKS.map(({ label, icon: Icon, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-cream/5 hover:bg-cream/15 border border-cream/10 hover:border-maroon transition-all duration-200 text-cream/60 hover:text-cream"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </motion.div>

          {/* ── Funnel Links ── */}
          <motion.div
            className="space-y-2"
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.14 }}
          >
            {FUNNEL_LINKS.map(({ label, sublabel, icon: Icon, to, external }, i) => {
              const inner = (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-maroon/15">
                    <Icon className="w-4 h-4 text-maroon" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-cream text-sm font-semibold leading-tight">{label}</p>
                    <p className="text-cream/50 text-xs leading-tight mt-0.5">{sublabel}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-cream/30 flex-shrink-0" />
                </div>
              );

              const cls =
                'flex items-center px-4 py-3.5 bg-cream/5 hover:bg-cream/10 border border-cream/10 hover:border-cream/25 rounded-xl transition-all duration-200 cursor-pointer w-full';

              return external ? (
                <motion.a
                  key={label}
                  href={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.04 }}
                >
                  {inner}
                </motion.a>
              ) : (
                <motion.div
                  key={label}
                  className={cls}
                  onClick={() => navigate(to)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.04 }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(to)}
                >
                  {inner}
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Join the Club ── */}
          <motion.div
            className="space-y-2"
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.32 }}
          >
            <Button
              className="w-full bg-maroon hover:bg-maroon/90 text-cream font-semibold py-6 text-base rounded-xl"
              onClick={() => navigate('/login?tab=signup')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join the Club — It's Free
            </Button>
            <button
              className="w-full text-cream/40 hover:text-cream/70 text-sm transition-colors flex items-center justify-center gap-1.5 py-1"
              onClick={() => navigate('/login')}
            >
              <LogIn className="w-3.5 h-3.5" />
              Already a member? Log in
            </button>
          </motion.div>

          {/* ── Newsletter ── */}
          <motion.div
            className="bg-cream/5 border border-cream/10 rounded-2xl p-5"
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.38 }}
          >
            {newsletterDone ? (
              <div className="text-center py-2">
                <CheckCircle className="w-8 h-8 text-maroon mx-auto mb-2" />
                <p className="text-cream font-semibold text-sm">You're on the list.</p>
                <p className="text-cream/50 text-xs mt-1">Expect real stuff — no fluff.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-maroon flex-shrink-0" />
                  <p className="text-cream font-semibold text-sm">Stay in the loop.</p>
                </div>
                <p className="text-cream/50 text-xs mb-4 leading-relaxed">
                  Strategy, tools, and opportunities for independent artists. No spam.
                </p>
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  {/* Honeypot */}
                  <input {...newsletterAntiSpam.honeypotProps} />
                  <Input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-dark border-cream/20 text-cream placeholder:text-cream/30 focus:border-maroon h-10 text-sm"
                    required
                    disabled={newsletterDisabled}
                  />
                  <Button
                    type="submit"
                    disabled={newsletterDisabled}
                    className="bg-maroon hover:bg-maroon/90 text-cream px-4 h-10 flex-shrink-0"
                  >
                    {newsletterAntiSpam.isInCooldown ? (
                      <><Clock className="w-3.5 h-3.5 mr-1" />{newsletterAntiSpam.cooldownRemaining}s</>
                    ) : newsletterSubmitting ? '...' : (
                      <><Send className="w-3.5 h-3.5 mr-1" />Subscribe</>
                    )}
                  </Button>
                </form>
              </>
            )}
          </motion.div>

          {/* ── Collapsible Contact Form ── */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.44 }}
          >
            <div className="border-t border-cream/10 pt-6">
              <button
                onClick={() => setContactOpen(!contactOpen)}
                className="w-full flex items-center justify-between text-cream/50 hover:text-cream/80 transition-colors py-1 group"
              >
                <span className="text-sm font-medium">Met me in person?</span>
                {contactOpen
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />
                }
              </button>

              <AnimatePresence>
                {contactOpen && (
                  <motion.div
                    key="contact-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      {submitted ? (
                        <div className="text-center py-8 px-4 bg-cream/5 rounded-2xl border border-cream/10">
                          <CheckCircle className="w-12 h-12 text-maroon mx-auto mb-3" />
                          <h2 className="font-display text-xl mb-1">You're connected.</h2>
                          <p className="text-cream/60 text-sm mb-5">I'll follow up properly.</p>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSubmitted(false);
                              setFormData({ name: '', email: '', company: '', role: '', notes: '' });
                            }}
                            className="text-cream/40 hover:text-cream text-sm"
                          >
                            Connect someone else
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-cream/5 rounded-2xl border border-cream/10 p-5">
                          <p className="text-cream/60 text-sm text-center mb-5">
                            Drop your info — I'll follow up properly.
                          </p>
                          <form onSubmit={handleContactSubmit} className="space-y-3.5">
                            <input {...contactAntiSpam.honeypotProps} />

                            <div className="space-y-1.5">
                              <Label htmlFor="name" className="text-cream/70 text-xs">Name *</Label>
                              <Input id="name" value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                className="bg-dark border-cream/20 text-cream placeholder:text-cream/30 focus:border-maroon h-9 text-sm"
                                required disabled={contactDisabled}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="c-email" className="text-cream/70 text-xs">Email *</Label>
                              <Input id="c-email" type="email" value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@email.com"
                                className="bg-dark border-cream/20 text-cream placeholder:text-cream/30 focus:border-maroon h-9 text-sm"
                                required disabled={contactDisabled}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="company" className="text-cream/70 text-xs">Company / Artist Name</Label>
                              <Input id="company" value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Optional"
                                className="bg-dark border-cream/20 text-cream placeholder:text-cream/30 focus:border-maroon h-9 text-sm"
                                disabled={contactDisabled}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="role" className="text-cream/70 text-xs">Role</Label>
                              <Select value={formData.role}
                                onValueChange={(v) => setFormData({ ...formData, role: v })}
                                disabled={contactDisabled}
                              >
                                <SelectTrigger className="bg-dark border-cream/20 text-cream focus:border-maroon h-9 text-sm">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent className="!bg-[#1a1a1a] border-cream/20 z-50">
                                  {roleOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}
                                      className="text-cream hover:!bg-cream/20 focus:!bg-cream/20">
                                      {o.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="notes" className="text-cream/70 text-xs">Notes / Context</Label>
                              <Textarea id="notes" value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="What are you working on? How can I help?"
                                rows={3}
                                className="bg-dark border-cream/20 text-cream placeholder:text-cream/30 focus:border-maroon resize-none text-sm"
                                disabled={contactDisabled}
                              />
                            </div>

                            <Button type="submit" disabled={contactDisabled}
                              className="w-full bg-maroon hover:bg-maroon/90 text-cream font-medium py-5 text-sm"
                            >
                              {contactAntiSpam.isInCooldown ? (
                                <><Clock className="w-3.5 h-3.5 mr-2" />Wait {contactAntiSpam.cooldownRemaining}s</>
                              ) : submitting ? 'Connecting...' : (
                                <>Connect <Send className="w-3.5 h-3.5 ml-2" /></>
                              )}
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Footer ── */}
          <motion.footer
            className="text-center pb-6"
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.5 }}
          >
            <p className="text-cream/35 text-xs italic">
              "I help artists build sustainable income beyond streaming."
            </p>
          </motion.footer>

        </div>
      </div>
    </>
  );
}
