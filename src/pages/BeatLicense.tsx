import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Music, FileText, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

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

export default function BeatLicense() {
  const { hasAccessToTier } = useAuth();
  const navigate = useNavigate();

  // Check if user has CEL tier access
  const hasCELAccess = hasAccessToTier('creative-economy-lab');

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

            {/* JotForm Embed */}
            <motion.div variants={fadeIn}>
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Submit License Request</CardTitle>
                  <CardDescription>
                    Fill out the form below and Ge Oh will reach out to finalize your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-h-[600px]">
                    <iframe
                      id="JotFormIFrame-253335641415150"
                      title="Beat License Request Form"
                      src="https://pci.jotform.com/form/253335641415150"
                      style={{ 
                        width: '100%', 
                        minHeight: '600px', 
                        border: 'none',
                        backgroundColor: 'transparent'
                      }}
                      allowFullScreen
                      allow="geolocation; microphone; camera; fullscreen"
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    Payment will be processed after Ge Oh confirms beat availability and reaches out.
                  </p>
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
