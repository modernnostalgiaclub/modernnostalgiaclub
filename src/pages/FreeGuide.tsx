import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { toast } from 'sonner';
import { Download, CheckCircle, Clock, BookOpen, Target, DollarSign, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoCream from '@/assets/logo-cream.png';

const emailSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
});

type EmailFormData = z.infer<typeof emailSchema>;

const GUIDE_DOWNLOAD_LINK = '/downloads/The_Free_Artist_Survival_Guide.pdf';
const TRACK_ID = 'artist-survival-guide';
const TRACK_TITLE = 'The Free Artist Survival Guide';

const benefits = [
  {
    icon: Target,
    title: 'Define Your Artist Identity',
    description: 'Discover how to position yourself in a crowded market and stand out.',
  },
  {
    icon: DollarSign,
    title: 'Revenue Strategies',
    description: 'Learn multiple income streams beyond just streaming royalties.',
  },
  {
    icon: Shield,
    title: 'Protect Your Rights',
    description: 'Understand the basics of copyright, publishing, and ownership.',
  },
  {
    icon: BookOpen,
    title: 'Actionable Worksheets',
    description: 'Practical exercises to implement what you learn immediately.',
  },
];

export default function FreeGuide() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const antiSpam = useAntiSpam({ storageKey: 'guide_download_cooldown', cooldownMs: 15000 });

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const triggerDownload = () => {
    const link = document.createElement('a');
    link.href = GUIDE_DOWNLOAD_LINK;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: EmailFormData) => {
    const spamError = antiSpam.validate();
    if (spamError) {
      toast.error(spamError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke('capture-download-email', {
        body: {
          email: data.email.toLowerCase(),
          trackId: TRACK_ID,
          trackTitle: TRACK_TITLE,
          ...antiSpam.getSubmissionData(),
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;

      if (result.error) {
        if (result.error.includes('Too many requests')) {
          toast.error('Too many attempts. Please try again later.');
          return;
        }
        throw new Error(result.error);
      }

      antiSpam.triggerCooldown();
      setIsSuccess(true);
      toast.success('Your download is starting!');
      triggerDownload();
    } catch (error) {
      console.error('Error capturing email:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || antiSpam.isInCooldown;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoCream} alt="Modern Nostalgia Club" className="h-8 w-auto" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/10 via-background to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-maroon/20 text-maroon border border-maroon/30">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Free Download</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                The Artist
                <span className="text-maroon block">Survival Guide</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Stop leaving money on the table. This free guide reveals the business fundamentals 
                every independent artist needs to build a sustainable music career.
              </p>

              <ul className="space-y-3">
                {['25+ pages of actionable strategies', 'Written for independent artists', 'No fluff, just real tactics'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80">
                    <CheckCircle className="w-5 h-5 text-maroon flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right: Form Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                {isSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold">You're In!</h3>
                    <p className="text-muted-foreground">
                      Your download should start automatically. Check your downloads folder.
                    </p>
                    <Button
                      variant="outline"
                      onClick={triggerDownload}
                      className="mt-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Again
                    </Button>
                    <div className="pt-6 border-t border-border mt-6">
                      <p className="text-sm text-muted-foreground mb-3">
                        Ready for the next level?
                      </p>
                      <Link to="/#pricing">
                        <Button variant="maroon" className="w-full">
                          Explore Membership Options
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-2">Get Your Free Copy</h2>
                      <p className="text-muted-foreground">
                        Enter your email and we'll send you the guide instantly.
                      </p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Honeypot field */}
                        <input {...antiSpam.honeypotProps} />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="your@email.com"
                                  type="email"
                                  className="h-12 text-base"
                                  {...field}
                                  disabled={isDisabled}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          variant="maroon"
                          size="lg"
                          className="w-full h-12 text-base"
                          disabled={isDisabled}
                        >
                          {antiSpam.isInCooldown ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Wait {antiSpam.cooldownRemaining}s
                            </>
                          ) : isSubmitting ? (
                            'Processing...'
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download Free Guide
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          We respect your privacy. Unsubscribe anytime.
                        </p>
                      </form>
                    </Form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">What's Inside</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This isn't another generic music business PDF. It's a practical playbook 
              built from real experience in the industry.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-maroon/50 transition-colors"
              >
                <div className="w-12 h-12 bg-maroon/20 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-maroon" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Take Control of Your Career?
            </h2>
            <p className="text-muted-foreground mb-8">
              The guide is just the beginning. Join thousands of artists who are 
              building sustainable careers in the Modern Nostalgia Club.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#pricing">
                <Button variant="maroon" size="lg">
                  View Membership Options
                </Button>
              </Link>
              <Link to="/sync-quiz">
                <Button variant="outline" size="lg">
                  Take the Sync Quiz
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Modern Nostalgia Club. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
