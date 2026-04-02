import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, Send, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import contactHero from '@/assets/contact-hero.jpg';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { isInCooldown, cooldownRemaining, honeypotProps, validate, triggerCooldown } = useAntiSpam({ cooldownMs: 15000 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInCooldown) return;
    const spamError = validate();
    if (spamError) { toast({ title: spamError, variant: 'destructive' }); return; }
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() },
      });
      if (error) throw error;
      toast({ title: 'Message sent!', description: "We'll get back to you soon." });
      triggerCooldown();
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch {
      toast({ title: 'Failed to send', description: 'Please try again or email us directly.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${contactHero})` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 47% 4% / 0.85) 0%, hsl(222 47% 4% / 0.6) 50%, hsl(217 100% 10% / 0.5) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Title */}
      <section>
        <div className="container mx-auto px-6 pt-12 pb-8">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-400 mb-3">Get In Touch</p>
          <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight leading-[1.05] mb-4 text-gray-900">
            Contact
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            Have a question or want to collaborate? We'd love to hear from you.
          </p>
        </div>
      </section>

      <main id="main-content" className="flex-1 px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form — left side */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              <input {...honeypotProps} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-black">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-100 border-0 text-black placeholder:text-gray-400 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-black">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-100 border-0 text-black placeholder:text-gray-400 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-semibold text-black">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What's this about?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-gray-100 border-0 text-black placeholder:text-gray-400 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-semibold text-black">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-gray-100 border-0 text-black placeholder:text-gray-400 min-h-[180px] resize-y"
                />
              </div>

              <Button
                type="submit"
                disabled={sending || isInCooldown}
                className="w-full h-14 text-base font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {isInCooldown ? `Wait ${cooldownRemaining}s` : sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>

            {/* Sidebar — right side */}
            <div className="lg:col-span-2 space-y-5">
              {/* Email card */}
              <div className="border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black uppercase tracking-wide">Email</p>
                  <p className="text-sm text-gray-500">Email us for inquiries</p>
                </div>
              </div>

              {/* Follow Us card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <p className="text-sm font-bold text-black uppercase tracking-wide mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { icon: <Instagram className="w-5 h-5" />, href: 'https://www.instagram.com/modernnostalgia.club/' },
                    { icon: <svg viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5"><path d="M331.5 235.7c2.2 .9 4.2 1.9 6.3 2.8c29.2 14.1 50.6 35.2 61.8 61.4c15.7 36.9 17.2 98.8-37.4 152.7c-54.6 53.9-124 50.3-176.2 35.4c-59.2-16.9-104.5-62.3-120.5-122.3c-18.7-70.2 5.2-138.5 62.8-182.1c7.3-5.5 14.9-10.4 22.9-14.6c-1.1-4.3-2-8.7-2.7-13.1c-3.3-21.6 .5-37.9 11.2-48.5c10.3-10.2 25.3-14.1 40.6-12c25.4 3.4 52.5 20.4 74.8 47.1c9.9 11.9 18.3 24.7 25.1 38.2c3 5.7 5.6 11.5 7.9 17.3c7.7-.2 15.5 .2 23.3 1.3c38.8 5.3 68.8 22.4 84.5 48.1c11.3 18.4 15.2 40.6 11.2 64.1c-7 41.2-35 74.6-78 93.9c-14.7 6.6-30.4 11.2-46.8 13.8c-1.6-10.3-3.7-20.5-6.4-30.5c12.3-2.1 24-5.6 35-10.6c33.1-14.9 54.8-40.5 59.7-70.4c2.9-17.5 .3-33.2-7.6-45.2c-9.4-14.3-26.8-25.2-50.3-31.5c-5.7 13.6-12.8 26.5-21.3 38.5c-22.3 31.5-52.5 53.5-85.7 62.5c-17.1 4.6-33.8 5.5-49.7 2.6c-18.7-3.3-33.2-12.7-42.5-27.2c-13.5-21.2-15.5-49.3-5.7-79c11.9-35.8 38.5-65.8 73.8-83.3c-2.4-8.7-4.2-17.6-5.4-26.6zm66.3 119.3c7-10 12.9-20.7 17.7-31.9c-16.7-4.6-34.8-6-53.5-4.2c3 12.8 5.4 25.8 6.9 39c10.2-0.1 19.9-1.1 28.9-2.9zm-90.6 22c20.2-5.2 38.5-16.4 53.9-33c3.3-3.6 6.4-7.3 9.3-11.2c-2-15.9-5.1-31.5-9.3-46.7c-25.4 2-48.8 9.1-68.5 20.8c-25.5 15.2-43.3 36.5-50.7 60.6c-6.7 21.8-5 40.4 4.9 55.9c5.3 8.3 14 14.3 25 16.3c11.3 2 23.5 .6 35.6-3.1c-2-20.1-2.5-40.2-0.2-59.6zm-24.4-136c-15.7 10.3-29.2 24-39.3 40.1c-10.3 16.5-16.8 34.2-18.8 51.6c4 3.3 8.3 6.3 13 8.9c20.7 11.3 47 12.2 72.3 2.5c15.7-6 29.7-15.4 41.3-27.5c-7.2-18.2-16.3-35.4-27.1-51.2c-12.6-18.4-27.1-32.8-41.4-24.4zm-67.5-30c-8.4 4-16.3 8.7-23.8 14.1c-47.8 34.3-67.4 90.3-52.8 145.1c13.1 49.1 50.7 86.4 98.4 100c41.7 11.9 98.8 14.6 143-28.1c40.9-39.7 43.2-84.5 31.9-110.9c-7-16.3-20.1-30-38.2-39.9c-.7 9.5-2.2 18.8-4.5 27.8c8.4 5.9 14.8 13 18.9 21.4c6.6 13.4 7.9 29.6 3.6 47c-4.2 17.1-13.4 32.3-27 44.9c-35 32.5-78.6 30.8-113.4 20.8c-40-11.4-72.3-43.2-82.8-85.6c-12.1-49-4.3-100.4 46.2-136.7c5.7-4.1 11.8-7.8 18.1-10.9c-3.2-7.7-6-15.6-8.1-23.6c-2.7 1.5-5.4 3.1-7.9 4.7c-.5 .3-1 .6-1.6 .9z"/></svg>, href: 'https://www.threads.net/@modernnostalgia.club' },
                    { icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, href: 'https://twitter.com/geohworks' },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400 transition-colors"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
