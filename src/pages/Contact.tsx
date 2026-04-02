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
      <main id="main-content" className="flex-1 px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="font-anton text-5xl md:text-6xl uppercase tracking-tight text-black mb-4">
              Contact
            </h1>
            <p className="text-gray-500 text-base md:text-lg">
              Have a question or want to collaborate? We'd love to hear from you.
            </p>
          </div>

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
                disabled={sending || !canSubmit}
                className="w-full h-14 text-base font-bold uppercase tracking-wider bg-[hsl(200,60%,70%)] hover:bg-[hsl(200,60%,60%)] text-black rounded-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {!canSubmit ? `Wait ${cooldownRemaining}s` : sending ? 'Sending...' : 'Send Message'}
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
                  <a href="mailto:geohworks@gmail.com" className="text-sm text-gray-500 hover:text-black transition-colors">
                    geohworks@gmail.com
                  </a>
                </div>
              </div>

              {/* Follow Us card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <p className="text-sm font-bold text-black uppercase tracking-wide mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com/geohworks' },
                    { icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.28z"/></svg>, href: 'https://tiktok.com/@geohworks' },
                    { icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>, href: 'https://threads.net/@geohworks' },
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

              {/* Submit Music card */}
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <p className="text-sm font-bold text-black uppercase tracking-wide mb-2">Want to Submit Music?</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create a free creator account to submit your mashups and edits for consideration.
                </p>
                <a
                  href="/login"
                  className="inline-block text-sm font-bold uppercase tracking-wider border border-black text-black px-5 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors"
                >
                  Submit Music
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
