import { Track, PatreonTier } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TierBadge, TierGate } from '@/components/TierBadge';
import { ChevronRight, BookOpen } from 'lucide-react';
import { canAccessTier } from '@/lib/mockData';

interface TrackCardProps {
  track: Track;
  currentTier: PatreonTier;
  onClick?: () => void;
}

export function TrackCard({ track, currentTier, onClick }: TrackCardProps) {
  const hasAccess = canAccessTier(currentTier, track.requiredTier);
  
  return (
    <TierGate 
      requiredTier={track.requiredTier} 
      currentTier={currentTier}
    >
      <Card 
        variant="feature" 
        className={hasAccess ? "cursor-pointer" : ""}
        onClick={hasAccess ? onClick : undefined}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-maroon" />
                <TierBadge tier={track.requiredTier} size="sm" />
              </div>
              <CardTitle>{track.title}</CardTitle>
            </div>
            {hasAccess && (
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
          </div>
          <CardDescription className="mt-2">
            {track.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {track.lessons.length} lessons
            </span>
            {hasAccess && (
              <Button variant="maroonOutline" size="sm">
                Start Track
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TierGate>
  );
}
