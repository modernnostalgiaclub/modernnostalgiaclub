import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { TierBadge } from '@/components/TierBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { TIER_INFO } from '@/lib/types';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  ExternalLink,
  User,
  Mail,
  Shield,
  Loader2
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

const tierOrder: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];

export default function Account() {
  const { user, profile, loading } = useAuth();
  
  // Redirect to home if not logged in
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background studio-grain flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const currentTierIndex = tierOrder.indexOf(tier);
  const userName = profile?.name || user?.email?.split('@')[0] || 'Artist';
  const userEmail = profile?.email || user?.email || '';
  
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
              <SectionLabel className="mb-4">Account</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Your Membership
              </h1>
            </motion.div>
            
            {/* Profile Info */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Name</span>
                    <span>{userName}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                    <span>{userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Patreon Connected
                    </span>
                    <span className={profile?.patreon_id ? 'text-green-400' : 'text-muted-foreground'}>
                      {profile?.patreon_id ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-green-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Current Tier */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="elevated" className="border-maroon/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Tier</CardTitle>
                    <TierBadge tier={tier} showPrice />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TIER_INFO[tier].features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-maroon" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* All Tiers */}
            <motion.div variants={fadeIn}>
              <h2 className="font-display text-2xl mb-6">All Tier Options</h2>
              <div className="space-y-4">
                {tierOrder.map((tierId, index) => {
                  const tierInfo = TIER_INFO[tierId];
                  const isCurrent = tierId === tier;
                  const isLocked = index > currentTierIndex;
                  
                  return (
                    <Card 
                      key={tierId}
                      variant={isCurrent ? "elevated" : isLocked ? "default" : "feature"}
                      className={isCurrent ? "border-maroon/30" : ""}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
                              {isCurrent && (
                                <span className="text-xs bg-maroon/20 text-maroon px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <CardDescription className="text-lg font-display text-foreground">
                              {tierInfo.price}/month
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                          {tierInfo.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                              <Check className={`w-4 h-4 ${isCurrent || !isLocked ? 'text-maroon' : 'text-muted-foreground'}`} />
                              <span className={`text-sm ${isLocked ? 'text-muted-foreground' : ''}`}>{feature}</span>
                            </div>
                          ))}
                        </div>
                        {!isCurrent && (
                          <Button 
                            variant={isLocked ? "maroon" : "outline"} 
                            size="sm"
                            asChild
                          >
                            <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                              {isLocked ? 'Upgrade' : 'Manage on Patreon'}
                              <ExternalLink className="ml-2 w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="mt-8 text-center"
            >
              <Button variant="outline" asChild>
                <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                  Manage Membership on Patreon
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}