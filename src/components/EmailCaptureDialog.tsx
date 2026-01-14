import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Mail } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackId: string;
  trackTitle: string;
  downloadLink: string;
}

export function EmailCaptureDialog({
  open,
  onOpenChange,
  trackId,
  trackTitle,
  downloadLink,
}: EmailCaptureDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke('capture-download-email', {
        body: {
          email: data.email.toLowerCase(),
          trackId,
          trackTitle,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      
      if (result.error) {
        if (result.error.includes('Too many requests')) {
          toast.error('Too many attempts. Please try again later.');
          return;
        }
        throw new Error(result.error);
      }

      toast.success('Thanks! Your download is starting.');
      triggerDownload();
    } catch (error) {
      console.error('Error capturing email:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDownload = () => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = downloadLink;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-maroon" />
            Free Download
          </DialogTitle>
          <DialogDescription>
            Enter your email to download <strong>{trackTitle}</strong>. We'll occasionally 
            send you updates about new resources and opportunities.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="your@email.com"
                        className="pl-10"
                        type="email"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="maroon" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Download Now'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
