export type PatreonTier = 'lab-pass' | 'creator-accelerator' | 'creative-economy-lab';

export interface User {
  id: string;
  name: string;
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
    name: 'Club Pass',
    price: '$10',
    features: [
      'Dashboard access',
      'Courses access',
      'Community access',
      'Submit audio',
      'Listen to approved audio',
    ],
    color: 'muted',
  },
  'creator-accelerator': {
    name: 'Accelerator',
    price: '$50',
    features: [
      'Everything in Club Pass',
      'Priority submissions',
      'Feedback visibility',
      'Submit for Feedback access',
    ],
    color: 'amber',
  },
  'creative-economy-lab': {
    name: 'Artist Incubator',
    price: '$300',
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
