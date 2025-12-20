import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  HelpCircle, 
  Folder, 
  Briefcase,
  MessageSquare,
  ArrowRight
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

const sections = [
  {
    id: 'wins',
    icon: Trophy,
    title: 'Wins',
    description: 'Share your victories. Placements, milestones, and breakthroughs.',
    posts: 12,
    color: 'text-amber',
  },
  {
    id: 'questions',
    icon: HelpCircle,
    title: 'Questions',
    description: 'Ask the community. No judgment, just answers.',
    posts: 34,
    color: 'text-blue-400',
  },
  {
    id: 'resources',
    icon: Folder,
    title: 'Resources',
    description: 'Tools, templates, and helpful links shared by members.',
    posts: 28,
    color: 'text-green-400',
  },
  {
    id: 'opportunities',
    icon: Briefcase,
    title: 'Opportunities',
    description: 'Briefs, collaborations, and openings.',
    posts: 8,
    color: 'text-purple-400',
  },
];

export default function Community() {
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
              <SectionLabel className="mb-4">Community</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Focused Discussions
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                This is not a social feed. It's structured conversation around wins, questions, resources, and opportunities. No audio uploads here—just learning and connection.
              </p>
            </motion.div>
            
            <motion.div 
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {sections.map((section) => (
                <motion.div key={section.id} variants={fadeIn}>
                  <Card variant="feature" className="h-full cursor-pointer hover:scale-[1.02] transition-transform">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <section.icon className={`w-8 h-8 ${section.color}`} />
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {section.posts}
                        </span>
                      </div>
                      <CardTitle className="mt-4">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="amberOutline" size="sm" className="w-full">
                        Enter
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="mt-12 p-6 bg-card/50 border border-border rounded-lg text-center"
            >
              <p className="text-sm text-muted-foreground">
                Audio submissions and reviews happen in the <a href="/studio" className="text-primary hover:text-amber-glow">Studio Floor</a>, not here.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
