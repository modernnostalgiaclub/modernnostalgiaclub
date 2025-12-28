import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function HelloSkipAgent() {
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Clean up script on unmount
      const scriptToRemove = document.querySelector('script[data-agent-id="N4VqehQTEhR4mOwJWN9B"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return (
    <Card variant="elevated" className="border-maroon/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-maroon/20 rounded-lg">
            <Bot className="w-6 h-6 text-maroon" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Assistant</CardTitle>
            <CardDescription>
              Get personalized guidance for your music career
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="min-h-[100px]">
          <p className="text-sm text-muted-foreground">
            The AI assistant is available in the bottom-right corner of your screen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
