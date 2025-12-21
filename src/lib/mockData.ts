import { User, Submission, Track, PatreonTier } from './types';

// Mock current user - in production this comes from Patreon OAuth
export const mockUser: User = {
  id: '1',
  name: 'Demo Artist',
  tier: 'creator-accelerator',
  status: 'active',
  role: 'member',
};

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    title: 'Summer Vibes EP - Sync Review',
    submittedBy: 'Demo Artist',
    userId: '1',
    status: 'in-review',
    discoLink: 'https://disco.ac/playlist/example',
    createdAt: new Date('2024-12-15'),
    type: 'sync-review',
  },
  {
    id: '2',
    title: 'Catalog Audit Request',
    submittedBy: 'Demo Artist',
    userId: '1',
    status: 'submitted',
    createdAt: new Date('2024-12-18'),
    type: 'catalog-audit',
  },
  {
    id: '3',
    title: 'Instrumental Pack for Licensing',
    submittedBy: 'Another Artist',
    userId: '2',
    status: 'approved',
    discoLink: 'https://disco.ac/playlist/approved-example',
    createdAt: new Date('2024-12-10'),
    type: 'sync-review',
  },
];

export const tracks: Track[] = [
  {
    id: 'foundations',
    title: 'Foundations of Artist Income',
    description: 'Understand how money actually moves in the music industry. Learn the core revenue streams available to independent artists.',
    requiredTier: 'lab-pass',
    lessons: [
      {
        id: 'f1',
        title: 'The New Music Economy',
        content: 'An overview of how artist income has shifted and where opportunities exist today.',
      },
      {
        id: 'f2',
        title: 'Revenue Stream Mapping',
        content: 'Identify and categorize your potential income sources.',
      },
      {
        id: 'f3',
        title: 'Understanding Royalties',
        content: 'Mechanical, performance, sync, and master royalties explained.',
      },
    ],
  },
  {
    id: 'sync',
    title: 'Sync & Licensing Workflow',
    description: 'Master the professional workflow for getting your music placed in film, TV, ads, and games.',
    requiredTier: 'creator-accelerator',
    lessons: [
      {
        id: 's1',
        title: 'What Music Supervisors Need',
        content: 'Understanding the decision-making process from the other side.',
      },
      {
        id: 's2',
        title: 'Metadata That Wins',
        content: 'How to prepare your catalog for professional discovery.',
      },
      {
        id: 's3',
        title: 'The DISCO Standard',
        content: 'Why industry professionals use DISCO and how to set up your catalog.',
        externalLinks: [{ title: 'Create DISCO Account', url: 'https://disco.ac/signup?b=5076&u=23831' }],
      },
    ],
  },
  {
    id: 'direct-to-fan',
    title: 'Direct-to-Fan Systems',
    description: 'Build sustainable income through direct relationships with your audience.',
    requiredTier: 'creator-accelerator',
    lessons: [
      {
        id: 'd1',
        title: 'Email List Strategy',
        content: 'Build and nurture your most valuable asset.',
      },
      {
        id: 'd2',
        title: 'Membership & Subscription Models',
        content: 'Create recurring revenue without a label.',
      },
    ],
  },
  {
    id: 'services',
    title: 'Services & Collaboration',
    description: 'Turn your skills into service offerings and build collaborative revenue.',
    requiredTier: 'creative-economy-lab',
    lessons: [
      {
        id: 'sv1',
        title: 'Productizing Your Skills',
        content: 'Package what you do into sellable services.',
      },
      {
        id: 'sv2',
        title: 'Collaboration Economics',
        content: 'Structure deals that work for all parties.',
      },
    ],
  },
];

export function canAccessTier(userTier: PatreonTier, requiredTier: PatreonTier): boolean {
  const tierOrder: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}
