import { useState, useEffect, useRef, useCallback } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Trophy, 
  HelpCircle, 
  Folder, 
  Briefcase,
  MessageSquare,
  Send,
  Loader2,
  Hash,
  Users,
  AtSign
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'trophy': Trophy,
  'help-circle': HelpCircle,
  'folder': Folder,
  'briefcase': Briefcase,
  'message-square': MessageSquare,
};

interface Channel {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  mentions: string[];
  created_at: string;
  user_id: string;
  stage_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
}

interface MemberProfile {
  user_id: string;
  stage_name: string | null;
  avatar_url: string | null;
}

export default function Community() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Current channel
  const currentChannelSlug = searchParams.get('channel');
  const currentChannel = channels.find(c => c.slug === currentChannelSlug);
  
  // Message input state
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch channels (from community_sections)
  useEffect(() => {
    async function fetchChannels() {
      const { data, error } = await supabase
        .from('community_sections')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Error fetching channels:', error);
      } else if (data) {
        setChannels(data);
        // Auto-select first channel if none selected
        if (!currentChannelSlug && data.length > 0) {
          setSearchParams({ channel: data[0].slug });
        }
      }
      setLoading(false);
    }

    fetchChannels();
  }, []);

  // Fetch members for @mentions
  useEffect(() => {
    async function fetchMembers() {
      const { data, error } = await supabase.rpc('get_public_profiles');

      if (!error && data) {
        // Map to expected shape
        const mapped: MemberProfile[] = data.map((d: { user_id: string; stage_name: string | null; avatar_url: string | null }) => ({
          user_id: d.user_id,
          stage_name: d.stage_name,
          avatar_url: d.avatar_url,
        }));
        setMembers(mapped);
      }
    }

    fetchMembers();
  }, []);

  // Fetch messages when channel changes
  useEffect(() => {
    if (!currentChannel) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      setMessagesLoading(true);
      
      // Use a raw query to join with profiles since types aren't generated yet
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', currentChannel!.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
        setMessagesLoading(false);
        return;
      }

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set((data || []).map((m: { user_id: string }) => m.user_id))];
      
      let profilesMap: Record<string, { stage_name: string | null; name: string | null; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, stage_name, name, avatar_url')
          .in('user_id', userIds);
        
        if (profiles) {
          profiles.forEach((p: { user_id: string; stage_name: string | null; name: string | null; avatar_url: string | null }) => {
            profilesMap[p.user_id] = p;
          });
        }
      }

      const messagesWithProfiles: ChatMessage[] = (data || []).map((m: { id: string; content: string; mentions: string[]; created_at: string; user_id: string }) => ({
        id: m.id,
        content: m.content,
        mentions: m.mentions || [],
        created_at: m.created_at,
        user_id: m.user_id,
        stage_name: profilesMap[m.user_id]?.stage_name,
        name: profilesMap[m.user_id]?.name,
        avatar_url: profilesMap[m.user_id]?.avatar_url,
      }));

      setMessages(messagesWithProfiles);
      setTimeout(scrollToBottom, 100);
      setMessagesLoading(false);
    }

    fetchMessages();
  }, [currentChannel, scrollToBottom]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentChannel) return;

    const channel = supabase
      .channel(`chat-${currentChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${currentChannel.id}`
        },
        async (payload) => {
          // Fetch profile for new message
          const newMsg = payload.new as { id: string; content: string; mentions: string[]; created_at: string; user_id: string };
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('stage_name, name, avatar_url')
            .eq('user_id', newMsg.user_id)
            .single();

          const messageWithProfile: ChatMessage = {
            id: newMsg.id,
            content: newMsg.content,
            mentions: newMsg.mentions || [],
            created_at: newMsg.created_at,
            user_id: newMsg.user_id,
            stage_name: profile?.stage_name,
            name: profile?.name,
            avatar_url: profile?.avatar_url,
          };

          setMessages(prev => [...prev, messageWithProfile]);
          setTimeout(scrollToBottom, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${currentChannel.id}`
        },
        (payload) => {
          const oldMsg = payload.old as { id: string };
          setMessages(prev => prev.filter(m => m.id !== oldMsg.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChannel, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = messageInput.trim();
    if (!content || !currentChannel || !user) return;

    setSending(true);
    setShowMentions(false);

    // Extract @mentions from content
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentionedUserIds: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUserIds.push(match[2]);
    }

    // Clean the content for display (keep @name format)
    const cleanContent = content.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, '@$1');

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        channel_id: currentChannel.id,
        user_id: user.id,
        content: cleanContent,
        mentions: mentionedUserIds,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } else {
      setMessageInput('');
    }

    setSending(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Check for @mention trigger
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      // Only show mentions if there's no space after @ or we're still typing the name
      if (!textAfterAt.includes(' ') || textAfterAt.length === 0) {
        setShowMentions(true);
        setMentionFilter(textAfterAt.toLowerCase());
        setMentionIndex(0);
        return;
      }
    }
    setShowMentions(false);
  };

  const handleMentionSelect = (member: MemberProfile) => {
    const displayName = member.stage_name || 'User';
    const lastAtIndex = messageInput.lastIndexOf('@');
    const beforeAt = messageInput.slice(0, lastAtIndex);
    const newValue = `${beforeAt}@[${displayName}](${member.user_id}) `;
    setMessageInput(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions) return;

    const filteredMembers = members.filter(m => {
      const name = (m.stage_name || '').toLowerCase();
      return name.includes(mentionFilter);
    });

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex(prev => Math.min(prev + 1, filteredMembers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredMembers[mentionIndex]) {
      e.preventDefault();
      handleMentionSelect(filteredMembers[mentionIndex]);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  const selectChannel = (slug: string) => {
    setSearchParams({ channel: slug });
  };

  const formatMessageContent = (content: string) => {
    // Highlight @mentions in the content
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-maroon font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatDate(message.created_at);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  // Redirect to home if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <Skeleton className="h-12 w-64 mb-8" />
              <div className="flex gap-6">
                <Skeleton className="h-[600px] w-64" />
                <Skeleton className="h-[600px] flex-1" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const filteredMentionMembers = members.filter(m => {
    const name = (m.stage_name || '').toLowerCase();
    return name.includes(mentionFilter);
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-6xl mx-auto"
          >
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl md:text-5xl font-anton uppercase text-cream">Community</h1>
                <Button asChild variant="outline" size="sm" className="border-cream/20 text-cream hover:bg-cream/10">
                  <Link to="/members" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Member Directory
                  </Link>
                </Button>
              </div>
              <p className="text-cream/60">Connect with the community in real-time</p>
            </div>

            <div className="flex gap-6 h-[calc(100vh-240px)] min-h-[500px]">
              {/* Channel Sidebar */}
              <Card className="w-64 shrink-0 bg-card/50 border-cream/10">
                <div className="p-4 border-b border-cream/10">
                  <h3 className="font-semibold text-cream flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Channels
                  </h3>
                </div>
                <ScrollArea className="h-[calc(100%-60px)]">
                  <div className="p-2 space-y-1">
                    {channels.map((channel) => {
                      const isActive = currentChannelSlug === channel.slug;
                      
                      return (
                        <button
                          key={channel.id}
                          onClick={() => selectChannel(channel.slug)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            isActive 
                              ? 'bg-maroon/20 text-cream' 
                              : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
                          }`}
                        >
                          <Hash className="w-4 h-4 shrink-0" />
                          <span className="truncate">{channel.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>

              {/* Chat Area */}
              <Card className="flex-1 flex flex-col bg-card/50 border-cream/10 overflow-hidden">
                {currentChannel ? (
                  <>
                    {/* Channel Header */}
                    <div className="p-4 border-b border-cream/10 shrink-0">
                      <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-maroon" />
                        <h2 className="font-semibold text-cream">{currentChannel.title}</h2>
                      </div>
                      {currentChannel.description && (
                        <p className="text-sm text-cream/60 mt-1">{currentChannel.description}</p>
                      )}
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="w-6 h-6 animate-spin text-cream/50" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-cream/50">
                          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Be the first to say something!</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                            <div key={date}>
                              {/* Date Divider */}
                              <div className="flex items-center gap-4 my-4">
                                <div className="flex-1 h-px bg-cream/10" />
                                <span className="text-xs text-cream/40 font-medium">{date}</span>
                                <div className="flex-1 h-px bg-cream/10" />
                              </div>

                              {/* Messages for this date */}
                              <div className="space-y-3">
                                {dateMessages.map((message, idx) => {
                                  const isOwn = message.user_id === user?.id;
                                  const displayName = message.stage_name || message.name || 'Member';
                                  const showAvatar = idx === 0 || 
                                    dateMessages[idx - 1]?.user_id !== message.user_id ||
                                    new Date(message.created_at).getTime() - new Date(dateMessages[idx - 1]?.created_at).getTime() > 300000;

                                  return (
                                    <motion.div
                                      key={message.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`group flex items-start gap-3 ${showAvatar ? 'mt-4' : 'mt-1'}`}
                                    >
                                      {showAvatar ? (
                                        <Avatar className="w-8 h-8 shrink-0">
                                          <AvatarImage src={message.avatar_url || undefined} />
                                          <AvatarFallback className="bg-maroon/20 text-cream text-xs">
                                            {displayName[0]?.toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                      ) : (
                                        <div className="w-8 shrink-0" />
                                      )}
                                      
                                      <div className="flex-1 min-w-0">
                                        {showAvatar && (
                                          <div className="flex items-baseline gap-2 mb-1">
                                            <span className={`font-medium text-sm ${isOwn ? 'text-maroon' : 'text-cream'}`}>
                                              {displayName}
                                            </span>
                                            <span className="text-xs text-cream/40">
                                              {formatTime(message.created_at)}
                                            </span>
                                          </div>
                                        )}
                                        <p className="text-cream/90 text-sm break-words">
                                          {formatMessageContent(message.content)}
                                        </p>
                                      </div>

                                      {/* Delete button for own messages or admin */}
                                      {(isOwn || isAdmin) && (
                                        <button
                                          onClick={() => handleDeleteMessage(message.id)}
                                          className="opacity-0 group-hover:opacity-100 text-cream/30 hover:text-destructive transition-opacity text-xs"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t border-cream/10 shrink-0 relative">
                      {/* Mentions Popup */}
                      <AnimatePresence>
                        {showMentions && filteredMentionMembers.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-4 right-4 mb-2 bg-background border border-cream/20 rounded-lg shadow-xl overflow-hidden"
                          >
                            <div className="p-2 text-xs text-cream/50 border-b border-cream/10 flex items-center gap-2">
                              <AtSign className="w-3 h-3" />
                              Mention someone
                            </div>
                            {filteredMentionMembers.map((member, idx) => (
                              <button
                                key={member.user_id}
                                onClick={() => handleMentionSelect(member)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                                  idx === mentionIndex ? 'bg-maroon/20' : 'hover:bg-cream/5'
                                }`}
                              >
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={member.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {(member.stage_name || '?')[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-cream text-sm">
                                  {member.stage_name || 'Member'}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <Input
                          ref={inputRef}
                          value={messageInput}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder={`Message #${currentChannel.title}... (use @ to mention)`}
                          className="flex-1 bg-background/50 border-cream/20 text-cream placeholder:text-cream/40"
                          disabled={sending}
                        />
                        <Button 
                          type="submit" 
                          disabled={sending || !messageInput.trim()}
                          className="bg-maroon hover:bg-maroon/80"
                        >
                          {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-cream/50">
                    <p>Select a channel to start chatting</p>
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
