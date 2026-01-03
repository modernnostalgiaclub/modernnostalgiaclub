import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Settings, Mail, Bell, Calendar } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: { enabled: boolean };
  description: string | null;
  updated_at: string;
}

export function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      
      // Type assertion since we know the structure
      setSettings((data || []) as unknown as SiteSetting[]);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, enabled: boolean) => {
    setUpdating(key);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: { enabled } })
        .eq('key', key);

      if (error) throw error;

      setSettings(prev => 
        prev.map(s => s.key === key ? { ...s, value: { enabled } } : s)
      );
      
      toast.success(`${enabled ? 'Enabled' : 'Disabled'} ${key.replace(/_/g, ' ')}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setUpdating(null);
    }
  };

  const getSettingIcon = (key: string) => {
    if (key.includes('email')) return <Mail className="h-5 w-5 text-maroon" />;
    if (key.includes('inapp')) return <Bell className="h-5 w-5 text-maroon" />;
    if (key.includes('event')) return <Calendar className="h-5 w-5 text-maroon" />;
    return <Settings className="h-5 w-5 text-maroon" />;
  };

  const formatSettingName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Site Settings
          </CardTitle>
          <CardDescription>Configure site-wide settings and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Site Settings
        </CardTitle>
        <CardDescription>
          Configure site-wide settings and automated notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No settings configured yet.
          </p>
        ) : (
          settings.map((setting) => (
            <div 
              key={setting.id} 
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getSettingIcon(setting.key)}
                </div>
                <div className="space-y-1">
                  <Label 
                    htmlFor={setting.key} 
                    className="text-base font-medium cursor-pointer"
                  >
                    {formatSettingName(setting.key)}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description || 'No description available'}
                  </p>
                </div>
              </div>
              <Switch
                id={setting.key}
                checked={setting.value?.enabled ?? false}
                onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                disabled={updating === setting.key}
                aria-label={`Toggle ${formatSettingName(setting.key)}`}
              />
            </div>
          ))
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">About Event Notifications</h4>
          <p className="text-sm text-muted-foreground">
            When enabled, members will automatically receive notifications when new events 
            are added to Eventbrite. Email notifications send branded emails via Resend, 
            while in-app notifications appear in the notification bell.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
