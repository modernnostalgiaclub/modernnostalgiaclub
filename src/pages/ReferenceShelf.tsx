import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Music, 
  FileText, 
  BarChart3,
  ExternalLink,
  Play
} from 'lucide-react';

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

const exampleTracks = [
  {
    id: '1',
    title: 'Sync-Ready Instrumental',
    artist: 'Lab Example',
    type: 'Approved Example',
    description: 'A properly structured sync-ready track with complete metadata.',
    discoLink: 'https://disco.ac/playlist/example',
  },
  {
    id: '2',
    title: 'Before & After: Catalog Organization',
    artist: 'Case Study',
    type: 'Case Study',
    description: 'How one artist reorganized their catalog for better sync opportunities.',
    discoLink: 'https://disco.ac/playlist/example2',
  },
];

const caseStudies = [
  {
    id: '1',
    title: 'From Zero to Sync: A 6-Month Journey',
    category: 'Sync Licensing',
    reads: 156,
  },
  {
    id: '2',
    title: 'Building a $2k/mo Direct-to-Fan Income',
    category: 'Direct Revenue',
    reads: 243,
  },
  {
    id: '3',
    title: 'Metadata That Got Me Placed',
    category: 'Catalog Management',
    reads: 189,
  },
];

export default function ReferenceShelf() {
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
            <motion.div variants={fadeIn} className="mb-12">
              <SectionLabel className="mb-4">Reference Shelf</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Professional Archive
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Approved examples, case studies, and reference materials. Learn from what works.
              </p>
            </motion.div>
            
            {/* Example Tracks */}
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                <Music className="w-6 h-6 text-maroon" />
                Example Tracks
              </h2>
              <div className="space-y-4">
                {exampleTracks.map((track) => (
                  <Card key={track.id} variant="feature">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-maroon uppercase tracking-wider">{track.type}</span>
                          <CardTitle className="mt-1">{track.title}</CardTitle>
                          <CardDescription className="mt-2">{track.description}</CardDescription>
                        </div>
                        <Button variant="maroon" size="icon" asChild>
                          <a href={track.discoLink} target="_blank" rel="noopener noreferrer">
                            <Play className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">by {track.artist}</span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={track.discoLink} target="_blank" rel="noopener noreferrer">
                            View on DISCO
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            {/* Case Studies */}
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-maroon" />
                Case Studies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseStudies.map((study) => (
                  <Card key={study.id} variant="feature" className="cursor-pointer hover:scale-[1.02] transition-transform">
                    <CardHeader>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{study.category}</span>
                      <CardTitle className="text-lg mt-1">{study.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BarChart3 className="w-4 h-4" />
                        {study.reads} reads
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            {/* Reference Playlists */}
            <motion.div variants={fadeIn}>
              <h2 className="font-display text-2xl mb-6">Reference Playlists</h2>
              <Card variant="console" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium mb-1">Sync-Ready Examples</h3>
                    <p className="text-sm text-muted-foreground">Curated playlist of tracks that meet sync standards</p>
                  </div>
                  <Button variant="maroonOutline" asChild>
                    <a href="https://disco.ac" target="_blank" rel="noopener noreferrer">
                      Open in DISCO
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
