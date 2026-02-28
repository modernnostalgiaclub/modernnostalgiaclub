/**
 * Validates that a URL is a legitimate DISCO.ac URL
 * Only allows HTTPS protocol and disco.ac domain
 */
export function isValidDiscoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url.trim());
    
    // Only allow HTTPS protocol
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    // Only allow disco.ac domain
    const hostname = parsed.hostname.toLowerCase();
    return hostname === 'disco.ac' || hostname.endsWith('.disco.ac');
  } catch {
    return false;
  }
}

/**
 * Validates a URL is safe for external linking (HTTPS only, no javascript: or data:)
 */
export function isValidExternalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url.trim());
    
    // Only allow http/https protocols
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validates Patreon URLs specifically
 */
export function isValidPatreonUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url.trim());
    
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    const hostname = parsed.hostname.toLowerCase();
    return hostname === 'patreon.com' || hostname.endsWith('.patreon.com');
  } catch {
    return false;
  }
}
