import { useEffect } from 'react';

export function HelloSkipAgent() {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[data-agent-id="N4VqehQTEhR4mOwJWN9B"]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = 'https://helloskip.com/agent.js';
    script.setAttribute('data-agent-id', 'N4VqehQTEhR4mOwJWN9B');
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-agent-id="N4VqehQTEhR4mOwJWN9B"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}
