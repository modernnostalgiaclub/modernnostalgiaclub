import { isValidDiscoUrl, isValidExternalUrl } from '@/lib/urlValidation';
import { cn } from '@/lib/utils';

interface SafeExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  requireDisco?: boolean;
  fallback?: React.ReactNode;
}

/**
 * A safe external link component that validates URLs before rendering
 * Prevents XSS attacks via javascript: or data: URLs
 * Can require DISCO.ac URLs specifically for submissions
 */
export function SafeExternalLink({ 
  href, 
  children, 
  className,
  requireDisco = false,
  fallback = <span className="text-muted-foreground">Invalid link</span>
}: SafeExternalLinkProps) {
  const isValid = requireDisco ? isValidDiscoUrl(href) : isValidExternalUrl(href);
  
  if (!isValid) {
    return <>{fallback}</>;
  }
  
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(className)}
    >
      {children}
    </a>
  );
}
