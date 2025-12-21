import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Music, 
  FileText, 
  BarChart3,
  ExternalLink,
  Play,
  HelpCircle,
  CheckCircle,
  Upload,
  Link,
  Share2
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
            
            {/* DISCO Setup Guide */}
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-maroon" />
                DISCO Setup Guide
              </h2>
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Getting Started with DISCO</CardTitle>
                  <CardDescription>
                    DISCO is the industry-standard platform for delivering music to sync supervisors, labels, and publishers. 
                    All Lab submissions require a DISCO link.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Start Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-maroon/20 flex items-center justify-center">
                          <span className="font-display text-maroon">1</span>
                        </div>
                        <h4 className="font-medium">Create Account</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sign up for a free DISCO account using our referral link below.
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-maroon/20 flex items-center justify-center">
                          <span className="font-display text-maroon">2</span>
                        </div>
                        <h4 className="font-medium">Upload Tracks</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload your music with complete metadata (title, artist, genre, mood, tempo).
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-maroon/20 flex items-center justify-center">
                          <span className="font-display text-maroon">3</span>
                        </div>
                        <h4 className="font-medium">Share Playlist</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Create a playlist and copy the share link to submit in the Studio Floor.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button variant="maroon" size="lg" asChild>
                      <a href="https://disco.ac/signup?b=5076&u=23831" target="_blank" rel="noopener noreferrer">
                        Create Free DISCO Account
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </div>

                  {/* FAQ Accordion */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="what-is-disco">
                      <AccordionTrigger>What is DISCO?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          DISCO is the music industry's leading platform for music delivery and catalog management. 
                          Used by major labels, sync agents, and music supervisors worldwide, it's the professional 
                          standard for sharing music. When you use DISCO, you're speaking the same language as 
                          industry professionals.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="why-disco">
                      <AccordionTrigger>Why does the Lab use DISCO?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          We use DISCO because it mirrors real-world sync licensing workflows. When you learn to 
                          organize and deliver music through DISCO, you're building skills that directly translate 
                          to professional opportunities. It also ensures consistent, high-quality audio delivery 
                          for all submissions.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="is-it-free">
                      <AccordionTrigger>Is DISCO free?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          DISCO offers a free tier that's perfect for getting started. You can upload tracks, 
                          create playlists, and share links at no cost. Paid plans offer additional features 
                          like analytics and larger storage, but the free tier has everything you need for 
                          Lab submissions.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="how-to-share">
                      <AccordionTrigger>How do I get a share link?</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-muted-foreground">
                          <p>To get a shareable DISCO link:</p>
                          <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Upload your track(s) to DISCO</li>
                            <li>Create a playlist and add your tracks</li>
                            <li>Click the "Share" button on your playlist</li>
                            <li>Copy the share link (starts with https://disco.ac/)</li>
                            <li>Paste this link when submitting in the Studio Floor</li>
                          </ol>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="metadata-tips">
                      <AccordionTrigger>What metadata should I include?</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-muted-foreground">
                          <p>Complete metadata increases your chances of sync placement:</p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-maroon mt-0.5 shrink-0" />
                              <span><strong>Title:</strong> Clear, descriptive name</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-maroon mt-0.5 shrink-0" />
                              <span><strong>Artist/Composer:</strong> Your professional name</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-maroon mt-0.5 shrink-0" />
                              <span><strong>Genre:</strong> Primary and secondary genres</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-maroon mt-0.5 shrink-0" />
                              <span><strong>Mood/Energy:</strong> Emotional descriptors</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-maroon mt-0.5 shrink-0" />
                              <span><strong>Tempo (BPM):</strong> Beats per minute</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-maroon mt-0.5 shrink-0" />
                              <span><strong>Instrumentation:</strong> Key instruments used</span>
                            </li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
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
