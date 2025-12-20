export type PatreonTier = 'lab-pass' | 'creator-accelerator' | 'creative-economy-lab';

export interface User {
  id: string;
  name: string;
  email: string;
  tier: PatreonTier;
  status: 'active' | 'inactive';
  role: 'member' | 'moderator' | 'admin';
}

export interface Submission {
  id: string;
  title: string;
  submittedBy: string;
  userId: string;
  status: 'submitted' | 'in-review' | 'needs-revision' | 'approved';
  discoLink?: string;
  createdAt: Date;
  type: 'sync-review' | 'catalog-audit' | 'branding' | 'project-proposal';
  internalNotes?: string; // Admin/mod only
}

export interface Track {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  requiredTier: PatreonTier;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  templates?: string[];
  externalLinks?: { title: string; url: string }[];
}

export interface CommunitySection {
  id: string;
  name: 'wins' | 'questions' | 'resources' | 'opportunities';
  description: string;
}

export const TIER_INFO: Record<PatreonTier, {
  name: string;
  price: string;
  features: string[];
  color: string;
}> = {
  'lab-pass': {
    name: 'Lab Pass',
    price: '$1',
    features: [
      'Dashboard access',
      'Classroom access',
      'Community access',
      'Submit audio',
      'Listen to approved audio',
    ],
    color: 'muted',
  },
  'creator-accelerator': {
    name: 'Creator Accelerator',
    price: '$10',
    features: [
      'Everything in Lab Pass',
      'Priority submissions',
      'Feedback visibility',
      'Studio Floor access',
    ],
    color: 'amber',
  },
  'creative-economy-lab': {
    name: 'Creative Economy Lab Access',
    price: '$150',
    features: [
      'All features unlocked',
      'Priority review',
      'Strategy access',
      'Public critique eligibility',
      'Apply-only tier',
    ],
    color: 'primary',
  },
};
