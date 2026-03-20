import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// Map product IDs to their downloadable files and titles
const PRODUCT_DOWNLOADS: Record<string, { title: string; files: { name: string; path: string }[]; isService?: boolean }> = {
  'split-sheet': {
    title: 'Split Sheet w/ One Stop Agreement',
    files: [{ name: 'Split Sheet & One Stop Agreement (PDF)', path: '/downloads/Split_Sheet_Modernnostalgia.club.pdf' }],
  },
  'pro-tools-template': {
    title: 'Pro Tools Intro Recording Template',
    files: [{ name: 'Pro Tools Intro Template (ZIP)', path: '/downloads/Pro_Tools_Intro_Template_-_MNC.zip' }],
  },
  'just-make-noise-bundle': {
    title: 'Just Make Noise: 2026 Indie Artist Bundle',
    files: [
      { name: 'Just Make Noise eBook (PDF)', path: '/downloads/Just_Make_Noise_eBook.pdf' },
      { name: 'Split Sheet & One Stop Agreement (PDF)', path: '/downloads/Split_Sheet_Modernnostalgia.club.pdf' },
      { name: 'Pro Tools Intro Template (ZIP)', path: '/downloads/Pro_Tools_Intro_Template_-_MNC.zip' },
    ],
  },
  'be-loud-bundle': {
    title: 'Be Loud: How to Make a Living Making Beats',
    files: [
      { name: 'Be Loud eBook (PDF)', path: '/downloads/Be_Loud_eBook.pdf' },
      { name: 'Split Sheet & One Stop Agreement (PDF)', path: '/downloads/Split_Sheet_Modernnostalgia.club.pdf' },
      { name: 'Pro Tools Intro Template (ZIP)', path: '/downloads/Pro_Tools_Intro_Template_-_MNC.zip' },
    ],
  },
  'catalog-audit': {
    title: 'Catalog Audit for Sync',
    files: [],
    isService: true,
  },
};

export default function StoreSuccess() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product') || '';
  const product = PRODUCT_DOWNLOADS[productId];

  return (
    <div className="min-h-screen bg-background studio-grain flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16" id="main-content">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-display mb-3">Purchase Complete!</h1>
            {product && (
              <p className="text-muted-foreground text-lg mb-8">
                You purchased <span className="text-foreground font-medium">{product.title}</span>
              </p>
            )}

            {/* Downloads or Service */}
            {product?.isService ? (
              <div className="bg-card border border-maroon/30 rounded-xl p-8 text-left mb-8">
                <h2 className="font-display text-xl mb-4 text-maroon">Next Steps</h2>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-maroon/20 text-maroon text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                    <span>You'll receive a confirmation email with booking instructions.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-maroon/20 text-maroon text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                    <span>Fill out the intake form with your catalog details.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-maroon/20 text-maroon text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                    <span>We'll review up to 10 songs and deliver your written summary.</span>
                  </li>
                </ol>
                <div className="mt-6 pt-6 border-t border-border/50">
                  <Button asChild className="gap-2" variant="maroon">
                    <a
                      href="https://form.jotform.com/253334227361048"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Your Audit Session
                    </a>
                  </Button>
                </div>
              </div>
            ) : product?.files.length ? (
              <div className="bg-card border border-border rounded-xl p-8 text-left mb-8">
                <h2 className="font-display text-xl mb-2">Your Downloads</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Click each file to download. Save these links — you can bookmark this page.
                </p>
                <ul className="space-y-3">
                  {product.files.map((file) => (
                    <li key={file.path}>
                      <a
                        href={file.path}
                        download
                        className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-maroon/50 hover:bg-maroon/5 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-maroon/10 flex items-center justify-center shrink-0 group-hover:bg-maroon/20 transition-colors">
                          <Download className="w-5 h-5 text-maroon" />
                        </div>
                        <span className="text-sm font-medium group-hover:text-maroon transition-colors">{file.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* CTA to join club */}
            <div className="bg-secondary/30 rounded-xl p-6 text-left mb-8 border border-border">
              <p className="text-sm font-medium mb-1">Want unlimited access to everything?</p>
              <p className="text-xs text-muted-foreground mb-4">
                Members get all store downloads free, plus courses, community, and more.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login?tab=signup">Join Modern Nostalgia Club</Link>
              </Button>
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/store">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
