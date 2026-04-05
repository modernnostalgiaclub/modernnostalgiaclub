import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Music, FileText, AlertTriangle, CheckCircle, ExternalLink, Send } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LICENSE_OPTIONS = [
  { value: 'exclusive-lease', label: 'Exclusive Lease — $60 + 50% Master & Writer Splits' },
  { value: 'buyout', label: 'Buyout — Contact for pricing' },
];

const PAYMENT_OPTIONS = [
  { value: 'cashapp', label: 'Cash App' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Credit/Debit Card (Stripe)' },
  { value: 'other', label: 'Other — Specify in notes' },
];

export default function BeatLicense() {
  const { hasAccessToTier, user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    artist_name: '',
    email: '',
    beats_interested: '',
    license_option: '',
    payment_method: '',
    special_requests: '',
  });

  const hasCELAccess = hasAccessToTier('creative-economy-lab');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a license request');
      return;
    }
    if (!form.full_name || !form.email || !form.beats_interested || !form.license_option || !form.payment_method) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    const totalAmount = form.license_option === 'exclusive-lease' ? 60 : 0;
    const paymentNote = `Payment method: ${PAYMENT_OPTIONS.find(p => p.value === form.payment_method)?.label || form.payment_method}`;
    const specialRequests = [paymentNote, form.special_requests].filter(Boolean).join('\n\n');

    const { error } = await supabase
      .from('beat_license_submissions')
      .insert({
        user_id: user.id,
        full_name: form.full_name.trim(),
        artist_name: form.artist_name.trim() || null,
        email: form.email.trim(),
        beats_interested: form.beats_interested.trim(),
        license_option: LICENSE_OPTIONS.find(o => o.value === form.license_option)?.label || form.license_option,
        total_amount: totalAmount,
        special_requests: specialRequests.trim() || null,
        payment_status: 'pending',
      });

    setSubmitting(false);

    if (error) {
      console.error('Error submitting beat license request:', error);
      toast.error('Failed to submit request. Please try again.');
      return;
    }

    setSubmitted(true);
    toast.success('License request submitted successfully!');
  }

  if (!hasCELAccess) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <SectionLabel className="mb-4">Exclusive Content</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-6">
                Artist Incubator Members Only
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Exclusive beat licensing at member rates is available only to Artist Incubator members.
              </p>
              <Card variant="elevated" className="p-8">
                <AlertTriangle className="w-12 h-12 text-amber mx-auto mb-4" />
                <h2 className="font-display text-2xl mb-4">Upgrade to Access</h2>
                <p className="text-muted-foreground mb-6">
                  Join the Artist Incubator to unlock exclusive beat licenses at $60 per beat 
                  (50% off regular pricing) plus 50/50 master and writer splits.
                </p>
                <Button variant="maroon" size="lg" onClick={() => navigate('/apply')}>
                  Apply for Artist Incubator
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <motion.div variants={fadeIn} className="mb-8">
              <SectionLabel className="mb-4">Exclusive Beat License</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Production for Artists
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Exclusive beat licensing available only to Artist Incubator members at special member rates.
              </p>
            </motion.div>

            {/* DISCO Embed */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-maroon" />
                    <CardTitle>Browse Available Beats</CardTitle>
                  </div>
                  <CardDescription>
                    Listen to the full catalog and note which beat(s) you're interested in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full rounded-lg overflow-hidden bg-muted flex justify-center">
                    <iframe 
                      id="disco-playlist-26502910"
                      name="disco-playlist-26502910"
                      src="https://geohworks.disco.ac/e/p/26502910?download=false&s=b4gWG3zPWBBB4-e-uTZPhftvU0M%3Aen67SJ41&artwork=true&color=%234E98FF&theme=dark"
                      className="disco-embed border-0"
                      width="800"
                      height="400"
                      allowFullScreen
                      title="DISCO Beat Catalog"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href="https://geohworks.disco.ac/e/p/26502910" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        See Library
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="console">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-maroon" />
                    <CardTitle>Terms and Conditions</CardTitle>
                  </div>
                  <CardDescription>
                    Free Mix & Master w/ Each Beat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-maroon/10 rounded-lg border border-maroon/20">
                    <h3 className="font-display text-xl mb-2">Pricing</h3>
                    <p className="text-lg">
                      <strong>Exclusive:</strong> $60 + 50% Master AND Writers/Publisher Splits 
                      <span className="text-muted-foreground"> (% Divided between Producers)</span>
                    </p>
                    <p className="text-sm text-maroon mt-2 font-medium">
                      THIS PRICE IS ONLY FOR ARTIST INCUBATOR MEMBERS
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Sample & Co-Production Notice</h4>
                        <p className="text-sm text-muted-foreground">
                          Some beats are sampled; every beat that I either sampled or co-produced with someone is 
                          stated in the title as <strong>Ge Oh x _______</strong> (Person sampled or Co-producer). 
                          Co-productions are included in price as far as clearances—let me know which beat, and I'll 
                          clear it accordingly. Sample clearances are to be done with the artist, but I can have it 
                          cleared for an additional fee.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Exclusive Leases</h4>
                        <p className="text-sm text-muted-foreground">
                          All beats are Exclusive Leases; no one else will have these beats, but the ownership still 
                          lies with me and the Co-producers who made the beat. Let me know if you're interested in a 
                          buyout (in this event, I will not pitch it for sync or placement).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Buyout Option</h4>
                        <p className="text-sm text-muted-foreground">
                          If a Beat is purchased in a BuyOut, I do not collect % and the beat is yours to do with 
                          as you wish. I do not pitch it for Sync or Promote the song if Bought Out.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Sync Pitching & Promotion</h4>
                        <p className="text-sm text-muted-foreground">
                          I pitch all songs produced by myself that qualify for sync (not sampled; co-productions 
                          are okay to pitch for sync) and promote the song in my newsletter for a month after release.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Stems Included</h4>
                        <p className="text-sm text-muted-foreground">
                          Stems are available upon Request for ALL Beat Sales. If there are no stems, the beat will 
                          not be for sale.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Credit Requirements</h4>
                        <p className="text-sm text-muted-foreground">
                          Credit is as follows: <strong>Produced By: Ge Oh</strong> (& Co-producer Name if applicable)
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic">
                    If you have any questions, feel free to ask and let me know!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Native License Request Form */}
            <motion.div variants={fadeIn}>
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-maroon" />
                    <CardTitle>Submit License Request</CardTitle>
                  </div>
                  <CardDescription>
                    Fill out the form below and Ge Oh will reach out to finalize your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-display mb-2">Request Submitted!</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Your beat license request has been received. Ge Oh will review it and reach out to finalize your order.
                      </p>
                      <Button variant="maroon" onClick={() => { setSubmitted(false); setForm({ full_name: '', artist_name: '', email: '', beats_interested: '', license_option: '', payment_method: '', special_requests: '' }); }}>
                        Submit Another Request
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            value={form.full_name}
                            onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Your full name"
                            required
                            maxLength={100}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artist_name">Artist / Stage Name</Label>
                          <Input
                            id="artist_name"
                            value={form.artist_name}
                            onChange={(e) => setForm(prev => ({ ...prev, artist_name: e.target.value }))}
                            placeholder="Optional"
                            maxLength={100}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          required
                          maxLength={255}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="beats_interested">Which Beat(s) Are You Interested In? *</Label>
                        <Textarea
                          id="beats_interested"
                          value={form.beats_interested}
                          onChange={(e) => setForm(prev => ({ ...prev, beats_interested: e.target.value }))}
                          placeholder="List the beat name(s) from the catalog above"
                          required
                          rows={3}
                          maxLength={1000}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="license_option">License Type *</Label>
                          <Select value={form.license_option} onValueChange={(v) => setForm(prev => ({ ...prev, license_option: v }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select license type" />
                            </SelectTrigger>
                            <SelectContent>
                              {LICENSE_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment_method">Preferred Payment Method *</Label>
                          <Select value={form.payment_method} onValueChange={(v) => setForm(prev => ({ ...prev, payment_method: v }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="special_requests">Special Requests / Notes</Label>
                        <Textarea
                          id="special_requests"
                          value={form.special_requests}
                          onChange={(e) => setForm(prev => ({ ...prev, special_requests: e.target.value }))}
                          placeholder="Any questions about samples, co-productions, buyout pricing, etc."
                          rows={3}
                          maxLength={1000}
                        />
                      </div>

                      <Button type="submit" variant="maroon" size="lg" className="w-full" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit License Request'}
                      </Button>

                      <p className="text-sm text-center text-muted-foreground">
                        Payment will be processed after Ge Oh confirms beat availability and reaches out.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
