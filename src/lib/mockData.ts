import { PatreonTier } from './types';

// Helper function to check tier access
export function canAccessTier(userTier: PatreonTier, requiredTier: PatreonTier): boolean {
  const tierOrder: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}

