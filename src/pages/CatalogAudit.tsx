import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  Target,
  Shield,
  FileText,
  Users,
  XCircle,
  Quote,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
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

const testimonials = [
  {
    quote: "I thought my catalog was ready. The audit showed me three songs with unregistered co-writers. Those would have killed any deal.",
    author: "Marcus T.",
    role: "Independent R&B Artist"
  },
  {
    quote: "Finally, someone who speaks licensing—not lawyer jargon. The summary was clear and actionable. I fixed everything in a week.",
    author: "Janelle W.",
    role: "Producer / Artist"
  },
  {
    quote: "Worth every penny. I've been guessing for years. Now I actually know what's ready and what's not.",
    author: "Derek M.",
    role: "Hip-Hop Producer"
  }
];

const whatsIncluded = [
  'Review of up to 10 songs from your catalog',
  'Ownership and split structure check',
  'Collaborator and PRO registration review',
  'Sample, cover, and clearance risk flags',
  'Delivery readiness (instrumentals, stems, metadata)',
  'Sync suitability notes (film, TV, ads, trailers, social)',
  'Written summary with clear next steps',
];

const walkAwayWith = [
  'A clear "license / don\'t license yet" view of your catalog',
  'A list of fixable issues ranked by urgency',
  'Confidence before pitching to supervisors or libraries',
  'A cleaner, more usable catalog long-term',
];

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

export default function CatalogAudit() {
  const [auditConfirmed, setAuditConfirmed] = useState(false);

  const handlePurchase = () => {
    window.open('https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-catalog-audit-placeholder', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background studio-grain flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16" id="main-content">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 bg-maroon/20 text-maroon border-maroon/30">Professional Service</Badge>
            </motion.div>
            <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-6xl font-display tracking-wide mb-6"
            >
              Catalog Audit for Sync
            </motion.h1>
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            >
              A professional review of your music catalog to identify ownership risks, sync blockers, and missed opportunities before pitching or licensing.
            </motion.p>
            <motion.div variants={fadeIn} className="flex items-center justify-center gap-4">
              <span className="text-4xl md:text-5xl font-display text-maroon">$249</span>
              <Button 
                variant="maroon" 
                size="lg"
                onClick={() => document.getElementById('book-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Book Your Audit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Problem Statement */}
        <section className="bg-secondary/20 py-16 mb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-3xl mx-auto"
            >
              <motion.div variants={fadeIn} className="text-center">
                <h2 className="text-2xl md:text-3xl font-display tracking-wide mb-6">
                  Most music doesn't fail in sync because it sounds bad.
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  It fails because something small and structural makes it unusable.
                </p>
                <p className="text-foreground/80">
                  The Catalog Audit for Sync is a one-on-one review designed to surface those issues early, 
                  so you don't lose deals after interest is shown.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-6 mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-display tracking-wide mb-4">What's Included</h2>
              <p className="text-muted-foreground">
                A comprehensive structural review of your catalog
              </p>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card variant="elevated" className="p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {whatsIncluded.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* What You'll Walk Away With */}
        <section className="bg-maroon/5 py-16 mb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeIn} className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-maroon" />
                  <h2 className="text-3xl md:text-4xl font-display tracking-wide">What You'll Walk Away With</h2>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-6">
                {walkAwayWith.map((item, i) => (
                  <Card key={i} className="p-6 bg-background/50 border-maroon/20">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-maroon/20 rounded-lg">
                        <Shield className="w-5 h-5 text-maroon" />
                      </div>
                      <p className="text-foreground/90 font-medium">{item}</p>
                    </div>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Who This Is For / What This Is Not */}
        <section className="container mx-auto px-6 mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={fadeIn}>
                <Card className="p-6 h-full border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-primary" />
                    <h3 className="font-display text-xl">Who This Is For</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Artists preparing to pitch for sync</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Producers managing multiple collaborators</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Managers or reps vetting catalogs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Artists tired of guessing why nothing lands</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="p-6 h-full border-destructive/20 bg-destructive/5">
                  <div className="flex items-center gap-3 mb-6">
                    <XCircle className="w-6 h-6 text-destructive" />
                    <h3 className="font-display text-xl">What This Is Not</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <span>Legal representation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <span>Guaranteed placements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <span>Creative feedback or song critique</span>
                    </li>
                  </ul>
                  <p className="text-sm text-foreground/80 mt-6 italic border-t border-border/50 pt-4">
                    This is about structure, not taste.
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="bg-secondary/20 py-16 mb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-5xl mx-auto"
            >
              <motion.div variants={fadeIn} className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-display tracking-wide mb-4">What Artists Are Saying</h2>
              </motion.div>

              <motion.div variants={fadeIn} className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, i) => (
                  <Card key={i} className="p-6 bg-background">
                    <Quote className="w-8 h-8 text-maroon/30 mb-4" />
                    <p className="text-foreground/80 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="border-t border-border/50 pt-4">
                      <p className="font-display text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeIn} className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="w-8 h-8 text-maroon" />
                <h2 className="text-3xl md:text-4xl font-display tracking-wide">Is This Right for You?</h2>
              </div>
              <p className="text-muted-foreground">
                Read this before booking. It'll save you time and money.
              </p>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {catalogAuditFAQ.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="border border-border/50 rounded-lg px-5 bg-secondary/10"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5">
                      <span className="font-medium">
                        Q{index + 1}. {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <p className="text-muted-foreground mb-2">{faq.answer}</p>
                      {faq.recommendation && (
                        <p className="text-sm text-foreground/80 font-medium mt-3">
                          <span className="text-maroon">Better next step:</span> {faq.recommendation}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </motion.div>
        </section>

        {/* Booking CTA Section */}
        <section id="book-section" className="container mx-auto px-6 mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <Card variant="elevated" className="p-8 md:p-10 border-maroon/30 text-center">
                <div className="p-4 bg-maroon/20 rounded-full w-fit mx-auto mb-6">
                  <ClipboardCheck className="w-10 h-10 text-maroon" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-display tracking-wide mb-4">
                  Book Your Catalog Audit
                </h2>
                
                <p className="text-4xl font-display text-maroon mb-6">$249</p>
                
                <p className="text-muted-foreground mb-8">
                  After purchase, you'll receive a booking form via email to schedule your audit session.
                </p>

                <div className="flex items-start gap-3 mb-6 p-4 bg-secondary/20 rounded-lg text-left">
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
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={!auditConfirmed}
                >
                  Purchase Catalog Audit - $249
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  Secure checkout powered by Intuit.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
