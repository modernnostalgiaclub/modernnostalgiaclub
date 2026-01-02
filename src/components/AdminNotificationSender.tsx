import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Send, Users, User, Megaphone, Trash2, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  user_id: string;
  stage_name: string | null;
  full_name: string | null;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  created_at: string;
}

export function AdminNotificationSender() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [link, setLink] = useState('');
  const [target, setTarget] = useState<'all' | 'single'>('all');
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, stage_name, full_name')
      .order('stage_name');
    
    // Fetch recent notifications (last 20)
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    setProfiles(profilesData || []);
    setRecentNotifications(notificationsData || []);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    if (target === 'single' && !selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    setSending(true);

    try {
      if (target === 'all') {
        // Send to all users
        const notifications = profiles.map((profile) => ({
          user_id: profile.user_id,
          title: title.trim(),
          message: message.trim(),
          type,
          link: link.trim() || null,
        }));

        const { error } = await supabase.from('notifications').insert(notifications);
        
        if (error) throw error;
        
        toast.success(`Notification sent to ${profiles.length} users`);
      } else {
        // Send to single user
        const { error } = await supabase.from('notifications').insert({
          user_id: selectedUserId,
          title: title.trim(),
          message: message.trim(),
          type,
          link: link.trim() || null,
        });
        
        if (error) throw error;
        
        const user = profiles.find(p => p.user_id === selectedUserId);
        toast.success(`Notification sent to ${user?.stage_name || user?.full_name || 'user'}`);
      }

      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setLink('');
      setSelectedUserId('');
      
      // Refresh recent notifications
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete notification');
    } else {
      setRecentNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Send Notification
          </CardTitle>
          <CardDescription>
            Create and send notifications to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Recipients</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as 'all' | 'single')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Users ({profiles.length})
                  </div>
                </SelectItem>
                <SelectItem value="single">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Single User
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {target === 'single' && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.stage_name || profile.full_name || 'Unknown User'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/dashboard or https://..."
            />
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            Recently sent notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notifications sent yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{notification.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
