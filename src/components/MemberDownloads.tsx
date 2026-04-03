import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Package, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Define individual downloadable items (not bundles)
const MEMBER_DOWNLOADS = [
  {
    id: 'just-make-noise-ebook',
    title: 'Just Make Noise eBook',
    description: 'A clear, no-fluff guide for independent artists who want to stop guessing and start building a real music business.',
    downloadFile: '/downloads/Just_Make_Noise_eBook.pdf',
  },
  {
    id: 'be-loud-ebook',
    title: 'Be Loud eBook',
    description: 'A practical blueprint for producers who want daily income from beats without racing to the bottom.',
    downloadFile: '/downloads/Be_Loud_eBook.pdf',
  },
  {
    id: 'split-sheet',
    title: 'Split Sheet w/ One Stop Agreement',
    description: 'Professional split sheet template with a built-in one stop licensing agreement.',
    downloadFile: '/downloads/Split_Sheet_Modernnostalgia.club.pdf',
  },
  {
    id: 'pro-tools-template',
    title: 'Pro Tools Intro Recording Template',
    description: 'Ready-to-use recording template for Pro Tools Intro.',
    downloadFile: '/downloads/Pro_Tools_Intro_Template_-_MNC.zip',
    externalLink: { label: 'Download Pro Tools Intro (Free from Avid)', url: 'https://www.avid.com/pro-tools' },
  },
];

export function MemberDownloads() {
  const handleDownload = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  const getFileName = (path: string) => {
    return path.split('/').pop()?.replace(/_/g, ' ').replace(/\.(pdf|zip)$/i, '') || path;
  };

  return (
    <motion.div variants={fadeIn} className="mb-12">
      <Card variant="elevated" className="p-6 border-maroon/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg" style={{ background: 'hsl(217 100% 50% / 0.12)' }}>
            <Package className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="font-display text-xl">Member Downloads</h2>
            <p className="text-sm text-muted-foreground">Free resources included with your membership</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEMBER_DOWNLOADS.map((item) => (
            <Card key={item.id} variant="feature" className="overflow-hidden">
              <div className="p-4">
                <h3 className="font-display text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                
                {/* External link (e.g., Avid.com) */}
                {item.externalLink && (
                  <a
                    href={item.externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-maroon hover:underline mb-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {item.externalLink.label}
                  </a>
                )}

                {/* Download button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleDownload(item.downloadFile)}
                >
                  <FileText className="w-4 h-4" />
                  <span className="truncate">{getFileName(item.downloadFile)}</span>
                  <Download className="w-4 h-4 ml-auto" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
