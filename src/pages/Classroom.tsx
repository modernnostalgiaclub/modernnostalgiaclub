import { Header } from '@/components/Header';
import { TrackCard } from '@/components/TrackCard';
import { SectionLabel } from '@/components/SectionLabel';
import { tracks, mockUser } from '@/lib/mockData';
import { motion } from 'framer-motion';

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

export default function Classroom() {
  const user = mockUser;
  
  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header isLoggedIn={true} />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="mb-12">
              <SectionLabel className="mb-4">The Classroom</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Training Tracks
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Structured learning for professional music industry workflows. This is not content dumping—this is professional training.
              </p>
            </motion.div>
            
            <motion.div 
              variants={stagger}
              className="space-y-6"
            >
              {tracks.map((track) => (
                <motion.div key={track.id} variants={fadeIn}>
                  <TrackCard 
                    track={track}
                    currentTier={user.tier}
                    onClick={() => console.log('Navigate to track:', track.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="mt-12 p-6 bg-card/50 border border-border rounded-lg"
            >
              <p className="text-sm text-muted-foreground text-center">
                Tracks marked with higher tier requirements are visible but locked. 
                <a href="https://patreon.com" className="text-primary hover:text-amber-glow ml-1" target="_blank" rel="noopener noreferrer">
                  Upgrade on Patreon
                </a> to unlock more content.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
