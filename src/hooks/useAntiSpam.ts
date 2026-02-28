import { useState, useEffect, useCallback, useMemo } from 'react';

interface AntiSpamConfig {
  /** Cooldown duration in milliseconds after submission (default: 30000ms = 30s) */
  cooldownMs?: number;
  /** Storage key for persisting cooldown across page refreshes */
  storageKey?: string;
}

interface AntiSpamResult {
  /** Hidden honeypot field value - should remain empty for humans */
  honeypotValue: string;
  /** Setter for honeypot field - bots will fill this */
  setHoneypotValue: (value: string) => void;
  /** Props to spread on the honeypot input element */
  honeypotProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tabIndex: number;
    autoComplete: string;
    'aria-hidden': boolean;
    style: React.CSSProperties;
    name: string;
  };
  /** Client fingerprint for server-side validation */
  fingerprint: string;
  /** Whether the form is in cooldown period */
  isInCooldown: boolean;
  /** Remaining cooldown time in seconds */
  cooldownRemaining: number;
  /** Call this after successful submission to start cooldown */
  triggerCooldown: () => void;
  /** Validates anti-spam measures, returns error message or null if valid */
  validate: () => string | null;
  /** Data to include in form submission */
  getSubmissionData: () => {
    _hp: string;
    _fp: string;
    _ts: number;
  };
}

/**
 * Generates a client fingerprint based on browser characteristics.
 * This is hashed server-side for privacy.
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    navigator.hardwareConcurrency?.toString() || 'unknown',
    // Canvas fingerprint (simplified)
    (() => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('fingerprint', 2, 2);
          return canvas.toDataURL().slice(-50);
        }
      } catch {
        return 'canvas-error';
      }
      return 'no-canvas';
    })(),
  ];

  // Simple hash function for the fingerprint
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Hook for lightweight abuse prevention on public forms.
 * Includes honeypot fields, cooldown UI, and client fingerprinting.
 */
export function useAntiSpam(config: AntiSpamConfig = {}): AntiSpamResult {
  const { cooldownMs = 30000, storageKey = 'form_cooldown' } = config;
  
  const [honeypotValue, setHoneypotValue] = useState('');
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  // Generate fingerprint once on mount
  const fingerprint = useMemo(() => {
    if (typeof window === 'undefined') return 'ssr';
    return generateFingerprint();
  }, []);

  // Check for existing cooldown on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      const endTime = parseInt(stored, 10);
      if (endTime > Date.now()) {
        setCooldownEnd(endTime);
      } else {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  // Update cooldown remaining timer
  useEffect(() => {
    if (!cooldownEnd) {
      setCooldownRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      
      if (remaining <= 0) {
        setCooldownEnd(null);
        sessionStorage.removeItem(storageKey);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd, storageKey]);

  const triggerCooldown = useCallback(() => {
    const endTime = Date.now() + cooldownMs;
    setCooldownEnd(endTime);
    sessionStorage.setItem(storageKey, endTime.toString());
  }, [cooldownMs, storageKey]);

  const validate = useCallback((): string | null => {
    // Check honeypot - if filled, it's likely a bot
    if (honeypotValue.trim() !== '') {
      // Don't reveal why validation failed to bots
      console.warn('Honeypot triggered');
      return 'Unable to submit. Please try again.';
    }

    // Check cooldown
    if (cooldownEnd && cooldownEnd > Date.now()) {
      const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
      return `Please wait ${remaining} seconds before submitting again.`;
    }

    return null;
  }, [honeypotValue, cooldownEnd]);

  const honeypotProps = useMemo(() => ({
    value: honeypotValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHoneypotValue(e.target.value),
    tabIndex: -1,
    autoComplete: 'off',
    'aria-hidden': true as const,
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      top: '-9999px',
      opacity: 0,
      pointerEvents: 'none' as const,
      height: 0,
      width: 0,
      overflow: 'hidden' as const,
    },
    name: 'website_url', // Common honeypot field name that bots often fill
  }), [honeypotValue]);

  const getSubmissionData = useCallback(() => ({
    _hp: honeypotValue,
    _fp: fingerprint,
    _ts: Date.now(),
  }), [honeypotValue, fingerprint]);

  return {
    honeypotValue,
    setHoneypotValue,
    honeypotProps,
    fingerprint,
    isInCooldown: cooldownRemaining > 0,
    cooldownRemaining,
    triggerCooldown,
    validate,
    getSubmissionData,
  };
}
