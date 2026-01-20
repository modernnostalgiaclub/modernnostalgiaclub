import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ExternalLink, Send, CheckCircle, Home, Music, Handshake, Calendar, Instagram } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import logoCream from '@/assets/logo-cream.png';

interface NetworkingLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  music: Music,
  handshake: Handshake,
  calendar: Calendar,
  instagram: Instagram,
  link: ExternalLink,
};

const roleOptions = [
  { value: 'Artist', label: 'Artist' },
  { value: 'Brand', label: 'Brand' },
  { value: 'Music Tech', label: 'Music Tech' },
  { value: 'Publisher / Sync', label: 'Publisher / Sync' },
  { value: 'Other', label: 'Other' },
];

export default function Connect() {
  const [links, setLinks] = useState<NetworkingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    notes: '',
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    const { data, error } = await supabase
      .from('networking_links')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order')
      .limit(6);

    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

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
        },
      });

      setSubmitting(false);

      if (error) {
        // Check for rate limit error
        if (error.message?.includes('429') || data?.error?.includes('Too many')) {
          toast.error('Too many submissions. Please try again later.');
        } else {
          toast.error('Something went wrong. Please try again.');
        }
        console.error('Submit error:', error);
        return;
      }

      setSubmitted(true);
      toast.success("You're connected!");
    } catch (err) {
      setSubmitting(false);
      toast.error('Something went wrong. Please try again.');
      console.error('Submit error:', err);
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Helmet>
        <title>Connect | Modern Nostalgia Club</title>
        <meta name="description" content="Stay connected with Modern Nostalgia Club. Infrastructure for independent artists and creative economies." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <div className="min-h-screen bg-dark text-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          {/* Header */}
          <motion.header 
            className="text-center mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={logoCream} 
              alt="Modern Nostalgia Club" 
              className="h-24 mx-auto mb-4"
            />
            <p className="text-cream font-medium text-lg tracking-wide mb-2">
              Ge Oh | modernnostalgia.club
            </p>
            <p className="text-cream/60 text-sm tracking-wide italic">
              Infrastructure for independent artists and creative economies.
            </p>
          </motion.header>

          {/* Links Section - 2 Column Grid */}
          {!loading && links.length > 0 && (
            <motion.section
              className="mb-8"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="grid grid-cols-2 gap-2">
                {links.map((link, index) => {
                  const IconComponent = iconMap[link.icon] || ExternalLink;
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-cream/5 hover:bg-cream/10 border border-cream/10 hover:border-cream/20 rounded-lg transition-all duration-200 group text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.03 }}
                    >
                      <IconComponent className="w-4 h-4 text-cream/60 group-hover:text-maroon transition-colors flex-shrink-0" />
                      <span className="text-cream text-sm font-medium truncate">{link.label}</span>
                    </motion.a>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Contact Form or Success */}
          <motion.section 
            className="mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {submitted ? (
              <div className="text-center py-12 px-6 bg-cream/5 rounded-2xl border border-cream/10">
                <CheckCircle className="w-16 h-16 text-maroon mx-auto mb-4" />
                <h2 className="font-display text-2xl mb-2">You're connected.</h2>
                <p className="text-cream/70 mb-6">I'll follow up properly.</p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', company: '', role: '', notes: '' });
                  }}
                  className="text-cream/50 hover:text-cream"
                >
                  Connect someone else
                </Button>
              </div>
            ) : (
              <div className="bg-cream/5 rounded-2xl border border-cream/10 p-6">
                <h2 className="font-display text-xl text-center mb-1">Let's stay connected.</h2>
                <p className="text-cream/60 text-sm text-center mb-6">
                  Drop your info. I'll follow up properly.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-cream/80 text-sm">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="bg-dark border-cream/20 text-cream placeholder:text-cream/40 focus:border-maroon"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-cream/80 text-sm">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@email.com"
                      className="bg-dark border-cream/20 text-cream placeholder:text-cream/40 focus:border-maroon"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-cream/80 text-sm">Company / Artist Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Optional"
                      className="bg-dark border-cream/20 text-cream placeholder:text-cream/40 focus:border-maroon"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-cream/80 text-sm">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="bg-dark border-cream/20 text-cream focus:border-maroon">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark border-cream/20">
                        {roleOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-cream hover:bg-cream/10"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-cream/80 text-sm">Notes / Context</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="What are you working on? How can I help?"
                      rows={3}
                      className="bg-dark border-cream/20 text-cream placeholder:text-cream/40 focus:border-maroon resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-maroon hover:bg-maroon/90 text-cream font-medium py-6 text-base"
                  >
                    {submitting ? (
                      'Connecting...'
                    ) : (
                      <>
                        Connect
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </motion.section>


          {/* Value Hook */}
          <motion.footer 
            className="mt-12 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-cream/50 text-sm italic">
              "I help artists build sustainable income beyond streaming."
            </p>
          </motion.footer>
        </div>
      </div>
    </>
  );
}
