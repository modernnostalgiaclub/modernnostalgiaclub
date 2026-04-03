import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cookie, Settings, X } from "lucide-react";
import { Link } from "react-router-dom";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  doNotSell: boolean;
  consentDate: string;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  doNotSell: false,
  consentDate: "",
};

const STORAGE_KEY = "cookie_preferences";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CookiePreferences;
      setPreferences(parsed);
      setShowBanner(false);
    } else {
      // Small delay to avoid layout shift on initial load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const updated = { ...prefs, consentDate: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPreferences(updated);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      doNotSell: false,
      consentDate: "",
    });
  };

  const rejectNonEssential = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      doNotSell: true,
      consentDate: "",
    });
  };

  const handleDoNotSell = () => {
    savePreferences({
      ...preferences,
      marketing: false,
      doNotSell: true,
    });
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up"
    >
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-black backdrop-blur-md p-4 md:p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 id="cookie-consent-title" className="font-heading text-lg font-semibold text-foreground">
                Your Privacy Choices
              </h2>
              <p id="cookie-consent-description" className="text-sm text-muted-foreground mt-1">
                We use cookies and similar technologies to enhance your experience. Under California law (CCPA/CPRA), 
                you have the right to opt out of the "sale" or "sharing" of your personal information.{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Learn more in our Privacy Policy
                </Link>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                Accept All
              </Button>
              
              <Button onClick={rejectNonEssential} variant="outline" className="flex-1 sm:flex-none">
                Essential Only
              </Button>
              
              <Button onClick={handleDoNotSell} variant="ghost" className="flex-1 sm:flex-none text-destructive hover:text-destructive">
                Do Not Sell My Info
              </Button>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Cookie settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Privacy Preferences</DialogTitle>
                    <DialogDescription>
                      Customize your cookie and privacy settings. Required cookies cannot be disabled.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Necessary Cookies */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="necessary" className="font-medium">
                          Strictly Necessary
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Essential for the website to function. Cannot be disabled.
                        </p>
                      </div>
                      <Switch id="necessary" checked disabled aria-label="Necessary cookies (always on)" />
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="analytics" className="font-medium">
                          Analytics
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Help us understand how visitors interact with our site.
                        </p>
                      </div>
                      <Switch
                        id="analytics"
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, analytics: checked }))
                        }
                        aria-label="Analytics cookies"
                      />
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="marketing" className="font-medium">
                          Marketing & Personalization
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Used for targeted advertising and personalized content.
                        </p>
                      </div>
                      <Switch
                        id="marketing"
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, marketing: checked }))
                        }
                        aria-label="Marketing cookies"
                      />
                    </div>

                    {/* CCPA Do Not Sell */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="doNotSell" className="font-medium text-destructive">
                            Do Not Sell/Share My Personal Information
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            California residents: Opt out under CCPA/CPRA.
                          </p>
                        </div>
                        <Switch
                          id="doNotSell"
                          checked={preferences.doNotSell}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ 
                              ...prev, 
                              doNotSell: checked,
                              marketing: checked ? false : prev.marketing 
                            }))
                          }
                          aria-label="Do not sell or share my personal information"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowSettings(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => savePreferences(preferences)}>
                      Save Preferences
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={rejectNonEssential}
            className="flex-shrink-0"
            aria-label="Dismiss and use essential cookies only"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Hook to check preferences in other components
export const useCookiePreferences = (): CookiePreferences | null => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  return preferences;
};
