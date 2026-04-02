import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Music } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface PublicProfile {
  id: string;
  stage_name: string;
  pro: string | null;
  avatar_url: string | null;
}

export default function MemberDirectory() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['member-directory'],
    queryFn: async () => {
      // Use secure RPC function that only returns public profile fields
      const { data, error } = await supabase
        .rpc('get_public_profiles');

      if (error) throw error;
      
      // Sort by stage_name client-side since RPC doesn't support ordering
      const sorted = (data || []).sort((a, b) => 
        (a.stage_name || '').localeCompare(b.stage_name || '')
      );
      
      return sorted as PublicProfile[];
    },
  });

  const filteredMembers = members?.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.stage_name?.toLowerCase().includes(query) ||
      member.pro?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Helmet>
        <title>Member Directory | ModernNostalgia.club</title>
        <meta
          name="description"
          content="Browse the Modern Nostalgia Club member directory. Connect with fellow artists, producers, and creators."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-anton uppercase text-foreground">
                  Member Directory
                </h1>
              </div>
              <p className="text-muted-foreground">
                Connect with fellow artists and creators in the Club.
                Members appear here once they've set their Stage Name in their profile.
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by stage name or PRO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Members Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMembers?.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No members found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query.'
                    : 'Members will appear here once they set their Stage Name.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMembers?.map((member) => (
                  <Card
                    key={member.id}
                    className="hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(member.stage_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground truncate">
                            {member.stage_name}
                          </h3>
                          {member.pro && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs font-normal"
                            >
                              <Music className="h-3 w-3 mr-1" />
                              {member.pro}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Member Count */}
            {!isLoading && filteredMembers && filteredMembers.length > 0 && (
              <p className="text-sm text-muted-foreground mt-6 text-center">
                Showing {filteredMembers.length} member
                {filteredMembers.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </main>

      </div>
    </>
  );
}
