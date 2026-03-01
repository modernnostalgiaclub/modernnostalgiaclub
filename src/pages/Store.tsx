import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { STORE_PRODUCTS } from '@/lib/storeProducts';
import { ShoppingCart, Package, ExternalLink, Star, ClipboardCheck, CheckCircle2, HelpCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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

// Stock photo map per product ID
const PRODUCT_PHOTOS: Record<string, string> = {
  'split-sheet': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
  'pro-tools-template': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&q=80',
  'just-make-noise-bundle': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&q=80',
  'be-loud-bundle': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
};

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function Store() {
  const [auditConfirmed, setAuditConfirmed] = useState(false);
  const [showJotForm, setShowJotForm] = useState(false);
  const jotformRef = useRef<HTMLDivElement>(null);

  const handlePurchase = (paymentLink: string) => {
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
  };

  const handleApplyNow = () => {
    setShowJotForm(true);
    setTimeout(() => {
      jotformRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const nonServiceProducts = STORE_PRODUCTS.filter(p => !p.isService);
  const serviceProducts = STORE_PRODUCTS.filter(p => p.isService);

  return (
    <div className="min-h-screen bg-background studio-grain flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16" id="main-content">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display mb-4">Artist Store</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional templates, guides, and resources to level up your music career.
              </p>
            </motion.div>

            {/* Products Grid */}
            <motion.div variants={fadeIn} className="mb-16">
              <h2 className="text-2xl font-display mb-8">Resources &amp; Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {nonServiceProducts.map((product) => (
                  <Card key={product.id} variant="elevated" className="overflow-hidden flex flex-col">
                    {/* Stock Photo */}
                    <div className="h-48 overflow-hidden bg-secondary/30">
                      <img
                        src={PRODUCT_PHOTOS[product.id] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        {product.isBundle ? (
                          <Badge className="bg-amber/20 text-amber border-amber/30">Bundle</Badge>
                        ) : (
                          <Badge variant="secondary">Template</Badge>
                        )}
                        <p className="text-xl font-display text-maroon">${product.price}</p>
                      </div>

                      <h3 className="font-display text-base mb-2 leading-tight">{product.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{product.description}</p>

                      {product.externalLinks?.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-maroon hover:underline mb-3"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {link.label}
                        </a>
                      ))}

                      <Button
                        variant="maroon"
                        size="sm"
                        className="w-full mt-auto"
                        onClick={() => handlePurchase(product.paymentLink)}
                      >
                        Purchase — ${product.price}
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Memberships Section */}
            <motion.div variants={fadeIn} className="mb-16">
              <h2 className="text-2xl font-display mb-2">Memberships</h2>
              <p className="text-muted-foreground mb-8">Join the club and unlock everything, or go deeper with the Lab.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lab Pass */}
                <div className="bg-card border border-border rounded-lg p-8 relative flex flex-col">
                  <div className="mb-6">
                    <h3 className="font-display text-2xl mb-2">Lab Pass</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display text-foreground">$5</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 text-sm">Get your foot in the door. Access the fundamentals.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      'Dashboard access',
                      'Classroom training tracks',
                      'Community discussions',
                      'Audio submissions',
                      'All store downloads free',
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login?tab=signup">Get Started</Link>
                  </Button>
                </div>

                {/* Creator Accelerator */}
                <div className="bg-card border-2 border-maroon rounded-lg p-8 relative flex flex-col">
                  <div className="absolute -top-3 left-6">
                    <span className="bg-maroon text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-display text-2xl mb-2">Creator Accelerator</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display text-maroon">$10</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 text-sm">Professional workflows. Priority access. Real feedback.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      'Everything in Lab Pass',
                      'Studio Floor access',
                      'Priority submissions',
                      'Professional feedback',
                      'Sync workflow training',
                      'Direct-to-fan systems',
                    ].map((feature, i) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle className={`w-4 h-4 shrink-0 ${i === 0 ? 'text-muted-foreground' : 'text-maroon'}`} />
                        <span className={i === 0 ? 'text-muted-foreground' : 'text-foreground'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="maroon" className="w-full" asChild>
                    <a href="https://www.patreon.com/modernnostalgia" target="_blank" rel="noopener noreferrer">
                      Start Training
                    </a>
                  </Button>
                </div>

                {/* Creative Economy Lab */}
                <div className="bg-card border border-border rounded-lg p-8 relative flex flex-col">
                  <div className="absolute -top-3 left-6">
                    <span className="bg-amber/20 text-amber border border-amber/30 text-xs font-medium px-3 py-1 rounded-full">
                      By Application
                    </span>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-display text-2xl mb-2">Creative Economy Lab</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display text-amber">$150</span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 text-sm">Serious artists only. Deep work, real results.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      'Everything in Creator Accelerator',
                      '1-on-1 strategy sessions',
                      'Sync catalog review',
                      'Priority feedback',
                      'Network access',
                    ].map((feature, i) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle className={`w-4 h-4 shrink-0 ${i === 0 ? 'text-muted-foreground' : 'text-amber'}`} />
                        <span className={i === 0 ? 'text-muted-foreground' : 'text-foreground'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full border-amber/50 text-amber hover:bg-amber/10"
                    onClick={handleApplyNow}
                  >
                    Apply Now — $150 one-time
                  </Button>
                </div>
              </div>

              {/* JotForm Embed */}
              {showJotForm && (
                <div ref={jotformRef} className="mt-8 rounded-xl border border-border overflow-hidden">
                  <div className="p-4 bg-secondary/30 border-b border-border">
                    <h3 className="font-display text-lg">Creative Economy Lab Application</h3>
                    <p className="text-sm text-muted-foreground">Complete the form below to apply for the $150 one-time program.</p>
                  </div>
                  <iframe
                    src="https://pci.jotform.com/form/253309376850058"
                    title="Creative Economy Lab Application"
                    width="100%"
                    height="700"
                    frameBorder="0"
                    scrolling="yes"
                    className="block"
                    allow="geolocation; microphone; camera"
                  />
                </div>
              )}
            </motion.div>

            {/* Catalog Audit Service — Featured Section */}
            {serviceProducts.map((service) => (
              <motion.div key={service.id} variants={fadeIn} className="mt-4">
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
                        Purchase Catalog Audit — ${service.price}
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
