import { useState, useEffect } from 'react';
import artistResourcesHero from '@/assets/artist-resources-hero.jpg';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { EmailCaptureDialog } from '@/components/EmailCaptureDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  ExternalLink,
  Play,
  CheckCircle,
  Download,
  Calendar,
  Lock,
  BookOpen,
  Music,
  GraduationCap,
  Briefcase,
  FolderOpen,
  Wrench,
  Monitor,
  Mic,
  MoreHorizontal,
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

// Fallback tracks
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

// Fallback resources
const fallbackResources = [
  { id: '1', title: 'NAV Business Credit', description: 'Build business credit and access funding options for your music career.', url: 'https://nav.nkwcmr.net/7a49Dy', category: 'Business' },
  { id: '2', title: 'DISCO', description: 'Industry-standard platform for music delivery and catalog management.', url: 'https://disco.ac/signup?b=5076&u=23831', category: 'Music Tools' },
  { id: '3', title: 'Swayzio', description: 'Music management and sync licensing platform for independent artists.', url: 'https://swayzio.com/?via=GeOh', category: 'Music Tools' },
  { id: '4', title: 'Lovable', description: 'Build websites and apps for your music brand without coding.', url: 'https://lovable.dev/invite/VK4R8ZA', category: 'Tech Tools' },
  { id: '5', title: 'Pro Tools Intro', description: 'Free DAW to start recording and producing your music at home.', url: 'https://www.avid.com/pro-tools', category: 'Recording' },
  { id: '6', title: 'ASCAP', description: 'Performance Rights Organization - register your songs to collect royalties.', url: 'https://www.ascap.com', category: 'Business' },
  { id: '7', title: 'BMI', description: 'Performance Rights Organization - another option for royalty collection.', url: 'https://www.bmi.com', category: 'Business' },
];

type Resource = { id: string; title: string; description: string | null; url: string; category: string };
type Track = { id: string; title: string; artist: string; type: string; description: string | null; link: string; is_download: boolean | null; is_internal: boolean | null };

// Category definitions with icons
const CATEGORIES = [
  { key: 'ebooks', label: 'eBooks', icon: BookOpen, matchCategories: ['ebook', 'ebooks', 'free download'] },
  { key: 'sync', label: 'Sync Licensing', icon: Music, matchCategories: ['sync', 'sync licensing'] },
  { key: 'courses', label: 'Courses', icon: GraduationCap, matchCategories: ['course', 'courses', 'members only'] },
  { key: 'business', label: 'Business Management', icon: Briefcase, matchCategories: ['business', 'business management'] },
  { key: 'music-mgmt', label: 'Music Management', icon: FolderOpen, matchCategories: ['music management'] },
  { key: 'music-tools', label: 'Music Tools', icon: Wrench, matchCategories: ['music tools', 'music'] },
  { key: 'tech', label: 'Tech Tools', icon: Monitor, matchCategories: ['tech tools', 'tech'] },
  { key: 'recording', label: 'Recording Tools', icon: Mic, matchCategories: ['recording', 'recording tools'] },
  { key: 'other', label: 'Other Tools', icon: MoreHorizontal, matchCategories: [] },
];

function categorizeResource(category: string): string {
  const lower = category.toLowerCase().trim();
  for (const cat of CATEGORIES) {
    if (cat.matchCategories.some(m => lower.includes(m))) return cat.key;
  }
  return 'other';
}

export default function ReferenceShelf() {
  const { user, signInWithPatreon } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const handleDownloadClick = (track: Track) => {
    setSelectedTrack(track);
    setEmailDialogOpen(true);
  };

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from('reference_resources')
        .select('id, title, description, url, category')
        .eq('is_published', true)
        .order('sort_order');
      setResources(!error && data?.length ? data : fallbackResources);
      setLoadingResources(false);
    }
    async function fetchTracks() {
      const { data, error } = await supabase
        .from('example_tracks')
        .select('id, title, artist, type, description, link, is_download, is_internal')
        .eq('is_published', true)
        .order('sort_order');
      setTracks(!error && data?.length ? data : fallbackTracks);
      setLoadingTracks(false);
    }
    fetchResources();
    fetchTracks();
  }, []);

  // Build categorized items: tracks become ebook/sync/course items, resources get categorized
  const buildCategorizedItems = () => {
    const sections: Record<string, Array<{ id: string; title: string; description: string | null; url: string; type?: string; artist?: string; isTrack?: boolean; isDownload?: boolean; isInternal?: boolean }>> = {};
    CATEGORIES.forEach(c => { sections[c.key] = []; });

    // Categorize tracks
    tracks.forEach(t => {
      const typeLower = (t.type || '').toLowerCase();
      let catKey = 'other';
      if (typeLower.includes('download') || typeLower.includes('ebook')) catKey = 'ebooks';
      else if (typeLower.includes('sync') || typeLower.includes('approved') || typeLower.includes('example')) catKey = 'sync';
      else if (typeLower.includes('member') || typeLower.includes('tracker')) catKey = 'courses';
      
      sections[catKey].push({
        id: t.id, title: t.title, description: t.description, url: t.link,
        type: t.type, artist: t.artist, isTrack: true, isDownload: !!t.is_download, isInternal: !!t.is_internal,
      });
    });

    // Categorize resources
    resources.forEach(r => {
      const catKey = categorizeResource(r.category);
      sections[catKey].push({ id: r.id, title: r.title, description: r.description, url: r.url });
    });

    return sections;
  };

  const sections = buildCategorizedItems();
  const isLoading = loadingResources || loadingTracks;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        <img
          src={artistResourcesHero}
          alt="Artist performing on stage"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-anton text-4xl md:text-6xl uppercase tracking-tight text-white mb-4"
          >
            Artist Resources
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/80 max-w-2xl mx-auto"
          >
            Everything you need to build, manage, and monetize your music career — organized and ready to use.
          </motion.p>
        </div>
      </div>

      <main className="pb-20 pt-12">
        <div className="container mx-auto px-6">

          {isLoading ? (
            <div className="max-w-5xl mx-auto space-y-12">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton className="h-8 w-48 mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(j => <Skeleton key={j} className="h-36 w-full" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-5xl mx-auto space-y-16"
            >
              {CATEGORIES.map(cat => {
                const items = sections[cat.key];
                if (!items || items.length === 0) return null;
                const Icon = cat.icon;

                return (
                  <motion.section key={cat.key} variants={fadeIn}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-anton text-2xl md:text-3xl uppercase tracking-tight text-gray-900">
                        {cat.label}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map(item => (
                        <ResourceCard
                          key={item.id}
                          item={item}
                          user={user}
                          signInWithPatreon={signInWithPatreon}
                          onDownloadClick={handleDownloadClick}
                          tracks={tracks}
                        />
                      ))}
                    </div>
                  </motion.section>
                );
              })}

              {/* DISCO Setup Guide */}
              <motion.section variants={fadeIn}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-anton text-2xl md:text-3xl uppercase tracking-tight text-gray-900">
                    DISCO Setup Guide
                  </h2>
                </div>

                <Card className="overflow-hidden bg-gray-50 border-gray-200">
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div>
                      <h3 className="font-anton text-xl uppercase tracking-tight text-gray-900 mb-2">Getting Started with DISCO</h3>
                      <p className="text-sm text-gray-500">
                        DISCO is the industry-standard platform for delivering music to sync supervisors, labels, and publishers. 
                        All Lab submissions require a DISCO link.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { step: '1', title: 'Create Account', desc: 'Sign up for a free DISCO account using our referral link below.' },
                        { step: '2', title: 'Upload Tracks', desc: 'Upload your music with complete metadata (title, artist, genre, mood, tempo).' },
                        { step: '3', title: 'Share Playlist', desc: 'Create a playlist and copy the share link to submit in the Studio Floor.' },
                      ].map(s => (
                        <div key={s.step} className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="font-anton text-primary text-sm">{s.step}</span>
                            </div>
                            <h4 className="font-medium text-gray-800">{s.title}</h4>
                          </div>
                          <p className="text-sm text-gray-500">{s.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <Button variant="default" size="lg" asChild>
                        <a href="https://disco.ac/signup?b=5076&u=23831" target="_blank" rel="noopener noreferrer">
                          Create Free DISCO Account
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="what-is-disco">
                        <AccordionTrigger>What is DISCO?</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-500">
                            DISCO is the music industry's leading platform for music delivery and catalog management. 
                            Used by major labels, sync agents, and music supervisors worldwide, it's the professional 
                            standard for sharing music.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="why-disco">
                        <AccordionTrigger>Why does the Lab use DISCO?</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-500">
                            We use DISCO because it mirrors real-world sync licensing workflows. When you learn to 
                            organize and deliver music through DISCO, you're building skills that directly translate 
                            to professional opportunities.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="is-it-free">
                        <AccordionTrigger>Is DISCO free?</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-500">
                            DISCO offers a free tier that's perfect for getting started. You can upload tracks, 
                            create playlists, and share links at no cost. Paid plans offer additional features 
                            like analytics and larger storage.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="how-to-share">
                        <AccordionTrigger>How do I get a share link?</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 text-gray-500">
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
                          <div className="space-y-3 text-gray-500">
                            <p>Complete metadata increases your chances of sync placement:</p>
                            <ul className="space-y-2">
                              {['Title: Clear, descriptive name', 'Artist/Composer: Your professional name', 'Genre: Primary and secondary genres', 'Mood/Energy: Emotional descriptors', 'Tempo (BPM): Beats per minute', 'Instrumentation: Key instruments used'].map(item => (
                                <li key={item} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                  <span><strong>{item.split(':')[0]}:</strong>{item.split(':').slice(1).join(':')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.section>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {selectedTrack && (
        <EmailCaptureDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          trackId={selectedTrack.id}
          trackTitle={selectedTrack.title}
          downloadLink={selectedTrack.link}
        />
      )}
    </div>
  );
}

// Individual resource card component
function ResourceCard({ item, user, signInWithPatreon, onDownloadClick, tracks }: {
  item: { id: string; title: string; description: string | null; url: string; type?: string; artist?: string; isTrack?: boolean; isDownload?: boolean; isInternal?: boolean };
  user: any;
  signInWithPatreon: () => void;
  onDownloadClick: (track: Track) => void;
  tracks: Track[];
}) {
  const renderAction = () => {
    if (item.isTrack) {
      const originalTrack = tracks.find(t => t.id === item.id);
      if (item.isInternal) {
        return user ? (
          <Button variant="default" size="sm" className="w-full mt-3" asChild>
            <Link to={item.url}>
              <Calendar className="w-4 h-4 mr-2" /> Open Tracker
            </Link>
          </Button>
        ) : (
          <Button variant="default" size="sm" className="w-full mt-3" onClick={() => signInWithPatreon()}>
            <Lock className="w-4 h-4 mr-2" /> Log in to access
          </Button>
        );
      }
      if (item.isDownload && originalTrack) {
        return (
          <Button variant="default" size="sm" className="w-full mt-3" onClick={() => onDownloadClick(originalTrack)}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
        );
      }
      return (
        <Button variant="default" size="sm" className="w-full mt-3" asChild>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <Play className="w-4 h-4 mr-2" /> Listen
          </a>
        </Button>
      );
    }

    return (
      <Button variant="default" size="sm" className="w-full mt-3" asChild>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          Visit <ExternalLink className="w-3.5 h-3.5 ml-2" />
        </a>
      </Button>
    );
  };

  return (
    <Card className="flex flex-col h-full bg-gray-50 border-gray-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      <CardContent className="p-5 flex flex-col flex-1">
        {item.type && (
          <span className="text-xs text-primary uppercase tracking-wider font-medium mb-1">{item.type}</span>
        )}
        <h3 className="font-bold text-gray-900 text-base mb-1.5">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 flex-1 line-clamp-3">{item.description}</p>
        )}
        {item.artist && (
          <p className="text-xs text-gray-400 mt-1">by {item.artist}</p>
        )}
        {renderAction()}
      </CardContent>
    </Card>
  );
}
