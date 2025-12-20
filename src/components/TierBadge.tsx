import { PatreonTier, TIER_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface TierBadgeProps {
  tier: PatreonTier;
  size?: 'sm' | 'md';
  showPrice?: boolean;
}

export function TierBadge({ tier, size = 'md', showPrice = false }: TierBadgeProps) {
  const info = TIER_INFO[tier];
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        tier === 'lab-pass' && "bg-muted text-muted-foreground",
        tier === 'creator-accelerator' && "bg-amber/20 text-amber",
        tier === 'creative-economy-lab' && "bg-primary/20 text-primary",
      )}
    >
      {info.name}
      {showPrice && <span className="opacity-70">({info.price})</span>}
    </span>
  );
}

interface TierGateProps {
  requiredTier: PatreonTier;
  currentTier: PatreonTier;
  children: React.ReactNode;
  lockedContent?: React.ReactNode;
}

export function TierGate({ requiredTier, currentTier, children, lockedContent }: TierGateProps) {
  const tierOrder: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];
  const hasAccess = tierOrder.indexOf(currentTier) >= tierOrder.indexOf(requiredTier);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative">
      <div className="tier-locked pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-lg">
        {lockedContent || (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Available in {TIER_INFO[requiredTier].name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
