import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Music, FileText, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { z } from 'zod';

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

// Form validation schema
const formSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  artistName: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Invalid email address").max(255),
  beatsInterested: z.string().trim().min(1, "Please specify which beat(s) you're interested in").max(500),
  specialRequests: z.string().trim().max(1000).optional(),
  licenseOption: z.enum(['single', 'double']),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
});

type FormData = z.infer<typeof formSchema>;

export default function BeatLicense() {
  const { user, hasAccessToTier } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<FormData>>({
    fullName: '',
    artistName: '',
    email: user?.email || '',
    beatsInterested: '',
    specialRequests: '',
    licenseOption: 'single',
    agreedToTerms: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if user has CEL tier access
  const hasCELAccess = hasAccessToTier('creative-economy-lab');

  const totalAmount = formData.licenseOption === 'single' ? 60 : 100;

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a beat license request.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('beat_license_submissions')
        .insert({
          user_id: user.id,
          full_name: result.data.fullName,
          artist_name: result.data.artistName || null,
          email: result.data.email,
          beats_interested: result.data.beatsInterested,
          special_requests: result.data.specialRequests || null,
          license_option: result.data.licenseOption,
          total_amount: totalAmount,
          payment_status: 'pending'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save submission');
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('beat-license-notification', {
        body: {
          fullName: result.data.fullName,
          artistName: result.data.artistName,
          email: result.data.email,
          beatsInterested: result.data.beatsInterested,
          specialRequests: result.data.specialRequests,
          licenseOption: result.data.licenseOption,
          totalAmount
        }
      });

      if (emailError) {
        console.error('Email notification error:', emailError);
        // Don't throw - submission was saved, just notify
        toast({
          title: "Request submitted",
          description: "Your request was saved but email notification may have failed. We'll still process it!",
        });
      } else {
        toast({
          title: "Request submitted successfully!",
          description: "Check your email for confirmation. Ge Oh will reach out shortly.",
        });
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not CEL tier, show upgrade prompt
  if (!hasCELAccess) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <SectionLabel className="mb-4">Exclusive Content</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-6">
                Creative Economy Lab Members Only
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Exclusive beat licensing at member rates is available only to Creative Economy Lab members.
              </p>
              <Card variant="elevated" className="p-8">
                <AlertTriangle className="w-12 h-12 text-amber mx-auto mb-4" />
                <h2 className="font-display text-2xl mb-4">Upgrade to Access</h2>
                <p className="text-muted-foreground mb-6">
                  Join the Creative Economy Lab to unlock exclusive beat licenses at $60 per beat 
                  (50% off regular pricing) plus 50/50 master and writer splits.
                </p>
                <Button variant="maroon" size="lg" onClick={() => navigate('/apply')}>
                  Apply for Creative Economy Lab
                </Button>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-maroon/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-maroon" />
              </motion.div>
              <h1 className="text-4xl font-display mb-4">Request Submitted!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Check your email for confirmation. Ge Oh will reach out to discuss your beat selection 
                and next steps for payment and delivery.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                  Submit Another Request
                </Button>
                <Button variant="maroon" onClick={() => navigate('/reference')}>
                  Back to Reference Shelf
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
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
                Exclusive beat licensing available only to Creative Economy Lab members at special member rates.
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
                  {/* Pricing */}
                  <div className="p-4 bg-maroon/10 rounded-lg border border-maroon/20">
                    <h3 className="font-display text-xl mb-2">Pricing</h3>
                    <p className="text-lg">
                      <strong>Exclusive:</strong> $60 + 50% Master AND Writers/Publisher Splits 
                      <span className="text-muted-foreground"> (% Divided between Producers)</span>
                    </p>
                    <p className="text-sm text-maroon mt-2 font-medium">
                      THIS PRICE IS ONLY FOR CREATIVE ECONOMY LAB MEMBERS
                    </p>
                  </div>

                  {/* Important Notes */}
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

            {/* Form */}
            <motion.div variants={fadeIn}>
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Submit License Request</CardTitle>
                  <CardDescription>
                    Fill out the form below and Ge Oh will reach out to finalize your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Your Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          placeholder="Full name"
                          className={errors.fullName ? 'border-destructive' : ''}
                        />
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="artistName">Artist Name</Label>
                        <Input
                          id="artistName"
                          value={formData.artistName}
                          onChange={(e) => handleChange('artistName', e.target.value)}
                          placeholder="Stage name (optional)"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    {/* Beats Interested */}
                    <div className="space-y-2">
                      <Label htmlFor="beatsInterested">Which Beat(s) Are You Interested In? *</Label>
                      <Textarea
                        id="beatsInterested"
                        value={formData.beatsInterested}
                        onChange={(e) => handleChange('beatsInterested', e.target.value)}
                        placeholder="Enter beat name(s). If interested in multiple, separate with commas."
                        rows={3}
                        className={errors.beatsInterested ? 'border-destructive' : ''}
                      />
                      {errors.beatsInterested && (
                        <p className="text-sm text-destructive">{errors.beatsInterested}</p>
                      )}
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">Any Special Requests/Questions?</Label>
                      <Textarea
                        id="specialRequests"
                        value={formData.specialRequests}
                        onChange={(e) => handleChange('specialRequests', e.target.value)}
                        placeholder="Optional: Any questions or special requests..."
                        rows={3}
                      />
                    </div>

                    {/* License Option */}
                    <div className="space-y-3">
                      <Label>License Option *</Label>
                      <RadioGroup
                        value={formData.licenseOption}
                        onValueChange={(value) => handleChange('licenseOption', value)}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="single" id="single" />
                          <Label htmlFor="single" className="flex-1 cursor-pointer">
                            <span className="font-medium">Single Exclusive Beat License</span>
                            <span className="text-lg font-display text-maroon ml-2">$60.00</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="double" id="double" />
                          <Label htmlFor="double" className="flex-1 cursor-pointer">
                            <span className="font-medium">2 Exclusive Beat Licenses</span>
                            <span className="text-lg font-display text-maroon ml-2">$100.00</span>
                            <span className="text-sm text-muted-foreground ml-2">(Save $20)</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Total */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total</span>
                        <span className="text-2xl font-display text-maroon">${totalAmount}.00</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        + 50% Master & Writer/Publisher Splits
                      </p>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreedToTerms as boolean}
                        onCheckedChange={(checked) => handleChange('agreedToTerms', checked as boolean)}
                        className={errors.agreedToTerms ? 'border-destructive' : ''}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="terms" className="cursor-pointer">
                          I agree to the terms & conditions above *
                        </Label>
                        {errors.agreedToTerms && (
                          <p className="text-sm text-destructive">{errors.agreedToTerms}</p>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      variant="maroon"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit License Request'
                      )}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Payment will be processed after Ge Oh confirms beat availability and reaches out.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
