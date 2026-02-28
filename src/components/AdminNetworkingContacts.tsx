import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Download, Search, Trash2, RefreshCw, Users } from 'lucide-react';
import { format } from 'date-fns';

interface NetworkingContact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string;
  notes: string | null;
  event_tag: string | null;
  created_at: string;
}

const roleOptions = ['All', 'Artist', 'Brand', 'Music Tech', 'Publisher / Sync', 'Other'];

export function AdminNetworkingContacts() {
  const [contacts, setContacts] = useState<NetworkingContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('networking_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load contacts');
      console.error('Fetch error:', error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    setDeleting(id);
    const { error } = await supabase
      .from('networking_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete contact');
    } else {
      toast.success('Contact deleted');
      setContacts(contacts.filter(c => c.id !== id));
    }
    setDeleting(null);
  }

  function exportCSV() {
    const filteredData = getFilteredContacts();
    if (filteredData.length === 0) {
      toast.error('No contacts to export');
      return;
    }

    const headers = ['Name', 'Email', 'Company', 'Role', 'Notes', 'Event Tag', 'Created At'];
    const rows = filteredData.map(contact => [
      contact.name,
      contact.email,
      contact.company || '',
      contact.role,
      contact.notes || '',
      contact.event_tag || '',
      format(new Date(contact.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `networking-contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredData.length} contacts`);
  }

  function getFilteredContacts() {
    return contacts.filter(contact => {
      const matchesSearch = searchTerm === '' || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesRole = roleFilter === 'All' || contact.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }

  const filteredContacts = getFilteredContacts();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Networking Contacts
            </CardTitle>
            <CardDescription>
              {contacts.length} total contacts captured
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchContacts} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {roleOptions.slice(1).map(role => {
            const count = contacts.filter(c => c.role === role).length;
            return (
              <div key={role} className="text-center p-3 bg-secondary/20 rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{role}</div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {contacts.length === 0 ? 'No contacts yet' : 'No contacts match your filters'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map(contact => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <a 
                        href={`mailto:${contact.email}`} 
                        className="text-maroon hover:underline"
                      >
                        {contact.email}
                      </a>
                    </TableCell>
                    <TableCell>{contact.company || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{contact.role}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {contact.notes || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(contact.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(contact.id)}
                        disabled={deleting === contact.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
