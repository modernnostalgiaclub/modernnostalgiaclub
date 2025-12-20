import { useMemo } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

type VideoType = 'youtube' | 'vimeo' | 'unknown';

interface VideoInfo {
  type: VideoType;
  id: string | null;
  embedUrl: string | null;
}

function parseVideoUrl(url: string): VideoInfo {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        type: 'youtube',
        id: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`,
      };
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        type: 'vimeo',
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}?dnt=1`,
      };
    }
  }

  return { type: 'unknown', id: null, embedUrl: null };
}

export function VideoPlayer({ url, title = 'Video' }: VideoPlayerProps) {
  const videoInfo = useMemo(() => parseVideoUrl(url), [url]);

  if (videoInfo.type === 'unknown' || !videoInfo.embedUrl) {
    // Fallback for unsupported video URLs
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Video format not supported for embedding
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Video
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={videoInfo.embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
