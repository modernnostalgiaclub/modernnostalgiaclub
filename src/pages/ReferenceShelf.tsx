import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';

import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Music, 
  ExternalLink,
  Play,
  HelpCircle,
  CheckCircle,
  Download,
  Wrench,
  Calendar,
  Lock,
  
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

// Fallback tracks used if database is empty
const fallbackTracks = [
  {
    id: '1',
    title: 'Example Sync Song',
    artist: 'Lab Example',
    type: 'Approved Example',
    description: 'A properly structured sync-ready track with complete metadata and alternate versions.',
    link: 'https://s.disco.ac/yqpvfrvazuwo',
    is_download: false,
    is_internal: false,
  },
  {
    id: '2',
    title: 'The Free Artist Survival Guide',
    artist: 'Modernnostalgia.club',
    type: 'Free Download',
    description: 'A comprehensive manifesto on Direct-to-Fan strategies, sync licensing, and building a sustainable music career.',
    link: '/downloads/The_Free_Artist_Survival_Guide.pdf',
    is_download: true,
    is_internal: false,
  },
  {
    id: '3',
    title: '30-Day Implementation Tracker',
    artist: 'Modernnostalgia.club',
    type: 'Members Only',
    description: 'A printable 30-day action plan to organize, create, publish, and monetize your music career. Available to logged-in members.',
    link: '/reference/30-day-tracker',
    is_download: false,
    is_internal: true,
  },
];

// Fallback resources used if database is empty
const fallbackResources = [
  {
    id: '1',
    title: 'NAV Business Credit',
    description: 'Build business credit and access funding options for your music career.',
    url: 'https://nav.nkwcmr.net/7a49Dy',
    category: 'Business',
  },
  {
    id: '2',
    title: 'DISCO',
    description: 'Industry-standard platform for music delivery and catalog management.',
    url: 'https://disco.ac/signup?b=5076&u=23831',
    category: 'Music Tools',
  },
  {
    id: '3',
    title: 'Swayzio',
    description: 'Music management and sync licensing platform for independent artists.',
    url: 'https://swayzio.com/?via=GeOh',
    category: 'Music Tools',
  },
  {
    id: '4',
    title: 'Lovable',
    description: 'Build websites and apps for your music brand without coding.',
    url: 'https://lovable.dev/invite/VK4R8ZA',
    category: 'Tech Tools',
  },
  {
    id: '5',
    title: 'Pro Tools Intro',
    description: 'Free DAW to start recording and producing your music at home.',
    url: 'https://www.avid.com/pro-tools',
    category: 'Recording',
  },
  {
    id: '6',
    title: 'ASCAP',
    description: 'Performance Rights Organization - register your songs to collect royalties.',
    url: 'https://www.ascap.com',
    category: 'Business',
  },
  {
    id: '7',
    title: 'BMI',
    description: 'Performance Rights Organization - another option for royalty collection.',
    url: 'https://www.bmi.com',
    category: 'Business',
  },
];

type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  type: string;
  description: string | null;
  link: string;
  is_download: boolean | null;
  is_internal: boolean | null;
};

// Case studies removed - replaced with AI Money Coach

export default function ReferenceShelf() {
  const { user, signInWithPatreon } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from('reference_resources')
        .select('id, title, description, url, category')
        .eq('is_published', true)
        .order('sort_order');

      if (error || !data || data.length === 0) {
        setResources(fallbackResources);
      } else {
        setResources(data);
      }
      setLoadingResources(false);
    }

    async function fetchTracks() {
      const { data, error } = await supabase
        .from('example_tracks')
        .select('id, title, artist, type, description, link, is_download, is_internal')
        .eq('is_published', true)
        .order('sort_order');

      if (error || !data || data.length === 0) {
        setTracks(fallbackTracks);
      } else {
        setTracks(data);
      }
      setLoadingTracks(false);
    }

    fetchResources();
    fetchTracks();
  }, []);
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
            
            {/* Example Tracks & Resources */}
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                <Music className="w-6 h-6 text-maroon" />
                Example Tracks & Downloads
              </h2>
              {loadingTracks ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tracks.map((track) => (
                    <Card key={track.id} variant="feature">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs text-maroon uppercase tracking-wider">{track.type}</span>
                            <CardTitle className="mt-1">{track.title}</CardTitle>
                            <CardDescription className="mt-2">{track.description}</CardDescription>
                          </div>
                          {track.is_internal ? (
                            user ? (
                              <Button variant="maroon" size="icon" asChild>
                                <Link to={track.link}>
                                  <Calendar className="w-4 h-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="icon" disabled>
                                <Lock className="w-4 h-4" />
                              </Button>
                            )
                          ) : (
                            <Button variant="maroon" size="icon" asChild>
                              <a 
                                href={track.link} 
                                target={track.is_download ? "_self" : "_blank"} 
                                rel={track.is_download ? undefined : "noopener noreferrer"}
                                download={track.is_download ? true : undefined}
                              >
                                {track.is_download ? <Download className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">by {track.artist}</span>
                          {track.is_internal ? (
                            user ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link to={track.link}>
                                  Open Tracker
                                  <ExternalLink className="ml-2 w-4 h-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => signInWithPatreon()}
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Log in to access
                              </Button>
                            )
                          ) : (
                            <Button variant="outline" size="sm" asChild>
                              <a 
                                href={track.link} 
                                target={track.is_download ? "_self" : "_blank"} 
                                rel={track.is_download ? undefined : "noopener noreferrer"}
                                download={track.is_download ? true : undefined}
                              >
                                {track.is_download ? 'Download PDF' : 'View on DISCO'}
                                {track.is_download ? <Download className="ml-2 w-4 h-4" /> : <ExternalLink className="ml-2 w-4 h-4" />}
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Resources */}
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-maroon" />
                Artist Resources
              </h2>
              <p className="text-muted-foreground mb-6">
                Essential tools and services mentioned in The Free Artist Survival Guide. Start building your sustainable music career.
              </p>
              {loadingResources ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource.id} variant="feature" className="hover:scale-[1.01] transition-transform">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs text-maroon uppercase tracking-wider">{resource.category}</span>
                            <CardTitle className="text-lg mt-1">{resource.title}</CardTitle>
                          </div>
                          <Button variant="maroon" size="icon" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
            
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
