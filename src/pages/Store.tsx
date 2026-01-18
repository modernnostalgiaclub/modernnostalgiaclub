import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STORE_PRODUCTS } from '@/lib/storeProducts';
import { ShoppingCart, Package, ExternalLink, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Cover images
import coverJustMakeNoise from '@/assets/cover-just-make-noise.jpg';
import coverBeLoud from '@/assets/cover-be-loud.jpg';

const coverImages: Record<string, string> = {
  'just-make-noise': coverJustMakeNoise,
  'be-loud': coverBeLoud,
};

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

export default function Store() {
  const { user } = useAuth();

  const handlePurchase = (paymentLink: string) => {
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background studio-grain flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16" id="main-content">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display mb-4">Artist Store</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional templates and resources to level up your music career.
              </p>
            </motion.div>

            {/* Member CTA */}
            {!user && (
              <motion.div variants={fadeIn} className="mb-12">
                <Card className="p-6 bg-maroon/10 border-maroon/20">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-amber" />
                      <div>
                        <h3 className="font-display text-lg">Members Get Everything Free!</h3>
                        <p className="text-sm text-muted-foreground">
                          Join the club to unlock all downloads at no extra cost.
                        </p>
                      </div>
                    </div>
                    <Button variant="maroon" asChild>
                      <Link to="/">Become a Member</Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* If logged in, redirect notice */}
            {user && (
              <motion.div variants={fadeIn} className="mb-12">
                <Card className="p-6 bg-green-500/10 border-green-500/20">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-green-500" />
                      <div>
                        <h3 className="font-display text-lg">You're a Member!</h3>
                        <p className="text-sm text-muted-foreground">
                          All these resources are available for free on your dashboard.
                        </p>
                      </div>
                    </div>
                    <Button variant="maroon" asChild>
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Products Grid */}
            <motion.div variants={fadeIn}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {STORE_PRODUCTS.map((product) => (
                  <Card key={product.id} variant="elevated" className="overflow-hidden">
                    {/* Cover images removed per user request */}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="p-3 bg-maroon/20 rounded-lg">
                          {product.isBundle ? (
                            <Package className="w-6 h-6 text-maroon" />
                          ) : (
                            <ShoppingCart className="w-6 h-6 text-maroon" />
                          )}
                        </div>
                        <div className="text-right">
                          {product.isBundle && (
                            <Badge className="mb-1 bg-amber/20 text-amber border-amber/30">Bundle</Badge>
                          )}
                          <p className="text-2xl font-display text-maroon">${product.price}</p>
                        </div>
                      </div>

                      <h3 className="font-display text-xl mb-2">{product.title}</h3>
                      <p className="text-muted-foreground mb-4 text-sm line-clamp-4">{product.description}</p>

                      {/* External links */}
                      {product.externalLinks?.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-maroon hover:underline mb-4"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {link.label}
                        </a>
                      ))}

                      <Button 
                        variant="maroon" 
                        className="w-full"
                        onClick={() => handlePurchase(product.paymentLink)}
                      >
                        Purchase - ${product.price}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.div variants={fadeIn} className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Secure checkout powered by Intuit. After purchase, you'll receive your download via email.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
