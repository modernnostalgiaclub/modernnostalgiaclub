import { useState } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { SubmissionCard } from '@/components/SubmissionCard';
import { TierGate } from '@/components/TierBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockSubmissions, mockUser } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Info } from 'lucide-react';

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

export default function StudioFloor() {
  const user = mockUser;
  const [showForm, setShowForm] = useState(false);
  
  const userSubmissions = mockSubmissions.filter(s => s.userId === user.id);
  
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
            <motion.div variants={fadeIn} className="mb-8">
              <SectionLabel className="mb-4">Studio Floor</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Submissions & Reviews
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Submit your work for professional review. All audio is delivered through DISCO—the industry standard for sync and licensing.
              </p>
            </motion.div>
            
            {/* DISCO Notice */}
            <motion.div variants={fadeIn}>
              <Card variant="console" className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Info className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm mb-3">
                        This Lab uses DISCO for professional catalog delivery. This mirrors real-world licensing workflows.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="amberOutline" size="sm" asChild>
                          <a href="https://disco.ac/signup?b=5076&u=23831" target="_blank" rel="noopener noreferrer">
                            Create a DISCO account
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Connect DISCO (coming soon)
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <TierGate 
              requiredTier="creator-accelerator" 
              currentTier={user.tier}
              lockedContent={
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Studio Floor access requires Creator Accelerator tier or higher.</p>
                  <Button variant="amber" asChild>
                    <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                      Upgrade on Patreon
                    </a>
                  </Button>
                </div>
              }
            >
              {/* New Submission Button */}
              <motion.div variants={fadeIn} className="mb-8">
                <Button 
                  variant="hero" 
                  onClick={() => setShowForm(!showForm)}
                  className="w-full md:w-auto"
                >
                  <Plus className="mr-2 w-5 h-5" />
                  New Submission
                </Button>
              </motion.div>
              
              {/* Submission Form */}
              {showForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Submit for Review</CardTitle>
                      <CardDescription>
                        All submissions require a DISCO playlist link for audio content.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="e.g., Summer Vibes EP - Sync Review" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type">Submission Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sync-review">Sync Review</SelectItem>
                            <SelectItem value="catalog-audit">Catalog Audit</SelectItem>
                            <SelectItem value="branding">Branding Materials</SelectItem>
                            <SelectItem value="project-proposal">Project Proposal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="disco">DISCO Playlist Link</Label>
                        <Input id="disco" placeholder="https://disco.ac/playlist/..." />
                        <p className="text-xs text-muted-foreground">
                          Paste the share link from your DISCO playlist
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea 
                          id="notes" 
                          placeholder="Any context or specific feedback you're looking for..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button variant="amber">Submit</Button>
                        <Button variant="outline" onClick={() => setShowForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Submissions List */}
              <motion.div variants={fadeIn}>
                <h2 className="font-display text-2xl mb-6">Your Submissions</h2>
                {userSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {userSubmissions.map((submission) => (
                      <SubmissionCard 
                        key={submission.id} 
                        submission={submission}
                        showInternalNotes={user.role === 'admin' || user.role === 'moderator'}
                      />
                    ))}
                  </div>
                ) : (
                  <Card variant="console" className="p-8 text-center">
                    <p className="text-muted-foreground">No submissions yet. Create your first one above.</p>
                  </Card>
                )}
              </motion.div>
            </TierGate>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
