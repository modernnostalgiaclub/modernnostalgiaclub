import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import storeHero from '@/assets/store-hero.jpg';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { STORE_PRODUCTS } from '@/lib/storeProducts';
import { ClipboardCheck, CheckCircle2, HelpCircle, CheckCircle, Loader2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

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

const PRODUCT_PHOTOS: Record<string, string> = {
  'split-sheet': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  'pro-tools-template': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
  'just-make-noise-bundle': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&q=80',
  'be-loud-bundle': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80',
  'catalog-audit': 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80',
};

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function Store() {
  const [auditConfirmed, setAuditConfirmed] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const auditFullRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const handlePurchase = async (productId: string) => {
    setLoadingProductId(productId);
    try {
      const { data, error } = await supabase.functions.invoke('create-store-checkout', {
        body: { product_id: productId },
      });
      if (error || !data?.url) throw new Error(error?.message || 'Could not create checkout session');
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleBookAudit = () => {
    auditFullRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nonServiceProducts = STORE_PRODUCTS.filter(p => !p.isService);
  const serviceProduct = STORE_PRODUCTS.find(p => p.isService);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1" id="main-content">
        {/* Hero */}
        <section className="relative h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${storeHero})` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 47% 4% / 0.85) 0%, hsl(222 47% 4% / 0.6) 50%, hsl(217 100% 10% / 0.5) 100%)' }} />
        </section>

        {/* Title */}
        <section>
          <div className="container mx-auto px-6 pt-12 pb-8">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-400 mb-3">Shop</p>
            <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight leading-[1.05] mb-4 text-black">
              The Store
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              Professional templates, guides, and services for independent artists.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-6 pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-5xl mx-auto"
          >

            {/* Legal Disclaimer */}
            <motion.div variants={fadeIn} className="mb-10">
              <div className="flex items-start gap-3 !bg-gray-50 border !border-gray-200 rounded-lg px-5 py-4">
                <span className="!text-gray-400 mt-0.5 shrink-0 text-base">⚖️</span>
                <p className="text-xs !text-gray-500 leading-relaxed">
                  <span className="font-semibold !text-gray-900">Legal Disclaimer:</span> We are not lawyers. Nothing in this store constitutes legal advice. The templates and documents provided — including the Split Sheet and One Stop Agreement — are designed to give independent artists a practical starting point for documenting splits and licensing terms. They are not a substitute for professional legal counsel.
                </p>
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div variants={fadeIn} className="mb-16">
              <h2 className="text-2xl font-display !text-gray-900 mb-6">Resources & Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {nonServiceProducts.map((product) => (
                  <div key={product.id} className="!bg-white border !border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="h-44 overflow-hidden">
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
                          <span className="text-[10px] font-semibold uppercase tracking-wider !text-amber-700 !bg-amber-50 px-2 py-0.5 rounded">Bundle</span>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-wider !text-gray-500 !bg-gray-100 px-2 py-0.5 rounded">Template</span>
                        )}
                        <span className="text-lg font-display text-maroon">${product.price}</span>
                      </div>

                      <h3 className="font-display text-sm !text-gray-900 mb-2 leading-snug">{product.title}</h3>
                      <p className="!text-gray-500 text-xs line-clamp-3 mb-4 flex-1">{product.description}</p>

                      {product.externalLinks?.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-maroon hover:underline mb-3"
                        >
                          {link.label}
                        </a>
                      ))}

                      <Button
                        variant="maroon"
                        size="sm"
                        className="w-full mt-auto text-xs"
                        onClick={() => addItem(product.id)}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add to Cart — ${product.price}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Catalog Audit Full Detail Section */}
            {serviceProduct && (
              <motion.div variants={fadeIn} ref={auditFullRef} className="mb-16">
                <div className="!bg-white border !border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={PRODUCT_PHOTOS['catalog-audit']}
                    alt="Person listening to music with headphones in a studio"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-maroon/10 rounded-lg">
                          <ClipboardCheck className="w-8 h-8 text-maroon" />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-maroon !bg-red-50 px-2 py-0.5 rounded mb-2 inline-block">Professional Service</span>
                          <h3 className="font-display text-2xl md:text-3xl !text-gray-900">{serviceProduct.title}</h3>
                        </div>
                      </div>
                      <p className="text-3xl md:text-4xl font-display text-maroon">${serviceProduct.price}</p>
                    </div>

                    <p className="text-base !text-gray-500 mb-6">{serviceProduct.description}</p>

                    {serviceProduct.fullDescription && (
                      <div className="mb-6">
                        {serviceProduct.fullDescription.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="!text-gray-600 text-sm mb-4">{paragraph}</p>
                        ))}
                      </div>
                    )}

                    {serviceProduct.whatsIncluded && (
                      <div className="!bg-gray-50 rounded-lg p-6 mb-6">
                        <h4 className="font-display text-lg !text-gray-900 mb-4">What's Included</h4>
                        <ul className="space-y-2">
                          {serviceProduct.whatsIncluded.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                              <span className="!text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-display text-lg !text-gray-900 mb-3">Who This Is For</h4>
                        <ul className="space-y-2 text-sm !text-gray-500">
                          <li>• Artists preparing to pitch for sync</li>
                          <li>• Producers managing multiple collaborators</li>
                          <li>• Managers or reps vetting catalogs</li>
                          <li>• Artists tired of guessing why nothing lands</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-display text-lg !text-gray-900 mb-3">What This Is Not</h4>
                        <ul className="space-y-2 text-sm !text-gray-500">
                          <li>• Legal representation</li>
                          <li>• Guaranteed placements</li>
                          <li>• Creative feedback or song critique</li>
                        </ul>
                        <p className="text-sm !text-gray-600 mt-3 italic">This is about structure, not taste.</p>
                      </div>
                    </div>

                    {/* FAQ */}
                    <div className="border-t !border-gray-200 pt-8 mb-8">
                      <div className="flex items-center gap-3 mb-6">
                        <HelpCircle className="w-6 h-6 text-maroon" />
                        <h4 className="font-display text-xl !text-gray-900">Is the Catalog Audit Right for You?</h4>
                      </div>
                      <p className="!text-gray-500 mb-6">
                        Read this before booking. It'll save you time and money.
                      </p>

                      <Accordion type="single" collapsible className="w-full space-y-2">
                        {catalogAuditFAQ.map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`faq-${index}`}
                            className="border !border-gray-200 rounded-lg px-4 !bg-gray-50/50"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-4">
                              <span className="font-medium text-sm md:text-base !text-gray-900">
                                Q{index + 1}. {faq.question}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <p className="!text-gray-500 text-sm mb-2">{faq.answer}</p>
                              {faq.recommendation && (
                                <p className="text-sm !text-gray-700 font-medium mt-3">
                                  <span className="text-maroon">Better next step:</span> {faq.recommendation}
                                </p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>

                    {/* Confirmation & Purchase */}
                    <div className="border-t !border-gray-200 pt-8">
                      <div className="flex items-start gap-3 mb-6 p-4 !bg-gray-50 rounded-lg">
                        <Checkbox
                          id="audit-confirm"
                          checked={auditConfirmed}
                          onCheckedChange={(checked) => setAuditConfirmed(checked as boolean)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="audit-confirm"
                          className="text-sm cursor-pointer leading-relaxed !text-gray-700"
                        >
                          I understand this audit focuses on rights clarity and sync readiness, not placements or guarantees.
                        </label>
                      </div>

                      <Button
                        variant="maroon"
                        size="lg"
                        className="w-full md:w-auto"
                        onClick={() => addItem(serviceProduct.id)}
                        disabled={!auditConfirmed}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart — ${serviceProduct.price}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer note */}
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-sm !text-gray-400">
                Secure checkout powered by Stripe. Downloads are available immediately after purchase.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
