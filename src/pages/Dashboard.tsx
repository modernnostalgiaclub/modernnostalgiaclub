import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TierBadge } from '@/components/TierBadge';
import { mockUser } from '@/lib/mockData';
import { TIER_INFO } from '@/lib/types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Music2, 
  Users, 
  BookOpen,
  ArrowRight,
  Zap
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

export default function Dashboard() {
  const user = mockUser;
  const tierInfo = TIER_INFO[user.tier];
  
  const getNextAction = () => {
    switch (user.tier) {
      case 'lab-pass':
        return { text: 'Start with Foundations of Artist Income', link: '/classroom' };
      case 'creator-accelerator':
        return { text: 'Submit one track for review', link: '/studio' };
      case 'creative-economy-lab':
        return { text: 'Review your strategy roadmap', link: '/classroom' };
    }
  };
  
  const nextAction = getNextAction();
  
  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header isLoggedIn={true} />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            {/* Welcome Panel */}
            <motion.div variants={fadeIn} className="mb-12">
              <Card variant="elevated" className="p-8 border-maroon/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <TierBadge tier={user.tier} />
                      <span className="text-sm text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        Active
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display">
                      Welcome back, {user.name}
                    </h1>
                    <p className="text-muted-foreground">
                      You're here to turn creative work into sustainable income.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            {/* Primary Actions */}
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="font-display text-2xl mb-6">Enter the Lab</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    icon: GraduationCap, 
                    title: 'Classroom', 
                    desc: 'Training tracks',
                    link: '/classroom',
                    available: true
                  },
                  { 
                    icon: Music2, 
                    title: 'Studio Floor', 
                    desc: 'Submissions & reviews',
                    link: '/studio',
                    available: user.tier !== 'lab-pass'
                  },
                  { 
                    icon: Users, 
                    title: 'Community', 
                    desc: 'Discussions',
                    link: '/community',
                    available: true
                  },
                  { 
                    icon: BookOpen, 
                    title: 'Reference Shelf', 
                    desc: 'Examples & case studies',
                    link: '/reference',
                    available: true
                  },
                ].map((item) => (
                  <Link 
                    key={item.title} 
                    to={item.available ? item.link : '#'}
                    className={!item.available ? 'pointer-events-none' : ''}
                  >
                    <Card 
                      variant={item.available ? "feature" : "locked"}
                      className="h-full hover:scale-[1.02] transition-transform"
                    >
                      <CardHeader>
                        <item.icon className={`w-8 h-8 mb-2 ${item.available ? 'text-maroon' : 'text-muted-foreground'}`} />
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>
                          {item.available ? item.desc : 'Available in higher tiers'}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
            
            {/* Next Recommended Action */}
            <motion.div variants={fadeIn}>
              <Card variant="console" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-maroon/20 rounded-lg">
                    <Zap className="w-6 h-6 text-maroon" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg mb-1">Next Recommended Action</h3>
                    <p className="text-muted-foreground">{nextAction.text}</p>
                  </div>
                  <Button variant="maroon" asChild>
                    <Link to={nextAction.link}>
                      Go
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
            
            {/* Tier Features */}
            <motion.div variants={fadeIn} className="mt-12">
              <h2 className="font-display text-2xl mb-6">Your {tierInfo.name} Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tierInfo.features.map((feature) => (
                  <div 
                    key={feature}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
                  >
                    <span className="w-2 h-2 bg-maroon rounded-full" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/account">
                    View all tier options
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
