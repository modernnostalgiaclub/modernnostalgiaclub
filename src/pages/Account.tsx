import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { TierBadge } from '@/components/TierBadge';
import { TwoFactorSettings } from '@/components/TwoFactorSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { TIER_INFO } from '@/lib/types';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  ExternalLink,
  User,
  Mail,
  Shield,
  Loader2,
  Trash2,
  AlertTriangle,
  Save,
  Music,
  MessageCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const PRO_OPTIONS = [
  'ASCAP',
  'BMI',
  'SESAC',
  'GMR',
  'SOCAN',
  'PRS',
  'APRA AMCOS',
  'GEMA',
  'SACEM',
  'JASRAC',
  'Other'
];

interface ProfileFormData {
  full_name: string;
  stage_name: string;
  pro: string;
  has_publishing_account: boolean;
  publishing_company: string;
  writer_ipi: string;
  publisher_ipi: string;
}

export default function Account() {
  const { user, profile, loading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAdmin = hasRole('admin');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    stage_name: '',
    pro: '',
    has_publishing_account: false,
    publishing_company: '',
    writer_ipi: '',
    publisher_ipi: ''
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: (profile as any).full_name || '',
        stage_name: (profile as any).stage_name || '',
        pro: (profile as any).pro || '',
        has_publishing_account: (profile as any).has_publishing_account || false,
        publishing_company: (profile as any).publishing_company || '',
        writer_ipi: (profile as any).writer_ipi || '',
        publisher_ipi: (profile as any).publisher_ipi || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          stage_name: formData.stage_name || null,
          pro: formData.pro || null,
          has_publishing_account: formData.has_publishing_account,
          publishing_company: formData.has_publishing_account ? formData.publishing_company || null : null,
          writer_ipi: formData.has_publishing_account ? formData.writer_ipi || null : null,
          publisher_ipi: formData.has_publishing_account ? formData.publisher_ipi || null : null
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to delete your account');
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Delete account error:', error);
        toast.error('Failed to delete account. Please try again.');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // Sign out locally and redirect
      await signOut();
      toast.success('Your account has been deleted');
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
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
  const userEmail = user?.email || '';
  
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

            {/* Artist/Songwriter Information */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Artist & Songwriter Information
                  </CardTitle>
                  <CardDescription>
                    Your professional music industry details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name (Private)</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Your legal full name"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the same name that is registered with your PRO. This is kept private and not shown publicly.
                    </p>
                  </div>

                  {/* Stage Name */}
                  <div className="space-y-2">
                    <Label htmlFor="stage_name">Stage Name</Label>
                    <Input
                      id="stage_name"
                      value={formData.stage_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, stage_name: e.target.value }))}
                      placeholder="Your artist/stage name"
                    />
                  </div>

                  {/* PRO */}
                  <div className="space-y-2">
                    <Label htmlFor="pro">Performing Rights Organization (PRO)</Label>
                    <Select 
                      value={formData.pro} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pro: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your PRO" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRO_OPTIONS.map((pro) => (
                          <SelectItem key={pro} value={pro}>{pro}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Your PRO information is publicly visible to other members.
                    </p>
                  </div>

                  {/* Publishing Account Checkbox */}
                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox
                      id="has_publishing"
                      checked={formData.has_publishing_account}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        has_publishing_account: checked === true 
                      }))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="has_publishing" className="cursor-pointer">
                        I have a Publishing Account
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Check this if you have registered a publishing company
                      </p>
                    </div>
                  </div>

                  {/* Publishing Fields (shown when checkbox is checked) */}
                  {formData.has_publishing_account && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pl-6 border-l-2 border-maroon/30"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="publishing_company">Publishing Company Name</Label>
                        <Input
                          id="publishing_company"
                          value={formData.publishing_company}
                          onChange={(e) => setFormData(prev => ({ ...prev, publishing_company: e.target.value }))}
                          placeholder="Your publishing company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="writer_ipi">Writer IPI Number</Label>
                        <Input
                          id="writer_ipi"
                          value={formData.writer_ipi}
                          onChange={(e) => setFormData(prev => ({ ...prev, writer_ipi: e.target.value }))}
                          placeholder="e.g., 00123456789"
                        />
                        <p className="text-xs text-muted-foreground">
                          Your 9-11 digit IPI number as a songwriter/composer
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="publisher_ipi">Publisher IPI Number</Label>
                        <Input
                          id="publisher_ipi"
                          value={formData.publisher_ipi}
                          onChange={(e) => setFormData(prev => ({ ...prev, publisher_ipi: e.target.value }))}
                          placeholder="e.g., 00987654321"
                        />
                        <p className="text-xs text-muted-foreground">
                          Your publishing company's IPI number
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      variant="maroon"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Messaging Section - Coming Soon */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="elevated" className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-maroon/5 to-transparent" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </CardTitle>
                  <CardDescription>
                    Direct messaging with community members
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-maroon" />
                    </div>
                    <h3 className="text-lg font-display mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      We're building a secure messaging system for community members. 
                      In the meantime, connect with others through Patreon's messaging feature.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <a 
                        href="https://www.patreon.com/messages" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Open Patreon Messages
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Two-Factor Authentication (Admin Only) */}
            {isAdmin && (
              <motion.div variants={fadeIn} className="mb-8">
                <TwoFactorSettings />
              </motion.div>
            )}
            
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
                          tierId === 'creative-economy-lab' ? (
                            <Button 
                              variant={isLocked ? "maroon" : "outline"} 
                              size="sm"
                              asChild
                            >
                              <a href="/apply">
                                Apply for Lab Access
                                <ExternalLink className="ml-2 w-4 h-4" />
                              </a>
                            </Button>
                          ) : (
                            <Button 
                              variant={isLocked ? "maroon" : "outline"} 
                              size="sm"
                              asChild
                            >
                              <a href="https://www.patreon.com/modernnostalgiaclub" target="_blank" rel="noopener noreferrer">
                                {isLocked ? 'Upgrade' : 'Manage on Patreon'}
                                <ExternalLink className="ml-2 w-4 h-4" />
                              </a>
                            </Button>
                          )
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
                <a href="https://www.patreon.com/modernnostalgiaclub" target="_blank" rel="noopener noreferrer">
                  Manage Membership on Patreon
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </motion.div>

            {/* Danger Zone - Account Deletion */}
            <motion.div variants={fadeIn} className="mt-12">
              <Card variant="elevated" className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="shrink-0">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Delete Your Account?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>
                              This action is <strong>permanent and cannot be undone</strong>. All your data will be permanently deleted, including:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Your profile information</li>
                              <li>Your Patreon connection</li>
                              <li>Your account settings</li>
                            </ul>
                            <p className="pt-2">
                              Are you sure you want to proceed?
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Yes, Delete My Account'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
