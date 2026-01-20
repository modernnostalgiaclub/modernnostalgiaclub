import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { STORE_PRODUCTS } from '@/lib/storeProducts';
import { ShoppingCart, Package, ExternalLink, Star, ClipboardCheck, CheckCircle2, HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const catalogAuditFAQ = [
  {
    question: "I only have a few songs. Is this still for me?",
    answer: "If you have fewer than 5 finished songs, a catalog audit usually isn't the best first step. At that stage, building more finished, controlled material will create more value than reviewing structure.",
    recommendation: "Start with a catalog-building or sync fundamentals guide instead."
  },
  {
    question: "My music already sounds professional. Why would I need this?",
    answer: "Sound quality isn't the problem this audit addresses. This is about ownership clarity, collaborator risk, and licensing readiness—the things that can quietly stop a deal after someone likes your song.",
    recommendation: "If you've never mapped those things out, this audit can still be valuable."
  },
  {
    question: "Is this legal advice?",
    answer: "No. This audit does not replace a lawyer. It's a structural review designed to surface risks, gaps, and questions before legal review is necessary. Many artists never realize there's a problem until a deal collapses. This prevents that."
  },
  {
    question: "I've never pitched to sync before. Is this too advanced?",
    answer: "If you haven't released music or don't yet control your catalog, this may be premature. If you do control your songs but haven't pitched yet, this audit can help ensure you don't start with preventable mistakes."
  },
  {
    question: "What if everything in my catalog is already clean?",
    answer: "Then the audit acts as confirmation and documentation. Many artists book this simply to validate their readiness, pitch with confidence, and show partners they've done due diligence.",
    recommendation: "If that peace of mind isn't valuable to you, you likely don't need this service."
  },
  {
    question: "I just want placements. Will this help me get one?",
    answer: "This audit does not guarantee placements. What it does is remove the most common reasons deals fail before music is even seriously considered. If you're looking for a shortcut or a promise, this isn't the right fit."
  },
  {
    question: "Who should NOT book a Catalog Audit?",
    answer: "This is not a good fit if you have under 5 finished songs, don't control your masters or publishing, are unwilling to credit collaborators properly, are looking for exposure or fast wins, or are not open to making structural changes.",
    recommendation: "In those cases, education or catalog development is a better next step."
  }
];

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
  const [auditConfirmed, setAuditConfirmed] = useState(false);

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
                {STORE_PRODUCTS.filter(p => !p.isService).map((product) => (
                  <Card key={product.id} variant="elevated" className="overflow-hidden">
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

            {/* Catalog Audit Service - Featured Section */}
            {STORE_PRODUCTS.filter(p => p.isService).map((service) => (
              <motion.div key={service.id} variants={fadeIn} className="mt-12">
                <Card variant="elevated" className="overflow-hidden border-maroon/30">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-maroon/20 rounded-lg">
                          <ClipboardCheck className="w-8 h-8 text-maroon" />
                        </div>
                        <div>
                          <Badge className="mb-2 bg-maroon/20 text-maroon border-maroon/30">Professional Service</Badge>
                          <h3 className="font-display text-2xl md:text-3xl">{service.title}</h3>
                        </div>
                      </div>
                      <p className="text-3xl md:text-4xl font-display text-maroon">${service.price}</p>
                    </div>

                    <p className="text-lg text-muted-foreground mb-6">{service.description}</p>

                    {service.fullDescription && (
                      <div className="prose prose-sm max-w-none mb-6">
                        {service.fullDescription.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="text-foreground/80 mb-4">{paragraph}</p>
                        ))}
                      </div>
                    )}

                    {service.whatsIncluded && (
                      <div className="bg-secondary/30 rounded-lg p-6 mb-6">
                        <h4 className="font-display text-lg mb-4">What's Included</h4>
                        <ul className="space-y-2">
                          {service.whatsIncluded.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-display text-lg mb-3">Who This Is For</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Artists preparing to pitch for sync</li>
                          <li>• Producers managing multiple collaborators</li>
                          <li>• Managers or reps vetting catalogs</li>
                          <li>• Artists tired of guessing why nothing lands</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-display text-lg mb-3">What This Is Not</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Legal representation</li>
                          <li>• Guaranteed placements</li>
                          <li>• Creative feedback or song critique</li>
                        </ul>
                        <p className="text-sm text-foreground/80 mt-3 italic">This is about structure, not taste.</p>
                      </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="border-t border-border/50 pt-8 mb-8">
                      <div className="flex items-center gap-3 mb-6">
                        <HelpCircle className="w-6 h-6 text-maroon" />
                        <h4 className="font-display text-xl">Is the Catalog Audit Right for You?</h4>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        Read this before booking. It'll save you time and money.
                      </p>
                      
                      <Accordion type="single" collapsible className="w-full space-y-2">
                        {catalogAuditFAQ.map((faq, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`faq-${index}`}
                            className="border border-border/50 rounded-lg px-4 bg-secondary/10"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-4">
                              <span className="font-medium text-sm md:text-base">
                                Q{index + 1}. {faq.question}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <p className="text-muted-foreground text-sm mb-2">{faq.answer}</p>
                              {faq.recommendation && (
                                <p className="text-sm text-foreground/80 font-medium mt-3">
                                  <span className="text-maroon">Better next step:</span> {faq.recommendation}
                                </p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>

                    {/* Confirmation Checkbox & Purchase Button */}
                    <div className="border-t border-border/50 pt-8">
                      <div className="flex items-start gap-3 mb-6 p-4 bg-secondary/20 rounded-lg">
                        <Checkbox 
                          id="audit-confirm"
                          checked={auditConfirmed}
                          onCheckedChange={(checked) => setAuditConfirmed(checked as boolean)}
                          className="mt-0.5"
                        />
                        <label 
                          htmlFor="audit-confirm" 
                          className="text-sm cursor-pointer leading-relaxed"
                        >
                          I understand this audit focuses on rights clarity and sync readiness, not placements or guarantees.
                        </label>
                      </div>

                      <Button 
                        variant="maroon" 
                        size="lg"
                        className="w-full md:w-auto"
                        onClick={() => handlePurchase(service.paymentLink)}
                        disabled={!auditConfirmed}
                      >
                        Purchase Catalog Audit - ${service.price}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

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
