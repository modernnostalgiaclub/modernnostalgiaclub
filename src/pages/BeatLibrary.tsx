import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Music, ExternalLink, Lock, CheckCircle, Headphones, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

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

export default function BeatLibrary() {
  const { hasAccessToTier } = useAuth();
  const hasCELAccess = hasAccessToTier('creative-economy-lab');

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <motion.div variants={fadeIn} className="mb-12 text-center">
              <SectionLabel className="mb-4">Beat Library</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Exclusive Production Catalog
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Browse exclusive beats from Ge Oh & collaborators. Available for licensing to Artist Incubator members at special member rates.
              </p>
            </motion.div>

            {/* Pricing Highlight */}
            <motion.div variants={fadeIn} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="feature" className="text-center">
                  <CardContent className="pt-6">
                    <DollarSign className="w-8 h-8 text-maroon mx-auto mb-3" />
                    <h3 className="font-display text-2xl mb-1">$60</h3>
                    <p className="text-sm text-muted-foreground">Per Exclusive Beat</p>
                  </CardContent>
                </Card>
                <Card variant="feature" className="text-center">
                  <CardContent className="pt-6">
                    <Headphones className="w-8 h-8 text-maroon mx-auto mb-3" />
                    <h3 className="font-display text-lg mb-1">Free Mix & Master</h3>
                    <p className="text-sm text-muted-foreground">Included with every beat</p>
                  </CardContent>
                </Card>
                <Card variant="feature" className="text-center">
                  <CardContent className="pt-6">
                    <CheckCircle className="w-8 h-8 text-maroon mx-auto mb-3" />
                    <h3 className="font-display text-lg mb-1">50/50 Splits</h3>
                    <p className="text-sm text-muted-foreground">Master & writer splits</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* DISCO Embed - Full Width */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-maroon" />
                      <CardTitle>Browse the Catalog</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href="https://geohworks.disco.ac/e/p/26502910" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Open in DISCO
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                  <CardDescription>
                    Listen to available beats. Note which ones you're interested in, then submit a license request.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full rounded-lg overflow-hidden bg-muted">
                    <iframe 
                      id="disco-playlist-26502910"
                      name="disco-playlist-26502910"
                      src="https://geohworks.disco.ac/e/p/26502910?download=false&s=b4gWG3zPWBBB4-e-uTZPhftvU0M%3Aen67SJ41&artwork=true&color=%234E98FF&theme=dark"
                      className="disco-embed border-0 w-full"
                      height="500"
                      allowFullScreen
                      title="DISCO Beat Catalog"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* License CTA */}
            <motion.div variants={fadeIn} className="mb-12">
              {hasCELAccess ? (
                <Card className="border-2 border-maroon/50 bg-gradient-to-br from-maroon/10 to-maroon/5">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-maroon mx-auto mb-4" />
                    <h2 className="font-display text-2xl mb-2">Ready to License?</h2>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                      As an Artist Incubator member, you have access to exclusive member rates. 
                      Submit your license request and Ge Oh will reach out to finalize your order.
                    </p>
                    <Button variant="maroon" size="lg" asChild>
                      <Link to="/artistresources/beat-license">
                        Submit License Request
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-amber/50 bg-gradient-to-br from-amber/10 to-amber/5">
                  <CardContent className="p-8 text-center">
                    <Lock className="w-12 h-12 text-amber mx-auto mb-4" />
                    <h2 className="font-display text-2xl mb-2">CEL Members Only</h2>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                      Exclusive beat licensing is available only to Creative Economy Lab members. 
                      Apply to join and unlock member pricing.
                    </p>
                    <Button variant="maroon" size="lg" asChild>
                      <Link to="/apply">
                        Apply for Creative Economy Lab
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* What's Included */}
            <motion.div variants={fadeIn}>
              <h2 className="font-display text-2xl mb-6 text-center">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="feature">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Exclusive Rights</h4>
                        <p className="text-sm text-muted-foreground">
                          No one else will have these beats. Ownership lies with producers, 
                          with buyout options available.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="feature">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Free Mix & Master</h4>
                        <p className="text-sm text-muted-foreground">
                          Every beat purchase includes professional mixing and mastering 
                          of your finished song.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="feature">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Sync Pitching</h4>
                        <p className="text-sm text-muted-foreground">
                          Qualifying songs are pitched for sync licensing and promoted 
                          in the newsletter for a month after release.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="feature">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Stems Available</h4>
                        <p className="text-sm text-muted-foreground">
                          Full stems available upon request for all beat purchases. 
                          No stems = not for sale.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
