import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STORE_PRODUCTS } from '@/lib/storeProducts';
import { Download, Package, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

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
          <div className="p-3 bg-maroon/20 rounded-lg">
            <Package className="w-6 h-6 text-maroon" />
          </div>
          <div>
            <h2 className="font-display text-xl">Member Downloads</h2>
            <p className="text-sm text-muted-foreground">Free resources included with your membership</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STORE_PRODUCTS.map((product) => (
            <Card key={product.id} variant="feature" className="overflow-hidden">
              {/* Cover Image */}
              {product.coverImage && coverImages[product.coverImage] && (
                <div className="aspect-[3/2] overflow-hidden bg-muted">
                  <img 
                    src={coverImages[product.coverImage]} 
                    alt={product.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-lg">{product.title}</h3>
                  {product.isBundle && (
                    <Badge variant="secondary" className="text-xs">Bundle</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                
                {/* External links (e.g., Avid.com) */}
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

                {/* Download files */}
                <div className="space-y-2">
                  {product.downloadFiles.map((file) => (
                    <Button
                      key={file}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => handleDownload(file)}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{getFileName(file)}</span>
                      <Download className="w-4 h-4 ml-auto" />
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
