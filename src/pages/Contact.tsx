import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { Mail, Send, Loader2, Clock } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const antiSpam = useAntiSpam({ storageKey: 'contact_cooldown', cooldownMs: 60000 });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Validate anti-spam measures
    const spamError = antiSpam.validate();
    if (spamError) {
      toast({
        title: 'Unable to submit',
        description: spamError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...data,
          ...antiSpam.getSubmissionData(),
        },
      });

      if (error) throw error;

      // Trigger cooldown after successful submission
      antiSpam.triggerCooldown();

      toast({
        title: 'Message sent!',
        description: "Thanks for reaching out. We'll get back to you soon.",
      });
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again or email us directly at ge@modernnostalgia.club',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || antiSpam.isInCooldown;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have a question, partnership inquiry, or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot field - hidden from users, bots will fill it */}
                <input {...antiSpam.honeypotProps} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} disabled={isDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} disabled={isDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="What's this about?" {...field} disabled={isDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more..."
                          className="min-h-[150px] resize-y"
                          {...field}
                          disabled={isDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isDisabled}>
                  {antiSpam.isInCooldown ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Wait {antiSpam.cooldownRemaining}s
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            You can also reach us directly at{' '}
            <a href="mailto:ge@modernnostalgia.club" className="text-primary hover:underline">
              ge@modernnostalgia.club
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
